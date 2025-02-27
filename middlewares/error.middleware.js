const errorMiddleware = (err, req,res,next)=>{
    try {
        let error = {...err};
        error.message = err.message;
        console.error(err);

        // mongoose bad ObjectId
        if(err.name === 'CastError'){
            const message = 'Resource Not Found';
            error = new Error(message);
            error.statusCode = 404;
        }

        // mongoose duplicate key
        if(err.name === 11000){
            const message = 'Duplicate filed value entered';
            error = new Error(message);
            error.statusCode = 400;
        }
        // mongoose validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message);
            error = new Error(message.join(', '));
            error.statusCode = 400;
        }
        res.status(error.statusCode || 500).json({sucess: false, error: error.message || 'Server Error'});
        
    } catch (error) {
        next(error);
        
    }
};

export default errorMiddleware;