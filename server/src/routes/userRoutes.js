import express from 'express';
import { updateMyProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// PUT /api/users/profile — Update logged-in user's profile
router.put('/profile', protect, updateMyProfile);

export default router;
