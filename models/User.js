const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    crdScore: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    nationality: {
      type: String,
      required: false,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    isRegistered: {
      type: Boolean,
      default:false
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    invitationCode: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
