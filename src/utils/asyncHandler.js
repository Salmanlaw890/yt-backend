//promise method
//asyncHandler is a high order fun.
//Her this code helps us not to use try-catch every time when a file has
//a lot of try-catch we just import this file into that and we do don not 
//need to write try-catch in that. 
const asyncHandler = (reqHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(reqHandler(req,res,next))
        .catch((error)=>next(error))
    }
}

export {asyncHandler};


//try catch method
// const asyncHandler = (fun)=> async(req,res,next)=>{ //next is middleware
//     try {
//         await fun(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message:error.message
//         })
        
//     }
// }
















// const asyncHandler  = ()=>{} //basic
// const asyncHandler = ()=>{ ()=>{} } //highOrder i.e function inside function
// const asyncHandler = () => ()=>{} //we can also write above function like this