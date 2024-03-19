import { Router } from "express";
import { UpdateCoverImage, changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([ //this is multer code(read git docs) //filed accept and array.this is how to inject a middleware
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser) 
    //when user is registered the the code written in registerUser method in user.controller file well be executed.

//in this router the loginUser method in user.controller file well be executed
router.route("/login").post(loginUser);


//in this router first middleware will run and then the logoutUser method in user.controller file well be executed
router.route("/logout").post(verifyJWT,logoutUser)


//refreshToken Route

router.route("/refresh-token").post(refreshAccessToken)

//we use verifyJWT with things that can be done only by logIn user.
router.route("/change-password").post(verifyJWT,changeCurrentPassword)


router.route("/get-user").get(verifyJWT,getCurrentUser)

//.Patch is used for updating some fields(not all fields)in existing data.if we use .post it well create new data or update all the fields in data. 
router.route("/update-account").patch(verifyJWT,updateAccountDetails)


//we also use upload middleware to update single avatar.
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)



router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),UpdateCoverImage)


//here we use (/channel/:) b/c we are getting data from req.params(parameters i.e URL) its the syntax.the channel b/w two / is just name you can use any.
//:username means username can be dynamic i.e can be anyone(ali,ahmad,khan etc). wew use : when value is dynamic.
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)//dont write : after channel/ in postman instead write channel/name of logIn any user(salman,ahmad etc any name) 


router.route("/history").get(verifyJWT,getWatchHistory)

export default router;