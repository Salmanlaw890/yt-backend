import mongoose,{Schema} from "mongoose";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        userName:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true, //remove extra spaces
            index:true //helps in SEO of user, saves in DB searching,Read it..
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String, //cloudinary url service
            required:true,
        },
        coverImage:{
            type:String, //cloudinary url service
        },
        watchHistory:[
            {
            type:Schema.Types.ObjectId,
            ref:"Video"
            }  
        ],
        password:{
            type:String,
            required:[true,"Password is Required"],
            unique:true
        },
        refreshToken:{
            type:String
        }
    },{timestamps:true});



//pre is a mongoose hook which does something before.it takes two parameters 
//1)before what work it should run i.e(on_save,delete,update)
//2)what should be done

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next(); //if password
//field is not changed,do not run below line
    this.password = await bcrypt.hash(this.password,10)
    next()
//there is a problem with next,it runs after every change(username,avatar,etc)thus it well 
//change password after changing any field but we want only with password change so we used if condition above

//here function is uses for using (this)keyword b/c js does not have 
//access to above all data(password),next is used b/c it is middleware
    
})


//mongoose allow to create costume methods
userSchema.methods.isPasswordCorrect = async function(password){
    //bcrypt can hash as well as check password correctness
    return await bcrypt.compare(password,this.password) //here first pass is by user and 2nd this.pass is the encrypted by bcrypt
}

//another method costume access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        //jwt has sign method which creates token.it takes 3 info 1st data  
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },//2nd access_token
    process.env.ACCESS_TOKEN_SECRET,
    //3rd access_expiry in object context
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )};

    // same refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign( {

        _id:this._id
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )};



export const User = mongoose.model("User",userSchema);
// this User can be used in many ways i.e if we want ot check of user already exist in db so we import it in in that file in which we write check code and use it.