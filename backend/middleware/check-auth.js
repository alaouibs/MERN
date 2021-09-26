const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }

    let token;
    try {
        token = req.headers.authorization.split(' ')[1];

        if (!token) {
            throw new HttpError('Authentification failed!', 401);
        }
        const decodedToken = jwt.verify(token, process.env.JWT_KEY)
        req.userData = {userId : decodedToken.userId};
        next();

    } catch (err) {
        const error = new Error('Authentification failed!')
        return next(error);
    }


};