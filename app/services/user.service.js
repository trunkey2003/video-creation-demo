const userModel = require('../models/user.model');
const respond = require('../services/respond.service');
const jwt = require('jsonwebtoken');


class userService {
    readCookieToken(req, res){
        const token = req.cookies.token;
        if (token) {
            return jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        }
        return null;
    }

    respondCookieToken(res, token, maxAge) {
        res.cookie('token', token, {
            sameSite: 'none',
            secure: true,
            httpOnly: true,
            maxAge: maxAge,
            path: '/'
        });
    }

    generateToken(user) {
        const data = {};
        data._id = user._id;
        data.userName = user.userName;
        data.type = user.type;
        return jwt.sign(data, process.env.TOKEN_SECRET_KEY);
    }

}

module.exports = new userService;