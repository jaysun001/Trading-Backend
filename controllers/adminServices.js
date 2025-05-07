const User = require("../models/User");
const generateInvitationCode = require("../utils/generateInvitationCode");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  try {
    const { name, email, balance } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
        success: false,
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
        success: false,
      });
    }

    if (!balance) {
      return res.status(400).json({
        message: "Balance is required",
        success: false,
      });
    }

    const userExists = await User.findOne({
      email: email,
    });

    if (userExists) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    //Generating an Invitation code
    let invitationCode = await generateInvitationCode(name);

    if (!invitationCode) {
      return res.status(400).json({
        message: "Couldnot generate the invitation code",
        success: false,
      });
    }

    let existingInvitationCode = await User.findOne({
      invitationCode,
    });

    while (existingInvitationCode) {
      invitationCode = await generateInvitationCode(name);

      existingInvitationCode = await User.findOne({
        invitationCode,
      });
    }

    const newUser = await User.create({
      name,
      email,
      walletBalance: balance,
      invitationCode,
    });

    const userPayload = {
      name: newUser.name,
      email: newUser.email,
      walletBalance: newUser.walletBalance,
      id: newUser._id,
      invitationCode: newUser.invitationCode,
    };

    return res.status(201).json({
      message: "User created successfully",
      success: true,
      data: userPayload,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal Server Error, couldnot create user",
      success: false,
    });
  }
};

exports.updateBalance = async (req, res) => {
  try {
    const { email, balance } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    if (!balance) {
      return res.status(400).json({
        message: "balance is required",
        success: false,
      });
    }

    const userExists = await User.findOne({
      email: email,
    });

    if (!userExists) {
      return res.status(404).json({
        message: "User doesnot exists, please create one",
        success: false,
      });
    }

    const updatedBalance = userExists.walletBalance + balance;
    //query and updating the wallet balance

    const updatingBalance = await User.findOneAndUpdate(
      { email }, // filter
      { $set: { walletBalance: updatedBalance } }, // update
      { new: true } // options: return the updated doc
    );

    return res.json({
      message: "wallet updated successfully",
      success: true,
      updatedBalance: updatingBalance.walletBalance,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal Server Error, couldnot updateBalance",
      success: false,
    });
  }
};

exports.findUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const userExists = await User.findOne({
      email: email,
    });

    if (!userExists) {
      return res.status(404).json({
        message: "User doesnot exists",
        success: false,
      });
    }

    const userPayload = {
      name: userExists.name,
      email: userExists.email,
      walletBalance: userExists.walletBalance,
      id: userExists._id,
      invitationCode: userExists.invitationCode,
      isActive: userExists.isActive,
    };

    return res.json({
      message: "User found successfully",
      success: true,
      data: userPayload,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "Development") {
      console.log("error in findUser controller -->", error);
    }
    return res.status(500).json({
      message: "Internal Server Error, could not find user",
      success: false,
    });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
        field: "userId",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required",
        success: false,
        field: "newPassword",
      });
    }

    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        success: false,
        field: "newPassword",
      });
    }

    // Find the user - pass userId directly, not as an object
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "You cannot update password of an admin",
        success: false,
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
      data: {
        email: updatedUser.email,
        name: updatedUser.name,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("Error in updateUserPassword controller -->", error);
    }
    return res.status(500).json({
      message: "Internal Server Error, could not update password",
      success: false,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting options
    const sortBy = req.query.sortBy || "createdAt"; // Default sort by creation date
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // Default sort order is descending
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Filtering options
    const filterOptions = {};

    // Filter by role if provided
    if (req.query.role && ["user", "admin"].includes(req.query.role)) {
      filterOptions.role = req.query.role;
    }

    // Filter by active status if provided
    if (req.query.isActive && ["true", "false"].includes(req.query.isActive)) {
      filterOptions.isActive = req.query.isActive === "true";
    }

    // Search by name or email if provided
    if (req.query.search) {
      filterOptions.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Get total count for pagination metadata
    const totalCount = await User.countDocuments(filterOptions);

    // Find users with pagination, sorting and filtering
    const users = await User.find(filterOptions)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select("-password -refreshToken"); // Exclude sensitive fields

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    if (users.length === 0) {
      return res.status(200).json({
        message: "No users found",
        success: true,
        data: [],
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: totalPages,
          hasNextPage,
          hasPrevPage,
        },
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      count: users.length,
      data: users,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("Error in getAllUsers controller -->", error);
    }
    return res.status(500).json({
      message: "Internal Server Error, could not fetch users",
      success: false,
    });
  }
};

exports.getAdminDetails = async (req, res) => {
  try {
    // Get admin ID from authenticated user in request
    const adminId = req.user.sub;

    if (!adminId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Find the admin user by ID
    const admin = await User.findById(adminId);

    // Check if user exists and is an admin
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Not an admin account.",
        success: false,
      });
    }

    // Prepare admin data payload (excluding sensitive information)
    const adminData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };

    return res.status(200).json({
      message: "Admin details fetched successfully",
      success: true,
      data: adminData,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("Error in getAdminDetails controller -->", error);
    }
    return res.status(500).json({
      message: "Internal Server Error, could not fetch admin details",
      success: false,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    // Check if ID format is valid for MongoDB
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid user ID format",
        success: false,
      });
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalance: user.walletBalance,
      invitationCode: user.invitationCode,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      crdScore: user.crdScore,
      nationality: user.nationality,
    };

    return res.status(200).json({
      message: "User found successfully",
      success: true,
      data: userData,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("Error in getUserById controller -->", error);
    }
    return res.status(500).json({
      message: "Internal Server Error, could not fetch user details",
      success: false,
    });
  }
};
