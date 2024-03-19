import { asyncHandler } from "../utils/asyncHandler.js";
// try-catch is handel by it we just need to write code
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/User.model.js"
import {uploadCloudinary,deleteCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";
import mongoose from "mongoose";


//it is an internal method not an external db method so we dont use asyncHandler. it need user id to generate tokens for him.
                        //generate tokens
const generateAccessAndRefreshToken = (async (userId)=>{
    try {
        //first we find user to generate token for him
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        //refresh token always saves in DB
        user.refreshToken = refreshToken
        await user.save({ValidateBeforeSave:false})
        //here the user.save needs all the required:true to be given but we only using userID so we use ValidateBeforeSave:false so we are saying to it dont validate all the data just userID

        //finally we return the tokens. to end the function
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
    }
});





                        //register user
const registerUser = asyncHandler(async (req,res)=>{
   
// user data comes in request and we destructure what inside it.
const {fullName,email,userName,password} = req.body;

    if (fullName === "") {
        throw new ApiError(400,"fullName is required")
    }else if(email === "" || !email.endsWith("@gmail.com")){
        throw new ApiError(400,"enter valid email")
    }else if(password === ""){
        throw new ApiError(400,"please enter password")
    }else if(userName === ""){
        throw new ApiError(400,"userName is required")
    } 
    /* professional way of writing it is as:
    if(
        [userName,password,fullName,email]
        .some( (fields)=> fields?.trim() === "" )
      ){
        throw new ApiError(400,"All fields are required")
      }  
      */

// NOW check if user already exist using user.model.js data
const existUser = await User.findOne({
    $or:[{ userName },{ email }]
});

if (existUser) {
    throw new ApiError(409,"user already Exist")
}

//Now we check for avatar and images
//in this code req.files in multer middleware avatar[0]is the first part of avatar which is object and .path is the path of that avatar uploaded by multer in localStorage, not cloudinary that is why we name it.
//later in code in Update-avatar we did not include .avatar[0] b/c here multiple files are uploading and wew are specifying the avatar here and in later it know its an avatar so we dont use it later.
const avatarLocalPath = req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverImage[0]?.path;
let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && 
req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
}

if(!avatarLocalPath){
    throw new ApiError(400,"avatar is required")
}// cover image is not required:true.

//Now upload on cloudinary.
   const avatar =  await uploadCloudinary(avatarLocalPath);
   const coverImage = await uploadCloudinary(coverImageLocalPath);

   if (!avatar) {
        throw new ApiError(400,"avatar is required");    
   }

//Now we create user in DB using user data and cloudinary data.
  const user =  await User.create({
    fullName,
    avatar: avatar.url, //in above code we took whole response from cloudinary and we just want the url.
    coverImage:coverImage?.url || "", //we did not check coverImage above b/c it is not required:true so we say here if present give url if not give empty string.
    email:email,
    password:password,
    userName:userName.toLowerCase()
})

//Remove password and refresh tokens from response(pass and refToken are sensory data so we are not showing it to user).
const createdUser = await User.findById(user._id).select("-password -refreshToken")
// mongoDB creates an id with every user or new created field in DB so we find that user by findById method.
//the Select method selects what should not be sent. by default everything is selected and we write what should not be sent in a single string using -(mins) and SingleSpace b/w them.

if (!createdUser) {
    throw new ApiError(500,"SomeThing Went Wrong while Registering User")
}
//Send response to user about creation.
return res.status(201).json(
    // in ApiResponse three things are required.
    new ApiResponse(200,createdUser,"user Registered successfully"),
)

});




                        //login user
const loginUser = asyncHandler(async (req,res)=>{
    //take user data
   const {userName,email,password} = req.body;
    //check if user put data
    if(!(userName || email)){
        throw new ApiError(400,"userName or password is Necessary")
        }
    //check if user not exist b/c its login
    const user = await User.findOne({
        $or:[{userName},{email}]
    })
    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    //check password
    //dont use User here b/c it is mongoose word which contain findOne() etc methods but the methods that create by me i.e isPasswordCorrect is in user created by me which is with small u(user).it is in Mongodb
    //wew created it in user.models and here we just get the name of that method.
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"invalid user password")
    }

//now we need access and refresh tokens for user authorization.
//As we generated it above:
    const {accessToken,refreshToken} =  await generateAccessAndRefreshToken(user._id)

//Discuss: we use findOne method above which takes all data from user.model including unwanted info i.e password and refreshTokens. but here the refresh token is empty b/c the fondOne is called above and tokes are called here so we use findOne again with select.
//Note:make sure that Too much DB calls are not expensive.
   const loggedInUser =  await User.findById(user._id).select("-password -refreshToken")

//Now we send COOKIES. first we send options
const options = {
    httpOnly:true,
    secure:true
}
//by these options cookies are only modified by server only seen on frontend

 return res.status(200)//the first accessToken is name(string i.e specific) and the 2nd is variable and has the value and change for every user.

 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
    new ApiResponse(
        200,
        {
            user:loggedInUser,accessToken,refreshToken
        },
        "user loggedIn successfully"
    )
 )

})




                        //logout user
const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        //first find user
        req.user._id,
        {
            //delete his refresh token from DB
            $set:{refreshToken:undefined}
        },
        {
            //set the new value i.e without refreshToken will be set.
            new:true
        }
        //refreshToken is deleted from DB
    )
//Now we want to remove the cookies data also from DB.
//first take the options 
const options = {
    httpOnly:true,
    secure:true
}
//now delete cookies in response
//accessToken and refreshToken are cookies, delete it along with options.
return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User loggedOut Successfully"))

})




                        //regenerateAccessToken
const refreshAccessToken = asyncHandler(async (req,res)=>{
//first we take refresh token from user for comparing
//we can take it through cookies or if user is on mobile then req.body
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if(!incomingRefreshToken){
            throw new ApiError(401,"User RefreshToken Not Found")
        }
    
    //now verify the token
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      
    
    //now we find user data i.e refreshTokenS
        const user = await User.findById(decodedToken?._id)
        
        if (!user) {
            throw new ApiError(401,"User Not Found in incomingToken")
        }
    //now we match the incoming token with the user refreshToken we created above in generateAccessAndRefreshToken.
        if (!(incomingRefreshToken === user?.refreshToken)) {
            throw new ApiError(401,"RefreshToken Expired Or Used")
        }
    //Now we generate a new token for user
        const options ={
            httpOnly:true,
            secure:true
        }
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken:newRefreshToken},
                "Access Token Refreshed"
                )
        )
    } catch (error) {
        console.error('Error:', error);
        throw new ApiError(401,"Invalid Refresh Token Catch")
    }


})



                        //change user password
const changeCurrentPassword = asyncHandler(async (req,res)=>{
    //first we took password
    const {oldPassword,conformPassword,newPassword} = req.body;
    //then wew check which user is it
    const user = await User.findById(req.user._id)
    //then we check if password correct
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400,"password is not correct")
    }
    //now set new password
    user.password = newPassword
    if (!(newPassword === conformPassword)) {
        throw new ApiError(400,"password does not match")
    }
    //now we have to save it in DB after password is set
    user.save({ValidateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},"password Changed successfully"))
});



                        //get current user
const getCurrentUser = asyncHandler(async (req,res)=>{
    res.status(200)
    //in express the middle ware i.e jweVerify comes before the getCurrentUser handler that's why it can access the req.user.
    .json(new ApiResponse(200,req.user,"current user fetched"))
})



                        //update account details
const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName,email} = req.body;
    if(!(fullName,email)){
        throw new ApiError(200,"fullName and email is required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{fullName:fullName,email:email}
    },{
        //it returns the updated information i.e name,email
        new:true
    }).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"user info Updated success"))
})




                        //update avatar
const updateAvatar = asyncHandler(async (req,res)=>{
    //multer already upload it in localPath
    //wew dont use .avatar[0] here b/c it already know its a single avatar and also mentioned in router as well.
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(200,"avatarLocalPath is missing")
    }
      //TODO: delete the old image
      const findUser = await User.findOne(req.user._id)
    if(findUser){
        const oldAvatar = findUser.avatar;
        if(oldAvatar){
            await deleteCloudinary(oldAvatar);
        }else{
            throw new ApiError(200,"oldAvatar is missing")
        }
    }else{
        throw new ApiError(200,"user is missing")
    }
     

    const avatar = await uploadCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(200,"error while uploading avatar on cloudinary")
    }

    const user =await User.findByIdAndUpdate(req.user._id,{
        $set:{avatar:avatar.url}
    },{
        new:true
    }).select("-password")

    
    return res.status(200)
    .json(new ApiResponse(201,{user},"avatar updated success"))
 
})





                    //update cover Image
const UpdateCoverImage = asyncHandler(async (req,res)=>{
    //multer already upload it in localPath
    const coverImageLocalPath =  req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(200,"coverImageLocalPath file is missing")
    }
    //TODO: delete the old image
    const findUser = await User.findOne(req.user._id)
    if(findUser){
        const oldCover = findUser.coverImage;
        if(oldCover){
            await deleteCloudinary(oldCover);
        }else{
            throw new ApiError(200,"oldCover is missing")
        }
    }else{
        throw new ApiError(200,"user is missing")
    }


    const coverImage = await uploadCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(200,"error while uploading coverImage on cloudinary")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            set:{coverImage :coverImage.url}
        },{
            new:true
        }).select("-password")

         

        return res.status(200)
        .json(new ApiResponse(201,{user},"avatar updated success"))
})




const getUserChannelProfile = asyncHandler(async (req,res)=>{ 
    //if we want a channel data we can find it using its URL so we will get data from req.params(parameters) of url.
    const {username} = req.params;
    if(!username?.trim()){
        throw new ApiError(400,"userName does not exist")
    }

    const channel = await User.aggregate([
        {
            $match:{//find the 1 user using Name
                userName:username.toLowerCase()
            }
        },
        {
            $lookup:{//it joins the two collection i.e User and subscription
                from:"subscriptions",//connect User to Subscription.mongoDB converts name Lowercase & plural. 
                localField:"_id",//indicate user._id in User model
                foreignField:"channel",//indicate channel in Subscription model
                as:"subscribers"//save it as subscriber name b/c we are finding the subscribers of the channel.
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"//channel is also a user.he subscribed what channels.
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{//channel subscribed or not 
                    $cond:{//condition. Go to user._id, find $lookup as:subscribers in which subscriber(from subscription.model,the subscriberSchema) is present then:true if not else:false
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},//$in Goes inside
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                email:1,
                avatar:1,
                coverImage:1,
                subscribers:1,
                subscribedTo:1,
                isSubscribed:1
            }
        }

    ])

    if(!channel?.length){
        throw new ApiError(200,"channel does not exist")
    }

    return res.status(200)
    .json(
        //channel[0] means first value of array channel.
        new ApiResponse(200,channel[0],"user channel fetched successfully")
    )
})




const getWatchHistory = asyncHandler(async (req,res)=>{
//mongoDB _id is string(65b17777ae718b29cd980d18) but we want _id Like 
//ObjectId:("65b17777ae718b29cd980d18") that's why we use mongoose and when we write req.user._id mongoose convert mongoDB string ID(65b17777ae718b29cd980d18) to this form ObjectId:("65b17777ae718b29cd980d18").
//but here in aggregation mongoose does not work so we have to convert it manually.
      const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id) //manually convert

            }
        },
        {
            $lookup:{//here we are in user
                from:"videos",
                localField:"watchHistory",//in user model
                foreignField:"_id",//in videos
                as:"watchHistory",
                pipeline:[
                    //1
                    {
                        $lookup:{//here we are in video
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {//we don't want all values in user
                                    $project:{
                                        fullName:1,
                                        userName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    //2
                    {//the owner came as an array so we took only first value for easy frontend
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
      ])

      return res.status(200)
      .json(
        new ApiResponse(200,user[0].WatchHistory,"watchHistory Fetched Successfully")
      )
})


export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateAvatar,UpdateCoverImage,getUserChannelProfile,getWatchHistory};