import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"


// const bodyParser = require('body-parser');



const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}))

app.use(express.json({
    limit: '16kb'
}))

app.use(express.urlencoded({extended: true}))


app.use(cookieParser())

// const bodyParser = require('body-parser');

// // Use body-parser with explicit 'extended' option
// app.use(bodyParser.urlencoded({ extended: true })); 

//routes import

import userRouter from './routes/user.routes.js'

// routes declaration

app.use("/api/v1/users",userRouter)


export {app}