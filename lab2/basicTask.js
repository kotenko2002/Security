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

  const info = JSON.parse(body);
  console.log("step #1:", info);

  const createUser = {
    method: "POST",
    url: `https://${process.env.BASIC_DOMAIN}/api/v2/users`,
    headers: {
      "content-type": "x-www-form-urlencoded",
      Authorization: `Bearer ${info.access_token}`,
    },
    form: {
      email: "kotenkoD01@gmail.com",
      given_name: "Dmytro",
      family_name: "Kotenko",
      name: "Dmytro Kotenko",
      nickname: "kotenkoD01",
      connection: "Username-Password-Authentication",
      password: "kotenkoD01",
    },
  };

  request(createUser, function (error, response, body) {
    if (error) {
      console.log("error in step #2:", error);
      return;
    }

    console.log("step #2:", JSON.parse(body));
  });
});
