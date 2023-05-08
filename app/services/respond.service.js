module.exports = function respond(res, statusCode, data){
    res.status(statusCode).json(data);
}