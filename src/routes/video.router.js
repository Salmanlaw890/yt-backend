import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router = Router();// initialize to use get,post etc.

//if we want to apply jwt middleware to all the routs. i.e it verify login user thus only login user can access all the videos.
router.use(verifyJWT);


router.route("/").get(getAllVideos)
    .post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishVideo
);

//we use : when value is dynamic. videoId can be AnyValue
router.route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch( upload.single("thumbnail"), updateVideo)


router.route("/toggle/publish/:videoId").patch(togglePublishStatus);


export default router;