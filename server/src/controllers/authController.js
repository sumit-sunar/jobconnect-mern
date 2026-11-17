import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../middleware/asyncHandler.js';

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide name, email, and password',
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid email address',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password must be at least 6 characters long',
    });
  }

  if (role && role.toLowerCase() === 'admin') {
    return res.status(400).json({
      status: 'fail',
      message: 'Public registration as admin is not permitted',
    });
  }

  const validRoles = ['jobseeker', 'employer'];
  const userRole = role ? role.toLowerCase() : 'jobseeker';
  if (!validRoles.includes(userRole)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Role must be either jobseeker or employer',
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      status: 'fail',
      message: 'Email is already registered',
    });
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: userRole,
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    status: 'success',
    token,
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide email and password',
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
});
