// require('dotenv').config({path: './env'})
/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express()
*/

import { app } from "./app.js";

import dotenv from "dotenv";
dotenv.config({
  path: './.env'
})

import connectDB from "./db/index.js";



connectDB()
.then(() =>{
  app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is rurnning at PORT : ${process.env.PORT}`)
  })
})
.catch((error)=>{
  console.log("Mongo DB connected failed !!", error)
})


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
