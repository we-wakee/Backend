import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js'



const connectDB =async ()=>{
    try{
        
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n Mongodb connection DB host ${connectionInstance.connection.host}`)
    }

    catch(error){
        console.log("MONGODB connection ERror",error);
        process.exit(1)
    }
}

export default connectDB



/*
import express from "express"

const app=express()

(async ()=>{
    try{
        await mongoose.connect(`${process.env. MONGODB_URL}/${DB_NAME}`)
        app.on("errror",(error)=>{
            console.log("ERR",error);
            throw error
        })
    }
    catch(error){
        console.log("ERROR", error)
        throw error

    }
})()

*/