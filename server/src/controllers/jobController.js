import mongoose from 'mongoose';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requirements,
    responsibilities,
    company,
    location,
    jobType,
    category,
    salaryMin,
    salaryMax,
    experienceLevel,
    applicationDeadline,
  } = req.body;

  if (!title || !description || !company || !location || !jobType) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide all required fields: title, description, company, location, and jobType',
    });
  }

  const job = await Job.create({
    title: title.trim(),
    description,
    requirements: requirements || [],
    responsibilities: responsibilities || [],
    company: company.trim(),
    location: location.trim(),
    jobType,
    category: category ? category.trim() : undefined,
    salaryMin,
    salaryMax,
    experienceLevel,
    applicationDeadline,
    postedBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: job,
  });
});

export const getAllJobs = asyncHandler(async (req, res) => {
  const {
    keyword,
    location,
    jobType,
    category,
    experienceLevel,
    minSalary,
    maxSalary,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  const query = { status: 'open' };

  if (keyword && keyword.trim()) {
    const term = keyword.trim();
    query.$or = [
      { title: { $regex: term, $options: 'i' } },
      { company: { $regex: term, $options: 'i' } },
      { location: { $regex: term, $options: 'i' } },
      { category: { $regex: term, $options: 'i' } },
      { requirements: { $regex: term, $options: 'i' } },
    ];
  }

  if (location && location.trim()) {
    query.location = { $regex: location.trim(), $options: 'i' };
  }

  if (jobType) {
    query.jobType = jobType;
  }

  if (category && category.trim()) {
    query.category = { $regex: category.trim(), $options: 'i' };
  }

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  if (minSalary || maxSalary) {
    query.$and = query.$and || [];
    if (minSalary) {
      query.$and.push({
        $or: [
          { salaryMax: { $gte: Number(minSalary) } },
          { salaryMin: { $gte: Number(minSalary) } },
        ],
      });
    }
    if (maxSalary) {
      query.$and.push({
        $or: [
          { salaryMin: { $lte: Number(maxSalary) } },
          { salaryMax: { $lte: Number(maxSalary) } },
        ],
      });
    }
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sort === 'salary') {
    sortOption = { salaryMax: -1, salaryMin: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .populate('postedBy', 'name email profile.companyName profile.companyLogo');

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    total,
    data: jobs,
  });
});

export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid job ID format',
    });
  }

  const job = await Job.findById(id).populate(
    'postedBy',
    'name email profile.companyName profile.companyLogo profile.companyWebsite'
  );

  if (!job) {
    return res.status(404).json({
      status: 'fail',
      message: 'Job posting not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: job,
  });
});

export const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid job ID format',
    });
  }

  const job = await Job.findById(id);

  if (!job) {
    return res.status(404).json({
      status: 'fail',
      message: 'Job posting not found',
    });
  }

  if (job.postedBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Not authorized to update this job listing',
    });
  }

  const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedJob,
  });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid job ID format',
    });
  }

  const job = await Job.findById(id);

  if (!job) {
    return res.status(404).json({
      status: 'fail',
      message: 'Job posting not found',
    });
  }

  if (job.postedBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Not authorized to delete this job listing',
    });
  }

  await job.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Job deleted',
  });
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { postedBy: req.user._id };

  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .populate('postedBy', 'name email profile.companyName');

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: jobs,
  });
});
