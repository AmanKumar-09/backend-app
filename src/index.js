// require('dotenv').config({path: './env'})

import dotenv from "dotenv";
dotenv.config({
  path: './env'
})

/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express()
*/

import connectDB from "./db/index.js";



connectDB()


/*
( async ()=>{
    try{
         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
         app.on("error",(error)=>{
            console.log("ERROR express ", error)
            throw error
         })
          
          app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on the port ${process.env.PORT}`);
          })

    } catch(error){
        console.error("DB got an error aman ",error);
        throw error
    }
})();

*/
