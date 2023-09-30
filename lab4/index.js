//kotenkoD07@gmail.com

const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
require('dotenv-expand').expand(require('dotenv').config());

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';

function createUser(
    res,
    email,
    given_name,
    family_name,
    name,
    nickname,
    password
) {
    const createUserOptions = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/api/v2/users`,
        headers: {
            'content-type': 'x-www-form-urlencoded',
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
        form: {
            email: email,
            given_name: given_name,
            family_name: family_name,
            name: name,
            nickname: nickname,
            connection: 'Username-Password-Authentication',
            password: password,
        },
    };

    request(createUserOptions, (error, response, body) => {
        if (error) {
            console.log('createUserOptions:', error);
        }

        console.log('Created user');
        res.status(response.statusCode).send();
    });
}

app.use((req, res, next) => {
    let fulltoken = req.get(SESSION_KEY);
    if (fulltoken) {
        let token = JSON.parse(fulltoken);
        const expiresDate = new Date(token.expiresDate);
        expiresDate.setHours(expiresDate.getHours() - 1); //1hour

        const currentDate = new Date();

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('expiresDate:', expiresDate);
        console.log('currentDate:', currentDate);
        console.log(expiresDate < currentDate);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        if (expiresDate < currentDate) {
            console.log('USER_ACCESS_TOKEN', process.env.USER_ACCESS_TOKEN);
            console.log('USER_REFRESH_TOKEN', process.env.USER_REFRESH_TOKEN);
            const refreshTokenRequest = {
                method: 'POST',
                url: `https://${process.env.DOMAIN}/oauth/token`,
                headers: {
                    'content-type': 'x-www-form-urlencoded',
                    Authorization: `Bearer ${process.env.USER_ACCESS_TOKEN}`,
                },
                form: {
                    grant_type: 'refresh_token',
                    audience: process.env.AUDIENCE,
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    refresh_token: process.env.USER_REFRESH_TOKEN,
                },
            };

            request(refreshTokenRequest, (error, response, body) => {
                if (error) throw new Error(error);

                const info = JSON.parse(body);
                process.env.USER_ACCESS_TOKEN = info.access_token;
                console.log('Refreshed Token:', info.access_token);

                const now = new Date();
                const expiresDate = new Date();
                expiresDate.setSeconds(now.getSeconds() + info.expires_in);

                token = JSON.stringify({
                    token: info.access_token,
                    expiresDate: expiresDate,
                });
            });
        }

        req.token = token;
    }

    next();
});

app.get('/', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout',
        });
    }
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/register', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout',
        });
    }
    res.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const getTokensRequest = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
            audience: process.env.AUDIENCE,
            // grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
            grant_type: 'password',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            username: login,
            password: password,
            scope: 'offline_access',
            // realm: 'Username-Password-Authentication',
        },
    };

    request(getTokensRequest, (error, response, body) => {
        if (error) {
            res.status(401).send();
            return;
        }

        const status = response.statusCode;

        if (status >= 200 && status < 300) {
            const info = JSON.parse(body);

            process.env.USER_ACCESS_TOKEN = info.access_token;
            process.env.USER_REFRESH_TOKEN = info.refresh_token;
            console.log('/api/login:', info);

            const now = new Date();
            const expiresDate = new Date();
            expiresDate.setSeconds(now.getSeconds() + info.expires_in);

            res.json({ token: info.access_token, expiresDate: expiresDate });
            return;
        }

        res.status(status).send();
    });
});

app.post('/api/register', (req, res) => {
    console.log(req.body);
    createUser(
        res,
        req.body.email,
        req.body.givenname,
        req.body.familyname,
        req.body.nickname,
        req.body.name,
        req.body.password
    );
    return;
});

const getTokenRequest = {
    method: 'POST',
    url: `https://${process.env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE,
        grant_type: 'client_credentials',
    },
};

request(getTokenRequest, (error, response, body) => {
    if (error) throw new Error(error);

    const info = JSON.parse(body);
    process.env.ACCESS_TOKEN = info.access_token;
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
