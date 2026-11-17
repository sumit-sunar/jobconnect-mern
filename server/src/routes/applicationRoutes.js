import express from 'express';
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Candidate actions (Jobseeker only)
router.post('/', protect, restrictTo('jobseeker'), applyToJob);
router.get('/mine', protect, restrictTo('jobseeker'), getMyApplications);

// Employer actions (Employer & Admin only) - /job/:jobId registered before /:id
router.get('/job/:jobId', protect, restrictTo('employer', 'admin'), getApplicationsForJob);
router.put('/:id/status', protect, restrictTo('employer', 'admin'), updateApplicationStatus);

// Withdraw application (Jobseeker only)
router.delete('/:id', protect, restrictTo('jobseeker'), withdrawApplication);

export default router;
