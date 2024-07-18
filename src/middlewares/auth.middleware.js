import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async( req, _, next) =>{

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    //findbyid _id is generateaccesstoken _id
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            // frontend discussion - talking about it in 17th lec+
            // we will use access token here 
            throw new ApiError(401, "Invalid access token")
    
        }
        
        // addingreq user.user here 
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token ")
    }
})