import { Router } from "express";
import {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos} from "../controllers/like.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle-like/video/:videoId").post(toggleVideoLike)

router.route("/toggle-like/comment/:commentId").post(toggleCommentLike)

router.route("/toggle-like/tweet/:tweetId").post(toggleTweetLike)

router.route("/user/liked-videos").get(getLikedVideos)


export default router;