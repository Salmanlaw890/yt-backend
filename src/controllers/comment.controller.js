import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/Video.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "This video id is not valid")
    }

    const video = await Video.findById(videoId)
    if(video){
        throw new ApiError(400, "This video not in database")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            },
        },
        {
            $skip:(page - 1) * limit,
        },
        {
            $limit:parseInt(limit)
        }
    ])
    if(comments){
        throw new ApiError(400, "This comments are not in database")
    }

    return res.status(200)
    .json(new ApiResponse(201,comments[0],"All comments Reached Successfully"))


})





const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "This video id is not valid")
    }

    const userId = req.user._id
    if(!userId){
        throw new ApiError(400, "user does not exist in DB")
    }
    const {content} = req.body;


    const writeComment = await Comment.create({
        content:content,
        owner:new mongoose.Types.ObjectId(userId),
        video:new mongoose.Types.ObjectId(videoId)
    })
    if(!writeComment){
        throw new ApiError(400, "error while writing comment on video")
    }

    return res.status(200)
    .json(new ApiResponse(201,writeComment[0],"user Written comments Added Successfully"))

})




const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    if(!commentId?.trim() || !isValidObjectId(commentId)){
        throw new ApiError(400, "commentID is not valid")
    }

    const content = req.body?.content?.trim();

    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:content
            }
        },
        {
            new : true
        }
    )

    if(!updateComment){
        throw new ApiError(400, "error while updating comment on video")
    }

    return res.status(200)
    .json(new ApiResponse(201,updateComment[0]," comment UPDATING On Video Successfully"))

})




const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!commentId?.trim() || !isValidObjectId(commentId)){
        throw new ApiError(400, "commentID is not valid")
    }

    const deleteComment = await Comment.deleteOne({
        _id:commentId
    })
    if(!deleteComment){
        throw new ApiError(400, "error while DELETING comment on video")
    }

    return res.status(200)
    .json(new ApiResponse(201,{}," comment Deleted Successfully"))

})






export {getVideoComments,addComment,updateComment,deleteComment};