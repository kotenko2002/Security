const { auth, UnauthorizedError } = require('express-oauth2-jwt-bearer');
require('dotenv-expand').expand(require('dotenv').config());

const addTokenFromCookieToHeadersMiddleware = (req, res, next) => {
    if (req.cookies.token) {
        req.headers.authorization = `Bearer ${req.cookies.token}`;
    }

    next();
};

const checkJwtMiddleware = auth({
    audience: process.env.AUDIENCE,
    issuerBaseURL: `https://${process.env.DOMAIN}`,
});

const unauthorizedMiddleware = (err, req, res, next) => {
    if (err instanceof UnauthorizedError) {
        res.status(401).send(
            '<p>You need to log in first. Please, <a href="/">log in</a>.</p>'
        );
    } else {
        next(err);
    }
};

module.exports = {
    addTokenFromCookieToHeadersMiddleware,
    checkJwtMiddleware,
    unauthorizedMiddleware,
};
