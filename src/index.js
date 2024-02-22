// require('dotenv').config({path: "./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js";
dotenv.config({
    path:"./.env"
})

connectDB()
.then(()=>{
// check for error before listening
    app.on("error",(error)=>{
        console.log(`App listening error`,error);
        throw error;
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Listening On port: ${process.env.PORT}`);
    })
}).catch((error)=>{
    console.log("connectDB ERROR",error);
})














/*
const app = express();
(async ()=>{
    try {
        mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`)
        app.on("error",(error)=>{
            console.log("error is",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Listening on port ${process.env.PORT}`);
        })

    } catch (error) {
    console.error("Error is",error);
    throw error  
    }
})()
*/