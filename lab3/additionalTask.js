var request = require('request');
require('dotenv-expand').expand(require('dotenv').config());

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
    if (error) {
        console.log('error in step #1:', error);
        return;
    }

    const info = JSON.parse(body);
    console.log('step #1:', info);
    updatePassword(info.access_token);
});

function updatePassword(accessToken) {
    const updatePasswordOptions = {
        method: 'Patch',
        url: `https://${process.env.DOMAIN}/api/v2/users/${process.env.USER_ID}`,
        headers: {
            'content-type': 'x-www-form-urlencoded',
            Authorization: `Bearer ${accessToken}`,
        },
        form: {
            password: 'Qwerty123',
        },
    };

    request(updatePasswordOptions, (error, response, body) => {
        if (error) {
            console.log('error in step #2:', error);
            return;
        }

        console.log('step #2:', JSON.parse(body));
        console.log('Password updated successfully');
    });
}
