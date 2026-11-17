import express from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
} from '../controllers/jobController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);

// Protected employer routes - registered BEFORE /:id to prevent route collision
router.get('/mine', protect, restrictTo('employer', 'admin'), getMyJobs);

// Public single job route
router.get('/:id', getJobById);

// Protected write operations (Employer and Admin only)
router.post('/', protect, restrictTo('employer', 'admin'), createJob);
router.put('/:id', protect, restrictTo('employer', 'admin'), updateJob);
router.delete('/:id', protect, restrictTo('employer', 'admin'), deleteJob);

export default router;
