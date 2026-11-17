import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';

const ALLOWED_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];

export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId, coverLetter, resumeUrl } = req.body;

  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid job ID',
    });
  }

  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({
      status: 'fail',
      message: 'Job posting not found',
    });
  }

  if (job.status !== 'open') {
    return res.status(400).json({
      status: 'fail',
      message: 'Job is closed and no longer accepting applications',
    });
  }

  if (job.postedBy.toString() === req.user._id.toString()) {
    return res.status(400).json({
      status: 'fail',
      message: 'You cannot apply to your own job posting',
    });
  }

  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: req.user._id,
  });

  if (existingApplication) {
    return res.status(409).json({
      status: 'fail',
      message: 'You have already submitted an application for this job',
    });
  }

  try {
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter: coverLetter ? coverLetter.trim() : undefined,
      resumeUrl: resumeUrl ? resumeUrl.trim() : req.user.profile?.resumeUrl,
    });

    const populatedApplication = await Application.findById(application._id).populate(
      'job',
      'title company location jobType status'
    );

    res.status(201).json({
      status: 'success',
      data: populatedApplication,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'You have already submitted an application for this job',
      });
    }
    throw err;
  }
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .sort({ createdAt: -1 })
    .populate('job', 'title company location jobType status salaryMin salaryMax');

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: applications,
  });
});

export const getApplicationsForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid job ID format',
    });
  }

  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({
      status: 'fail',
      message: 'Job posting not found',
    });
  }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Not authorized to view applications for this job',
    });
  }

  const applications = await Application.find({ job: jobId })
    .sort({ createdAt: -1 })
    .populate('applicant', 'name email profile.headline profile.skills profile.resumeUrl');

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: applications,
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid status. Allowed values are: ${ALLOWED_STATUSES.join(', ')}`,
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid application ID format',
    });
  }

  const application = await Application.findById(id).populate('job');
  if (!application) {
    return res.status(404).json({
      status: 'fail',
      message: 'Application not found',
    });
  }

  if (
    application.job.postedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      status: 'fail',
      message: 'Not authorized to update applications for this job',
    });
  }

  application.status = status;
  await application.save();

  const updatedApplication = await Application.findById(id)
    .populate('job', 'title company location')
    .populate('applicant', 'name email');

  res.status(200).json({
    status: 'success',
    data: updatedApplication,
  });
});

export const withdrawApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid application ID format',
    });
  }

  const application = await Application.findById(id);
  if (!application) {
    return res.status(404).json({
      status: 'fail',
      message: 'Application not found',
    });
  }

  if (application.applicant.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'fail',
      message: 'Not authorized to withdraw this application',
    });
  }

  await application.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Application withdrawn',
  });
});
