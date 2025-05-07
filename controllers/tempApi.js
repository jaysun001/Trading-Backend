const User = require('../models/user')
const bcrypt = require('bcrypt')
exports.createTestUser = async (req, res) => {
    
    try {
        const { email, userType ,name,password} = req.body;
        if (!email || !userType || !name || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and userType are compulsory"
            })
        }
        
        if(userType !== "admin" && userType !== "user"){
            return res.status(400).json({
                success:false,
                message:"Invalid user type"
            })
        }

        const existingUser = await User.findOne({
            email
        })
        if (existingUser) {
            return res.status(400).json({
                message: "user already exists",
                success:false
            })
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email:email,
            role: userType,
            name,
            password:hashedPassword
        })
        return res.status(201).json({
            success:true,
            message:"Test user created successfully",
            user:newUser
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') { 
            console.log("getting error in creating test user -->",error)
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}