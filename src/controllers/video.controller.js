import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose,{isValidObjectId} from "mongoose";
import {Video} from "../models/Video.model.js";
import { uploadCloudinary,deleteCloudinary} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req,res)=>{
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query;

    //convert limit from string to int so that it can be used for calculation.

    // const sortOption = {};//create empty object

   

    const queryOption = {};
    if(query){
        queryOption.$or[
            {title:{$regex:query, option:"i"}},
            {description:{$regex:query,option:"i"}}
            //$regex in MongoDB is { field: { $regex: pattern } }Here, field is the field in the document you want to match against i.e(username,avatar,fullName), and pattern is the regular expression pattern you want to use for matching.(query pattern, params pattern, text pattern)
            //$options: "i" means matching will be (case-insensitive).
        ]
    }

    
        const result = await Video.aggregate([
            {
                $match:{
                    ...queryOption,
                    owner:new mongoose.Types.ObjectId(userId)
                    //mongoose did not work in aggregation!(watch in user.controller) you and also write it like owner:new mongoose.Types.ObjectId( req.user._id)
                }
            },
            {
               $sort:{sortBy:sortType == "desc"? -1 : 1 }
               //sortBy is depending upon sortType(if sortType is descending order it is -1 and if it is ascending order it is 1)
            },
            {
                $skip: (page - 1) * limit
                // For example, if limit is 10 , and page is 2, then (2 - 1) * 10 = 10. This means you need to skip the first 10 documents to get to the second page.
            },
            {
                $limit:parseInt(limit) //limit = 10 from query i.e 10 videos will be shown per page
            },
         
        ])

        return res.status(200)
        .json(new ApiResponse(201,{result},"All Video Reached Successfully"))
        
   
    
})




const publishVideo = asyncHandler(async (req,res)=>{
    const {title,description} = req.body;
    const UserId = req.user._id;

    const videoLocalPath = req.files?.videoFile[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"Local-Video is required")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400,"local Thumbnail is required")
    }

    const videoFile = await uploadCloudinary(videoLocalPath)
    if(!videoFile){
        throw new ApiError(400,"Video is required for cloudinary")
    }

    const thumbnail = await uploadCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(400,"thumbnail is required for cloudinary")
    }


    const uploadVideo = await Video.create({
        title,
        description,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration:videoFile.duration,
        owner: UserId
    })
    if(!uploadVideo){
        throw new ApiError(500,"video Upload MongoDB Error")
    }

    return res.status(200)
    .json(new ApiResponse(201,{uploadVideo},"video Uploaded Successfully"))

})




const getVideoById = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    //req.params look like e.g(GET /videos/5fe20ef93cb8144c443f127c HTTP/1.1)
    if(!videoId){
        throw new ApiError(400,"invalid Video ID")
    }


    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video byID Not Found")
    }

    return res.status(200)
    .json(new ApiResponse(201,{video},"video find Success"))

})




const updateVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    //if i want to update specific resources not all of them then req.params
    if(!videoId){
        throw new ApiError(400,"invalid videoID")
    }
    const {title,description} = req.body;
    
    const thumbnailLocalPath = req.file?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail not found in localPath")
    }

    const findVideo = await Video.findById(videoId);
    if(!findVideo){
        throw new ApiError(400,"old video not found")
    }
    
    const oldThumbnail = findVideo.thumbnail
    if(!oldThumbnail){
        throw new ApiError(400,"old thumbnail not found")
    }

    if(oldThumbnail){
        await deleteCloudinary(oldThumbnail)
    }

    

    const thumbnail = await uploadCloudinary(thumbnailLocalPath);
    if(!thumbnail){
        throw new ApiError(400,"thumbnail not found in cloudinary")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,{
            $set:{
                thumbnail:thumbnail.url,
                title:title,
                description:description
            }
        },
        {
            new:true
        }
    )

    return res.status(200)
    .json(new ApiResponse(201,{video},"video updated successfully"))
})




const deleteVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"video ID is not Valid")
    }

    const findVideo = await Video.findById(videoId);
    if(!findVideo){
        throw new ApiError(400,"video is not founded in MongoDB")
    }

    /*         valid user delete video
    If the owner field in your video model directly holds the user ID, 
    just like in video model
    then owner.toString() would be correct.
    And if the code is like
    owner: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }
    In this case, owner is a nested object containing an _id field holding the user ID, and you should use owner._id.toString() to compare it with req.user._id.toString().
    */
    if(findVideo.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"You are not allowed to delete this video")
    }
    //delete video
   if(findVideo.videoFile){
    await deleteCloudinary(findVideo.videoFile)
   }

   //delete thumbnail
   if(findVideo.thumbnail){
    await deleteCloudinary(findVideo.thumbnail.public_id)
   }

    return res.status(200)
    .json(new ApiResponse(201,{},"video deleted success"))
})




const togglePublishStatus = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"video ID is not Valid")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"you are not allowed to change Toggle")
    }

    video.isPublished = !video.isPublished //change isPublished:true to false and vise versa

    //save in MongoDB and validate is saying that there are some required:true fields so dont do any thing if they are not given during this process.
    const saveChanges = await video.save({validateBeforeSave : false})

    if(!saveChanges){
        throw new ApiError(400,"change completion failed!!!")
    }

    return res.status(200)
    .json(new ApiResponse(201,{saveChanges},"video Toggled successfully"))

})



export {getAllVideos,publishVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus};