import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/User.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const obj = {};
    const videoDetails = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"totalVideos"
            }
        },
        {
            $addFields:{
                totalVideos:"$totalVideos"
            }
        },
        {
            $unwind:"$totalVideos"
        },
        {
            $group:{
                _id:"$_id",

                totalVideos:{
                    $sum:1  // it adds 1 for every document that enters this group. just like .map()iterate on each element in array and add 1
                },
                totalVideosViews:{
                    $sum:"$totalVideos.views"  //here it It find the value of the field named "views" from each document entering the group. Since there might not be a single field named "totalVideos", Mongoose ignores that part and focuses on the .views portion.
                    //For each document, it adds the 1 for each views field to a running total.
                }
                
            }
        },//at this point we are in Videos
        {
            $lookup:{
                from:"users",
                localField:"_id",
                foreignField:"_id",
                as:"totalSubscribers"
            }
        },
        {
            $addFields:{
                totalSubscribers:{//unlike videos we only have 1 subscribe field inside which subscriber are multiple so we calculate its size below in project
                    $first:"$totalSubscribers"
                }
            }
        },
        {
            $project:{
                totalVideos:1,
                totalVideosViews:1,
                totalSubscribers:{
                    $size:"$totalSubscribers.subscriber"
                }
            }
        }
    ])
    if(!videoDetails){
        obj["videoDetails"] = 0;
    }

    //Now
    const likeDetailsOfVideos = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"totalVideoLikes"
            }
        },
        {
            $unwind:"$totalVideoLikes"
        },
        {
            $group:{
                _id:null,
                totalLikes:{
                    $sum:1
                }
            }
        }
    ])
    if(!likeDetailsOfVideos){
        obj["videoDetails"] = 0;
    }

    //Now
    const likeDetailsOfComment = await Comment.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"totalCommentLikes"
            }
        },
        {
            $unwind:"$totalCommentLikes"
        },
        {
            $group:{
                _id:null,
                totalLikes:{
                    $sum:1
                }
            }
        }
    ])
    if(!likeDetailsOfComment){
        obj["videoDetails"] = 0;
    }


    //Now
    const likeDetailsOfTweet = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"totalTweetLikes"
            }
        },
        {
            $unwind:"$totalTweetLikes"
        },
        {
            $group:{
                _id:null,
                totalLikes:{
                    $sum:1
                }
            }
        }
    ])
    if(!likeDetailsOfTweet){
        obj["videoDetails"] = 0;
    }


    obj["videoDetails"] = videoDetails,
    obj["videoLikes"] = likeDetailsOfVideos ? likeDetailsOfVideos[0].totalLikes : 0;
    obj["commentLikes"] = likeDetailsOfComment ? likeDetailsOfComment[0].totalLikes : 0;
    obj["tweetLikes"] = likeDetailsOfTweet ? likeDetailsOfTweet[0].totalLikes : 0;

    return res.status(200)
    .json(new ApiResponse(201,obj,"channelDetails fetched successfully"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const video = await Video.find(
        {
            owner:req.user?._id
        }
    )
    if(!video){
        throw new ApiError(400,"channelVideos fetch error")
    }

    return res.status(200)
    .json(new ApiResponse(201,video,"channelVideos fetched successfully"))


})

export {
    getChannelStats, 
    getChannelVideos
    }