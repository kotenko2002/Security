var request = require("request");
require("dotenv-expand").expand(require("dotenv").config());

const getTokenRequest = {
  method: "POST",
  url: `https://${process.env.BASIC_DOMAIN}/oauth/token`,
  headers: { "content-type": "application/x-www-form-urlencoded" },
  form: {
    client_id: process.env.BASIC_CLIENT_ID,
    client_secret: process.env.BASIC_CLIENT_SECRET,
    audience: process.env.BASIC_AUDIENCE,
    grant_type: "client_credentials",
  },
};

request(getTokenRequest, (error, response, body) => {
  if (error) {
    console.log("error in step #1:", error);
    return;
  }

  console.log(JSON.parse(body));
});
