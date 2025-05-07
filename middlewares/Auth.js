const jwt = require("jsonwebtoken")
exports.isVerified = async (req, res, next) => {
    try {
        const accessToken= req.headers.authorization.split(" ")[1]
        if(!accessToken){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
        if (!decoded) {
            return res.status(401).json({
                success:false,
                message:"token is invalid"
            })
        }
        if(decoded.type !== "access"){
            return res.status(401).json({
                success:false,
                message:"invalid token type"
            })

        }
        req.user= decoded
        next()
    } catch (error) {
        if (process.env.NODE_ENV === 'development') { 
            console.log("getting error in isVerified middleware -->",error)
        }
        return res.status(401).json({
            success:false,
            message:"please login again"
        })
    }
}

exports.isAdmin = async (req, res, next) => {
    try {
        const user= req.user
        if(user.role !== "admin"){
            return res.status(403).json({
                success:false,
                message:"Unauthorized to access this resource"
            })
        }
        next()
    } catch (error) {
        if (process.env.NODE_ENV === 'development') { 
            console.log("getting error in isAdmin middleware -->",error)
        }
        return res.status(403).json({
            success:false,
            message:"Unable to verify Admin"
        })
    }
}



exports.isUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Unauthorised ",
      });
    }
    next();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("getting error in isUser middleware -->", error);
    }
    return res.status(403).json({
      success: false,
      message: "Unable to verify Admin",
    });
  }
};

