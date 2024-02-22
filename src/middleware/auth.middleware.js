import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";

//this middleware only verify that user is present or not using access and refresh token which is jwt tokens.
//in production_code when res is not used we write it as( _ ) 
export const verifyJWT = asyncHandler(async (req,_,next)=>{

//here req has the access of cookies.req is an express part and express is using through app.use and we also put cookieParser in app.use in app.js file so it has the access.
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
//take accessToken from cookies or remove "Bearer " in Authorization in postmen header and the remaining part is token and take that.
        if(!token){
             throw new ApiError(401,"unauthorized accessToken request")
        }
    
//now the obtained token is decoded using jwt.verify by our secret key
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

//The decoded token contains user information    
//here the _id is coming for created jwtToken in user.model 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401,"invalid userAccess Token")
        }
    
        req.user = user;
        next();
// the only user retrieved from the database. It contains information about the authenticated user, such as their user ID, username, and any other relevant data.
//req.user is costume property in express to which we are assigning data and we can also write it as req.salman
//Finally, it calls the next() function to pass control to the next middleware or route handler in the Express middleware chain.
    } catch (error) {
        throw new ApiError(401,error.message || "invalid jwt Access Token")
    }

})