import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
// import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const userlgn = await User.findById(userId);

    const accessToken = userlgn.generateAccessToken();
    
    const refreshToken = userlgn.generateRefreshToken();
    


    userlgn.refreshToken = refreshToken;
    await userlgn.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("error detail :", error)
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

//registring the new user in the database
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, fullName, password } = req.body;
  console.log("email :", email, "user id :");

  if (
    [username, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required! ");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "this email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //classic way to handle - undefined reading 0 error
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is requied in localhost");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar is required in cloud");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshTocken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regesting the user ");
  }


  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log("username :", username);

  if (!(username || email)) {
    throw new ApiError(400, "user or email is required");
  }

  // here reftesh token is empty -
  const userlgn = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!userlgn) {
    throw new ApiError(403, "User does not exist ");
  }

  const isPasswordValid = await userlgn.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "password is not valid ");
  }


  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userlgn._id);
  


  const loggedInUser = await User.findById(userlgn._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          userlgn: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );

});


// logout the user 
const logoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options) // clear cookie is method
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out "));

  
});

// making refresh access tokens 

const refreshAccessToken = asyncHandler(async (req, res)=>{

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken  // this is full token
  if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized user ")
  }

  try {
    const decodedToken = jwt.verify(
      refreshAccessToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401, "Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used ")
    }
  
    
    const options = {
      httpOnly: true,
      sescure: true
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      200,{
        accessToken,
        refreshToken: newRefreshToken
      },
      "Access Token Refreshed"
    )
  
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})



export { registerUser, loginUser, logoutUser , refreshAccessToken };
