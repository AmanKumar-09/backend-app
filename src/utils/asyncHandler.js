import { response } from "express"

const asyncHandler = async (requestHandler) => {
    (req , res, next)=>{
        Promise.resolve(requestHandler).catch((err) =>
        next(err))
    }
}

export {asyncHandler}

/*  try catch approach
const asyncHandler1 = (fun) => async(req, res, next) =>{
    try {
        await fun(req, res , next)
    } catch(error){
        res.status(err.code || 500).json({
            successs: false,
            message: err.message
        })
    }
}

*/