class ApiError extends Error{ //class is a specific keyword in js and extends Error is is refer to Error in nodejs(read Error in nodejs documentation)
    constructor(//here we write constructor
    statusCode,
    message="Something Went Wrong",
    errors = [],
    stack = ""

    ){//here we overwrite constructor
        super(message)//super is must once
        this.statusCode = statusCode //the first is the constructor one and the second one is by me whatever i want to overwrite the constructor
        this.errors =  errors
        this.message = message
        this.success = false //success message well be sent false
        this.data = null
    

        if(stack){
            this.stack = stack  
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError};