import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  toggleSubscription,
  getChannelSubscriberList,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT); //to all routes

router.route("/channel/:channelId")
    .get(getChannelSubscriberList)
    .post(toggleSubscription)

router.route("/user/:subscriberId").get(getSubscribedChannels)

export default router;
