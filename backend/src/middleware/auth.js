const {verifyToken} = require('../utils/jwt');

const ApiError = require('../utils/ApiError');

const requireAuth = (req, res, next) => {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer") ? header.slice(7) : null;

        if(!token) {
            throw new ApiError.unauthorized("No token provided");
        }

        const decoded = verifyToken(token);
        req.user = {id: decoded.id, email: decoded.email, name: decoded.name};
        next();
    } catch(err) {
        if(err.isApiError) {
            return next(err);
        }
        next(ApiError.unauthorized("Invalid token"));
    }
};

module.exports = {requireAuth};