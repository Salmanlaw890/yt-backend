import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/User.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req,res)=>{

    const {channelId} = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"channelID IS NOt valid")
    }

    //if its a channel then its already a user
    const channel = await User.findById({
        _id:channelId
    })
    if(!channel){
        throw new ApiError(400,"This channel does not Exist")
    }

    let unSubscribe;

    const itHasSubscribed = await Subscription.findOne({
        //when a user login express puts its data into req.user and we can use it any where.
        subscriber: req.user._id,
        channel:channelId
    })
    if(itHasSubscribed){
        unSubscribe = await Subscription.findByIdAndDelete({
            subscriber:req.user._id,
            channel:channelId
        })

        if(!unSubscribe){
            throw new ApiError(400,"something went wring while unSubscribing")
        }
        
        return res.status(200)
        .json(new ApiResponse(200,unSubscribe,"unSubscribed Success"))

    }else{
        let subscribe;

        subscribe = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        if(!subscribe){
            throw new ApiError(400,"something went wring while Subscribing")
        }

        return req.status(200)
        .json(new ApiResponse(201,subscribe,"channel Subscribed success"))
    }

})




const getChannelSubscriberList = asyncHandler(async (req,res)=>{
    const {channelId} = req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError( 400, "This channel id is not valid")
    }

    const subscriber = await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(channelId?.trim())
            },
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber"
            },
            $project:{
                subscribe:{
                    userName:1,
                    fullName:1,
                    avatar:1
                }
            }
        },
       
    ])

    if(!subscriber){
        throw new ApiError( 400, "error while finding subscribers")
    }


    return res.status(200)
    .json(new ApiResponse(201,subscriber[0],"subscriber found success"))
})





const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if(!isValidObjectId(subscriberId)){
        throw new ApiError( 400, "This subscriber id is not valid")
    }

    const channelsSubscribed = await Subscription.aggregate([
        {
            //here i am subscriber and i want to find channel
            $match:{
                channel:new mongoose.Types.ObjectId(subscriberId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel"
            },
        },{
            $project:{
                userName:1,
                avatar:1
            }
        }
    ])

    if(!channelsSubscribed){
        throw new ApiError( 400, "error while finding subscribedChannel")
    }

    return res.status(200)
    .json(new ApiResponse(201,channelsSubscribed[0],"subscribedChannel found success"))

})





export {toggleSubscription,getChannelSubscriberList,getSubscribedChannels};