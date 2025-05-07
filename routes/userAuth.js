const router = require('express').Router()
const userAuthController = require('../controllers/userAuth')
const tempApi = require('../controllers/tempApi')
router.post('/register',userAuthController.registerUser)
router.post('/login',userAuthController.loginUser)
router.post('/refresh-token',userAuthController.refreshToken)
router.post("/test-user", tempApi.createTestUser);
module.exports = router;