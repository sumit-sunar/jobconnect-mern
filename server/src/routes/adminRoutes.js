import express from 'express';
import {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllJobsAdmin,
  updateJobStatusAdmin,
  deleteJobAdmin,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all admin routes with protect + restrictTo('admin')
router.use(protect, restrictTo('admin'));

// System statistics
router.get('/stats', getStats);

// User moderation
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Job moderation
router.get('/jobs', getAllJobsAdmin);
router.patch('/jobs/:id/status', updateJobStatusAdmin);
router.delete('/jobs/:id', deleteJobAdmin);

export default router;
