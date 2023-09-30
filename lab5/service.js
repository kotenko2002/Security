require('dotenv-expand').expand(require('dotenv').config());
const request = require('request');

const login = (req, res) => {
    const { login, password } = req.body;

    request(
        {
            method: 'POST',
            url: `https://${process.env.DOMAIN}/oauth/token`,
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            form: {
                audience: process.env.AUDIENCE,
                grant_type: 'password',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                username: login,
                password: password,
                scope: 'offline_access',
            },
        },
        (error, response, body) => {
            if (error) {
                console.log('error while logining a user:', error);
                res.status(401).send();
                return;
            }

            const info = JSON.parse(body);

            res.cookie('token', info.access_token, {
                expires: new Date(Date.now() + 86000),
                httpOnly: true,
            });
            process.env.USER_ACCESS_TOKEN = info.access_token;
            process.env.USER_REFRESH_TOKEN = info.refresh_token;

            res.status(response.statusCode).send();
        }
    );
};

const register = (req, res) => {
    request(
        {
            method: 'POST',
            url: `https://${process.env.DOMAIN}/api/v2/users`,
            headers: {
                'content-type': 'x-www-form-urlencoded',
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            },
            form: {
                email: req.body.email,
                given_name: req.body.givenname,
                family_name: req.body.familyname,
                name: req.body.name,
                nickname: req.body.nickname,
                connection: 'Username-Password-Authentication',
                password: req.body.password,
            },
        },
        (error, response, body) => {
            if (error) {
                console.log('error while creating a user:', error);
            }

            console.log('Created user status:', response.statusMessage);
            res.status(response.statusCode).send();
        }
    );
};

const logout = (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0),
        httpOnly: true,
    });

    res.status(200).send();
};

module.exports = {
    login,
    register,
    logout,
};
