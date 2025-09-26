
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs'
dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary=async (localpath)=>{
  try{
    if(!localpath) return null

  const response=await  cloudinary.uploader.upload(localpath, {resource_type:"auto"})
  console.log(response);
  console.log('file uploaded', response.url);
    return response;
  }
  catch(error){
    fs.unlinkSync(localpath)
   console.error('Upload failed:', error.message);

    return null
  }
}
export default cloudinary;

