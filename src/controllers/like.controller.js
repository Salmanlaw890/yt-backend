import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id
    if(!isValidObjectId(videoId) && !isValidObjectId(userId)){
        throw new ApiError(400,"videoID or UserId IS NOt valid")
    }

    //find if like already exist
    const videoLike = await Like.findOne(videoId);
    if(!videoLike){
        throw new ApiError(400,"like video does not exist in DB")
    }

    if(videoLike){
        const disLikeVideo = await Like.findByIdAndDelete(videoId)
        if(!disLikeVideo){
            throw new ApiError(400,"error while disliking video")
        }
 
    }else{
        const createVideoLike = await Like.create({
            video:videoId,
            likedBy:userId
        })
        if(!createVideoLike){
            throw new ApiError(400,"error while liking video")
        }
    }

    return res.status(200)
    .json(new ApiResponse(201,createLike,"toggle VideoLike Success"))
   
})




const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id
    if(!isValidObjectId(commentId) && !isValidObjectId(userId)){
        throw new ApiError(400,"commentID or UserId IS NOt valid")
    }

    //find if comment is liked already
    const commentLike = await Like.findOne(commentId);

    if(commentLike){
        const disLikeComment = await Like.findByIdAndDelete(commentId)
        if(!disLikeComment){
            throw new ApiError(400,"error while DisLiking comment")
        }

    }else{
        const createCommentLike = await Like.create({
            comment:commentId,
            likedBy:userId
        })
        if(!createCommentLike){
            throw new ApiError(400,"error while liking comment")
        }
    }

    return res.status(200)
    .json(new ApiResponse(201,createCommentLike,"toggle comment Like Success"))
})





const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id
    if(!isValidObjectId(tweetId) && !isValidObjectId(userId)){
        throw new ApiError(400,"commentID or UserId IS NOt valid")
    }

    //find tweet like already exist
    const tweetLike = await Like.findOne(tweetId);

    if(tweetLike){
        const disLikeTweet = await Like.findByIdAndDelete(tweetId)
        if(!disLikeTweet){
            throw new ApiError(400,"error while DisLiking Tweet")
        }

    }else{
        const createTweetLike = await Like.create({
            tweet:tweetId,
            likedBy:userId
        })
        if(!createTweetLike){
            throw new ApiError(400,"error while liking Tweet")
        }
    }

    return res.status(200)
    .json(new ApiResponse(201,createTweetLike,"toggle Tweet Like Success"))

})





const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if(!isValidObjectId(userId)){
        throw new ApiError(400," UserId IS Not valid")
    }

    const getUserLikedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"LikedVideos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"VideoOwner",
                            pipeline:[
                                { //this get user info to show with video
                                    $project:{
                                        userName:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },//here the user join is finished and below we goes back to video model
                    {
                        $unwind: "$videoOwner", // Unwind(separate videoOwners if multiple) owner array (assuming one owner) 
                    },
                    {
                       $project:{
                        _id:1,//video id
                        videoOwner:1 //info of that user(what we took in above project)
                       }
                    }
                ]
            },
        },
        {
            $project:{//id is excluded and only the video is shown it final
                _id:0,
                LikedVideos:1
            }
        }
    ])

    if(!getUserLikedVideos){
        throw new ApiError(400,"error while getting UserLikedVideos")
    }

    return res.status(200)
    .json(new ApiResponse(201,getUserLikedVideos[0],"getting UserLikedVideos Success"))
    
})




export {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos};