const jwt = require("jsonwebtoken");
const User = require('../models/User')
/**
 * Verify a refresh token and extract user data
 *
 * @param {String} refreshToken - The refresh token to verify
 * @returns {Object} Decoded token payload with user information
 */
const verifyRefreshToken = (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  try {
    // Check for required environment variables
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error(
        "JWT_REFRESH_SECRET is not defined in environment variables"
      );
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"], // Restrict to specific algorithm
    });

    // Additional validation checks
    if (!decoded.sub) {
      throw new Error("Invalid token: Missing user identifier");
    }

    if (!decoded.jti) {
      throw new Error("Invalid token: Missing token identifier");
    }

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token: Invalid token type");
    }

      
    // Check token age - optional additional security measure
    const tokenAge = Date.now() / 1000 - decoded.iat;
    const maxAge = process.env.JWT_REFRESH_MAX_AGE_SECONDS || 7 * 24 * 60 * 60; // Default 7 days

    if (tokenAge > maxAge) {
      throw new Error("Token has exceeded maximum allowed age");
    }

      try {
          const tokenUser = await User.findById(decoded.sub);
          if (!tokenUser) {
              
            throw new Error("User not found");
          }
          if(tokenUser.refreshToken !== refreshToken){
            throw new Error("Invalid refresh token");
          }
          
          return true;
      } catch (error) {
          return false;
      }
   
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Refresh token has expired");
      } else {
        throw new Error("Invalid refresh token");
      }
    }
      return false;
      throw error;
  }
};

module.exports = verifyRefreshToken;
