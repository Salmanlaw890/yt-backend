import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import userRouter from "./routes/user.router.js";

//router declaration
//normally we use app.get but as router is in another file.

// when the user search user in browser, normally here (req,res)is written but we are directing it to router file and there we use the (req,res)and all other code.

//http://localhost/api/v1/users it will be the fix url and after /user of he write /register then he will be redirected to that page if another the he will be directed to that page which are in router folder.

/* we write /api b/c we are creating an (api)and /v1 is 
version:1 latter if we upgrade it then it becomes v2 */
app.use("/api/v1/users",userRouter)

export {app};