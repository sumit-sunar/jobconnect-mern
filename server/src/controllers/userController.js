import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * Simple URL validation regex — covers http(s)://...
 */
const isValidUrl = (str) => /^https?:\/\/.+/i.test(str);

/**
 * @route   PUT /api/users/profile
 * @desc    Update the authenticated user's profile
 * @access  Private (any authenticated user)
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = {};

  // Top-level: name
  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (name.length < 2) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name must be at least 2 characters long',
      });
    }
    allowedFields.name = name;
  }

  // Build profile sub-document updates
  const profileUpdates = {};

  const { profile } = req.body;
  if (profile && typeof profile === 'object') {
    // String fields
    const stringFields = ['headline', 'bio', 'location'];
    for (const field of stringFields) {
      if (profile[field] !== undefined) {
        profileUpdates[`profile.${field}`] = String(profile[field]).trim();
      }
    }

    // skills — array of strings
    if (profile.skills !== undefined) {
      if (!Array.isArray(profile.skills)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Skills must be an array of strings',
        });
      }
      profileUpdates['profile.skills'] = profile.skills
        .map((s) => String(s).trim())
        .filter(Boolean);
    }

    // resumeUrl — must look like a URL if provided
    if (profile.resumeUrl !== undefined) {
      const url = String(profile.resumeUrl).trim();
      if (url && !isValidUrl(url)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Resume URL must be a valid URL (starting with http:// or https://)',
        });
      }
      profileUpdates['profile.resumeUrl'] = url;
    }

    // Employer-only fields
    if (req.user.role === 'employer') {
      if (profile.companyName !== undefined) {
        profileUpdates['profile.companyName'] = String(profile.companyName).trim();
      }
      if (profile.companyWebsite !== undefined) {
        const url = String(profile.companyWebsite).trim();
        if (url && !isValidUrl(url)) {
          return res.status(400).json({
            status: 'fail',
            message: 'Company website must be a valid URL (starting with http:// or https://)',
          });
        }
        profileUpdates['profile.companyWebsite'] = url;
      }
      if (profile.companyLogo !== undefined) {
        profileUpdates['profile.companyLogo'] = String(profile.companyLogo).trim();
      }
    }
  }

  // Merge everything into one $set payload
  const updatePayload = { ...allowedFields, ...profileUpdates };

  if (Object.keys(updatePayload).length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'No valid fields provided for update',
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});
