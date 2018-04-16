exports.resSuccess = function(res,data){
    res.status(200).send({
        result : true,
        errorCode : 0,
        errorMsg : "",
        data : data
    });
};
  
exports.resError = function(res,err,status){
    if(!status){
        status = 500;
    }
    if(typeof err === "object"){
        return res.status(status).send({
            result : false,
            errorCode : err.errorCode || -1,
            errorMsg : err.errorMsg || err
        });
    }else{
        return res.status(status).send({
            result : false,
            errorCode : -1,
            errorMsg : err
        });
    }
};
