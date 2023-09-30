const {
    addTokenFromCookieToHeadersMiddleware,
    checkJwtMiddleware,
    unauthorizedMiddleware,
} = require('./middleware');
const { login, register, logout } = require('./service');
const path = require('path');
const request = require('request');
require('dotenv-expand').expand(require('dotenv').config());

const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//public endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/index.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/register.html'));
});
app.post('/api/login', (req, res) => login(req, res));
app.post('/api/register', (req, res) => register(req, res));

//middleware
app.use(addTokenFromCookieToHeadersMiddleware);
app.use(checkJwtMiddleware);
app.use(unauthorizedMiddleware);

//protected endpoints
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/dashboard.html'));
});
app.post('/api/logout', (req, res) => logout(req, res));

request(
    {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            audience: process.env.AUDIENCE,
            grant_type: 'client_credentials',
        },
    },
    (error, response, body) => {
        if (error) throw new Error(error);

        const info = JSON.parse(body);
        process.env.ACCESS_TOKEN = info.access_token;
    }
);

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
