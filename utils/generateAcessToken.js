const jwt = require("jsonwebtoken");

/**
 * Generate an access token for authenticated users
 *
 * @param {Object} user - User object containing authenticated user data
 * @returns {String} JWT access token
 */
const generateAccessToken = (user) => {
  if (!user || !user._id) {
    throw new Error("User data is required to generate access token");
  }

  try {
    // Create payload with minimal required data
    const payload = {
      sub: user._id,
      role: user.role || "user",
      name: user.name,
      type: "access",
      // Add timestamp to prevent token reuse
      iat: Math.floor(Date.now() / 1000),
    };

    // Check for required environment variables
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error(
        "JWT_ACCESS_SECRET is not defined in environment variables"
      );
    }

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || "1m",
      algorithm: "HS256",
    });

    return accessToken;
  } catch (error) {
    console.error("Error generating access token:", error.message);
    throw error;
  }
};

module.exports = generateAccessToken;
