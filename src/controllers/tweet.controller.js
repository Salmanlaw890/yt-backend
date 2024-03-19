import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const userId = req.user._id;
    if(!content){
        throw new ApiError(500,"content is required")
    } 
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"userId is invalid")
    }

    const tweet = await Tweet.create({
        content:content,
        owner:new mongoose.Types.ObjectId(userId)
    })
    if(!tweet){
        throw new ApiError(400,"tweet creation error")
    }
    res.status(200)
    .json(new ApiResponse(201,tweet,"tweet creation successfully"))

})




const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"userId is invalid")
    }

    const getTweets = await Tweet.findOne({
        owner:new mongoose.Types.ObjectId(userId)
    })

    if(!getTweets){
        throw new ApiError(400,"user tweets getting error")
    }
    res.status(200)
    .json(new ApiResponse(201,getTweets,"user tweets getting successfully"))

})




const updateTweet = asyncHandler(async (req, res) => {
    const content = req.body?.content?.trim();
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweetId is invalid")
    }
    if(!content){
        throw new ApiError(500,"content is required")
    } 


    const tweetUpdate = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content:content
            }
        },{
            new : true
        }
    )

    if(!tweetUpdate){
        throw new ApiError(400, "error while updating tweet")
    }

    return res.status(200)
    .json(new ApiResponse(201,tweetUpdate,"Tweet UPDATING  Successfully"))
})




const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweetId is invalid")
    }

    const TweetDelete = await Tweet.findByIdAndDelete(tweetId)

    if(!TweetDelete){
        throw new ApiError(400, "error while Deleting tweet")
    }

    return res.status(200)
    .json(new ApiResponse(201,{},"Tweet Deleting  Successfully"))
})





export {createTweet,getUserTweets,updateTweet,deleteTweet};