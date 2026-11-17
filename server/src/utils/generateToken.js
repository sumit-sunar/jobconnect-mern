import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token (JWT)
 * @param {string} userId - The user's MongoDB ObjectId
 * @param {string} role - The user's role ('jobseeker', 'employer', etc.)
 * @returns {string} - Signed JWT
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

export default generateToken;
