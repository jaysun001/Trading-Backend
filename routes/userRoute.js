const router = require("express").Router();
const { isVerified, isUser } = require("../middlewares/Auth");

const userServices = require("../controllers/userServices");
router.get("/user-detail/:userId", isVerified, isUser, userServices.getUserDetail);
router.get("/user-wallet-balance/:userId", isVerified, isUser, userServices.getUserWalletBalance);
router.post("/create-order", isVerified, isUser, userServices.createOrder);
router.get("/open-orders", isVerified, isUser, userServices.getOpenOrders);
router.get("/closed-orders", isVerified, isUser, userServices.getClosedOrders);

module.exports = router;
