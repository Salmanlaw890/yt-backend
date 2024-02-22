import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"; //fs is fileSystem used for uploading files (Read Node docs)
          

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath){
            //if file not present
            return null;
        }
        //Uploading file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto" //which type of file is uploading(image,video)
        })
        //after file uploaded
        fs.unlinkSync(localFilePath)//remove locally saved files from public/temp folder after uploading
        return response; //for user
    } catch (error) {
        fs.unlinkSync(localFilePath) //the unlink option in fs removes the locally
        //saved temporary files when uploading fails
        return null; 
    }
}

const deleteCloudinary = async (local_path)=>{
    try {
        if(!local_path){
            return null;
        }
        const deleteImage  = await cloudinary.uploader.destroy(local_path,{
            resource_type:"auto",
            invalidate:true //to clear catches data also of the deleted image
        });

        return deleteImage;
    } catch (error) {
        return null;
    }
}

export {uploadCloudinary,deleteCloudinary};