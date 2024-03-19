import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {createPlaylist,getUserPlaylists,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,updatePlaylist,getPlaylistById} from "../controllers/playlist.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/").post(createPlaylist);

router.route("/user/:userId").get(getUserPlaylists)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

router.route("/:playlistId")
    .delete(deletePlaylist)
    .patch(updatePlaylist)
    .get(getPlaylistById)


export default router;