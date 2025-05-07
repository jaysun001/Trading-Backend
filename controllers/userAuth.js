const User= require('../models/User')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const jwt= require('jsonwebtoken')
const generateAccessToken = require('../utils/generateAcessToken')
const generateRefreshToken = require('../utils/generateRefreshToken')
dotenv.config();

exports.registerUser = async (req, res) => {
    try {
        console.log("started registering")
        const { email, password, invitationCode } = req.body
        if (!email || !password || !invitationCode) {
            return res.status(400).json({
                success: false,
                message: "All the field are required"
            })
        }
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exists",
            })
        }

        if (existingUser.isRegistered) {
              return res.status(400).json({
                success: false,
                message: "You have already registered",
              });
        }
          if (existingUser.invitationCode !== invitationCode) {
            return res.status(400).json({
              success: false,
              message: "Invalid invitation code",
            });
          }

            const hashedPassword = await bcrypt.hash(password, 10)

            const updatedUser = await User.findByIdAndUpdate(existingUser._id, {
                $set:{
                    password: hashedPassword,
                    isActive: true,
                    isRegistered:true
                }
            }, { new: true })

            if (!updatedUser) {
                return res.status(400).json({
                    success: false,
                    message: "Something went wrong while updating "
                })
            }
            // const userPayload = {
            //     email:updatedUser.email,
            //     name:updatedUser.name,
            //     walletBalance:updatedUser.walletBalance,
            // }

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
            })
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log("getting error in register controller -->", error)
            }
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
    }

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:"Email and password are compulsory"
            })
        }
        const user = await User.findOne({
            email:email
        })
        if (!user) {
              return res.status(400).json({
                success: false,
                message: "User doesn't exists",
              }); 
        }
        const isPasswordValid= await bcrypt.compare(password,user.password)
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            })
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            $set:{
                isActive: true,
                refreshToken:refreshToken
            }
        }, { new: true })
            //   const dataPayload = {
            //     email: updatedUser.email,
            //     name: updatedUser.name,
            //     walletBalance: updatedUser.walletBalance,
            //     crdScore: updatedUser.crdScore,
            //     uid: updatedUser.uid,
            //   };
        return res.status(200).json({
          success: true,
          message: "User logged in successfully",
          accessToken,
          refreshToken,
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') { 
            console.log("getting error in login controller -->",error)
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
exports.refreshToken = async(req, res) => {
    try {
        const {refreshToken} = req.body;
        if(!refreshToken){
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            })
        }
        let decoded;
        try {
                decoded= jwt.verify(
                   refreshToken,
                   process.env.JWT_REFRESH_SECRET
                 );
   
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            })
        }

        if(!decoded){
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token"
            })
        }
        if(decoded.type !== 'refresh'){
            return res.status(400).json({
                success: false,
                message: "Invalid token type"
            })
        }
        
        const user = await User.findById(decoded.sub);
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        if(user.refreshToken !== refreshToken){
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token"
            })
        }
        
        const accessToken = generateAccessToken(user);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken,
            refreshToken
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') { 
            console.log("getting error in refreshToken controller -->",error)
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
// logout user

