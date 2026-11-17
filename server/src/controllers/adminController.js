import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * @route   GET /api/admin/stats
 * @desc    Aggregate high-level system metrics across users, jobs, applications
 * @access  Private (Admin only)
 */
export const getStats = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    userRoleCounts,
    jobStatusCounts,
    applicationStatusCounts,
    usersLast7Days,
    jobsLast7Days,
    applicationsLast7Days,
  ] = await Promise.all([
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Job.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Application.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
  ]);

  const users = { total: 0, jobseekers: 0, employers: 0, admins: 0 };
  userRoleCounts.forEach((r) => {
    users.total += r.count;
    if (r._id === 'jobseeker') users.jobseekers = r.count;
    if (r._id === 'employer') users.employers = r.count;
    if (r._id === 'admin') users.admins = r.count;
  });

  const jobs = { total: 0, open: 0, closed: 0 };
  jobStatusCounts.forEach((s) => {
    jobs.total += s.count;
    if (s._id === 'open') jobs.open = s.count;
    if (s._id === 'closed') jobs.closed = s.count;
  });

  const applications = {
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
  };
  applicationStatusCounts.forEach((a) => {
    applications.total += a.count;
    if (applications[a._id] !== undefined) {
      applications[a._id] = a.count;
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      users,
      jobs,
      applications,
      recent: {
        usersLast7Days,
        jobsLast7Days,
        applicationsLast7Days,
      },
    },
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.keyword) {
    const kwRegex = new RegExp(req.query.keyword.trim(), 'i');
    query.$or = [{ name: kwRegex }, { email: kwRegex }];
  }

  if (req.query.role && ['jobseeker', 'employer', 'admin'].includes(req.query.role)) {
    query.role = req.query.role;
  }

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.status(200).json({
    status: 'success',
    results: users.length,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
    data: users,
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid user ID format',
    });
  }

  if (!role || !['jobseeker', 'employer', 'admin'].includes(role)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid role. Must be one of: jobseeker, employer, admin',
    });
  }

  if (id === req.user._id.toString()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Admins cannot change or demote their own account role',
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid user ID format',
    });
  }

  if (id === req.user._id.toString()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Admins cannot delete their own account',
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  const userJobs = await Job.find({ postedBy: id }).select('_id');
  const userJobIds = userJobs.map((j) => j._id);

  await Application.deleteMany({
    $or: [{ applicant: id }, { job: { $in: userJobIds } }],
  });

  if (userJobIds.length > 0) {
    await Job.deleteMany({ _id: { $in: userJobIds } });
  }

  await user.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'User and related data deleted',
  });
});

export const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.keyword) {
    const kwRegex = new RegExp(req.query.keyword.trim(), 'i');
    query.$or = [{ title: kwRegex }, { company: kwRegex }, { location: kwRegex }];
  }

  if (req.query.status && req.query.status !== 'all') {
    if (['open', 'closed'].includes(req.query.status)) {
      query.status = req.query.status;
    }
  }

  const [total, jobs] = await Promise.all([
    Job.countDocuments(query),
    Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
    data: jobs,
  });
});

export const updateJobStatusAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid job ID format',
    });
  }

  if (!status || !['open', 'closed'].includes(status)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid status. Must be "open" or "closed"',
    });
  }

  const updatedJob = await Job.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).populate('postedBy', 'name email');

  if (!updatedJob) {
    return res.status(404).json({
      status: 'fail',
      message: 'Job posting not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: updatedJob,
  });
});

export const deleteJobAdmin = asyncHandler(async (req, res) => {
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

  await Application.deleteMany({ job: id });
  await job.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Job and its applications deleted',
  });
});
