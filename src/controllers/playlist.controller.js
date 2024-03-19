import mongoose, {get, isValidObjectId, now} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {

    const {name, description} = req.body
    const {videoId} = req.params;
    const userId = req.user._id;
    if(!name){
        throw new ApiError(500,"name is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoID is not valid")
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"userID is not valid")
    }

    const playlistCreate = await Playlist.create({
        name:name,
        description:description,
        videos:new mongoose.Types.ObjectId(videoId),
        owner:new mongoose.Types.ObjectId(userId)
    })

    if(!playlistCreate){
        throw new ApiError(400,"playlistCreation failed")
    }

    return res.status(200)
    .json(new ApiResponse(201,playlistCreate[0],"playlist Created Success"))

})




const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.user._id
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"userID is not valid")
    }

    const getPlayList = await Playlist.find({
        owner:new mongoose.Types.ObjectId(userId)
    })
    if(!getPlayList){
        throw new ApiError(400,"playlist Finding failed")
    }

    return res.status(200)
    .json(new ApiResponse(201,getPlayList[0],"playlist find Success"))


})




const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"PlaylistID is not valid")
    }

    const getPlayListById = await Playlist.findById({
        _id:new mongoose.Types.ObjectId(playlistId)
    })
    if(!getPlayListById){
        throw new ApiError(400,"playlistByID Finding failed")
    }

    return res.status(200)
    .json(new ApiResponse(201,getPlayListById,"playlistByID find Success"))


})




const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
        throw new ApiError(400,"playlistID or videoID is not valid")
    }


    const addVideo = await Playlist.updateOne(
        {_id:new mongoose.Types.ObjectId(playlistId)},
        {
            $push:{
                videos:new mongoose.Types.ObjectId(videoId)
            }
        }
    )

    if(!addVideo){
        throw new ApiError(400,"video adding failed")
    }

    return res.status(200)
    .json(new ApiResponse(201,addVideo,"video adding Success"))
})




const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
        throw new ApiError(400,"playlistID or videoID is not valid")
    }

    const removeVideo = await Playlist.updateOne(
        {_id:new mongoose.Types.ObjectId(playlistId)},
        {$pull:{
            videos:new mongoose.Types.ObjectId(videoId)
        }}
    )

    if(!removeVideo){
        throw new ApiError(400,"video deleting failed")
    }

    return res.status(200)
    .json(new ApiResponse(201,{},"video deleting Success"))
})




const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlistID is not valid")
    }

    const playlistDelete = await Playlist.findByIdAndDelete({
        _id:new mongoose.Types.ObjectId(playlistId)
    })
    
    if(!playlistDelete){
        throw new ApiError(400,"playList deleting failed")
    }

    return res.status(200)
    .json(new ApiResponse(201,{},"PlayList deleting Success"))
    
    
})




const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlistID is not valid")
    }
    if(!name){
        throw new ApiError(400,"name is required")
    }

    const playlistUpdate = await Playlist.findByIdAndUpdate(
        {_id:new mongoose.Types.ObjectId(playlistId)},
        {
            $set:{
                name:name,
                description:description
            }
        },
        {
            new:true
        }
        )

        if(!playlistUpdate){
            throw new ApiError(400,"playList updating failed")
        }
    
        return res.status(200)
        .json(new ApiResponse(201,playlistUpdate,"PlayList Updating Success"))

})






export {createPlaylist,getUserPlaylists,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,updatePlaylist,getPlaylistById}