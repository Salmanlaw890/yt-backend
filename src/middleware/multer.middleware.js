import multer from "multer";

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp") //cb is callback to user,in which null is the error option you want to send to user along with path.
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

// const upload = multer({storage:storage})
    // in es6 js version if both names are same i.e storage the write 1 name so:
export const upload = multer({
    storage
})