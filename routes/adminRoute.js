const router = require("express").Router();
const { isVerified, isAdmin } = require("../middlewares/Auth");
const {
  createUser,
  updateBalance,
  findUser,
  updateUserPassword,
  getAllUsers,
    getAdminDetails,
  getUserById
} = require("../controllers/adminServices");
// User management routes
router.post("/createUser", isVerified, isAdmin, createUser);
router.patch("/updateBalance", isVerified, isAdmin, updateBalance);
router.get("/findUser", isVerified, isAdmin, findUser);
router.patch("/updatePassword", isVerified, isAdmin, updateUserPassword);
// Admin information routes
router.get("/adminDetails", isVerified, isAdmin, getAdminDetails);
router.get("/users", isVerified, isAdmin, getAllUsers);
router.get("/user/:userId", isVerified, isAdmin, getUserById);

module.exports = router;