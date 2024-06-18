
import connectDB from './db/index.js'
import dotenv from 'dotenv'

dotenv.config({
    path: './.env'
})



connectDB()
.then(()=>{
    app.liste(process.env.PORT || 8000 , ()=>{
        console.log(`Server is on ${process.env.PORT}`);
    })
}

)
.catch((Error)=>{
    console.log('Mongo DB connection failed');
})