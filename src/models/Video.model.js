import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFile:{
            type:String, //cloudinary url Service
            required:true
        },
        thumbnail:{
            type:String, //cloudinary url Service
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
    },{timestamps:true})

    //mongoose allows you to add your costume plugins(read in mongoose docs)
videoSchema.plugin(mongooseAggregatePaginate); // we can use mongoose aggregation queries.
//Pagination:to limit the number of records returned from a database query 
// i.e 5 videos is shown per page as i did in news-api.


export const Video = mongoose.model("Video",videoSchema)