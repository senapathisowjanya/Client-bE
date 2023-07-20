const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
require("dotenv").config();

function gridStorage(){
   let storageFS = new GridFsStorage({
    url: process.env.MONGO_URI,
    file : (req, file)=>{
        return {
            filename: file.originalname,
            bucketName:"griduploads"
        }
    }
   })
   let uploadGrid = multer({
    storage: storageFS,
   })
   return uploadGrid
}



module.exports = gridStorage