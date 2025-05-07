const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Generate a refresh token for authenticated users
 *
 * @param {Object} user - User object containing authenticated user data
 * @returns {Object} Object containing the refresh token and its expiry date
 */
const generateRefreshToken = (user) => {
  if (!user || !user._id) {
    throw new Error("User data is required to generate refresh token");
  }

  try {
    // Check for required environment variables
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error(
        "JWT_REFRESH_SECRET is not defined in environment variables"
      );
    }

    // Calculate expiration time
    const expiresIn = process.env.JWT_REFRESH_EXPIRES || "3m";

    // Generate a unique token ID to allow revocation
    const tokenId = crypto.randomBytes(16).toString("hex");

    // Create minimal payload to reduce token size
    const payload = {
      sub: user._id,
      jti: tokenId, // JWT ID for token revocation
       type:'refresh',
        iat: Math.floor(Date.now() / 1000),
    };

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: expiresIn,
      algorithm: "HS256",
    });

      return refreshToken;
      
  } catch (error) {
    console.error("Error generating refresh token:", error.message);
    throw error;
  }
};

module.exports = generateRefreshToken;
