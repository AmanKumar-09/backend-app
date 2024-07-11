import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.ClOUDINARY_CLOUD_NAME,
  api_key: process.env.ClOUDINARY_CLOUD_API,
  api_secret: process.env.ClOUDINARY_CLOUD_SECRET,
});


const uploadOnCloudinary = async(localFilePath)=>{
    try{
        if(!localFilePath) return null;
        // upload the file on cloudinary
        const  response = await cloudinary.uploader.upload(localFilePath ,{
            resource_type : "auto"
        })
        // file has been uploaded successfully
        console.log("File has uploaded on cloudinary", response.url)
        return response;
    } catch(error){
        fs.unlinkSync(localFilePath) // removes the locally save file as the upload operation on cloudinary  fails 
        return null
    }
}



export {uploadOnCloudinary}