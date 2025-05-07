const jwt = require("jsonwebtoken")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const generateAccessToken = require('../utils/generateAcessToken')
const generateRefreshToken = require('../utils/generateRefreshToken')

//login for admin 
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        //email and password validation
        if (!email ) {
            return res.status(400).json({
                message: "email is required",
                success:false
            })
        }

        if (!password) {
            return res.status(400).json({
                message: "password is required",
                success: false
            })
        }

        //whether the particular user exists or not
        const userExists = await User.findOne({
            email:email
        })

        if (!userExists) {
            return res.status(403).json({
                message: "User doesnot exist, please create an account first",
                success:false
            })
        }
        //if user exists check whether the particular role is of user or admin
        //check role
        const role = userExists.role
        if (role!="admin") {
            return res.status(401).json({
                message: "unAutorised access, user not admin",
                success:false
            })
        }

        const isPasswordValid = await bcrypt.compare(password, userExists.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Password",
                success:false
            })
        }

        //token generation part
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            $set: {
                isActive: true,
                refreshToken: refreshToken
            }
        }, { new: true })


        return res.status(200).json({
            message: "Admin logged in successfully",
            success: true,
            accessToken,
            refreshToken
       })
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error, couldnot login",
            success:false
        })
    }
}