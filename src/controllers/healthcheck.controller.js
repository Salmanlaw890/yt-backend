import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthCheck = asyncHandler(async (req, res) => {
    //TODO: build a healthCheck response that simply returns the OK status as json with a message
    const healthCheck = {
        uptime: process.uptime(),//used to find how much time is taken by server to process
        message: 'ok',
        responseTime: process.hrtime(),//used to find how much time is taken between process start and  process end point.
        timestamp: Date.now()
    };
    if(!healthCheck){
        throw new ApiError(400,"error While healthCheck")
    }

    return res.status(200)
    .json(new ApiResponse(200,{},"Server is healthy!!"));
})

export {healthCheck}