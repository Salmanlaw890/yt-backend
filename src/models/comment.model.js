import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema( 
    {
        content:{
            type:String,
            require:true
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate);
//Pagination:to limit the number of records returned from a database query 
// i.e 5 videos is shown per page as i did in news-api.

export const Comment = mongoose.model("Comment",commentSchema)