import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check route
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'JobConnect API is running',
  });
});

export default router;
