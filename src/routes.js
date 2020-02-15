const { Router } = require('express');
const axios = require('axios');
const oauth = require("./oauth");
const request = require("request");
const routes = Router();

routes.get("/twitter-login", async function (req, res) {
    const request_data = {
        url: 'https://api.twitter.com/oauth/request_token',
        method: 'POST',
        data: {}
    }

    request(
        {
            url: request_data.url,
            method: request_data.method,
            form: oauth.authorize(request_data)
        }, function (error, response, body) {
            if (error)
                return res.send("Erro! " + error);
            const oauth_token = body.split("&")[0].split("=")[1];
            return res.redirect(`https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`);
        }
    );
});

routes.get('/callback', async function (req, res) {
    let { oauth_token, oauth_verifier } = req.query;

    try {
        let response = await axios.post("https://api.twitter.com/oauth/access_token", null, {
            params: {
                oauth_token,
                oauth_verifier
            }
        });

        response = response.data.split("&");
        oauth_token = response[0].split("=")[1];
        let oauth_token_secret = response[1].split("=")[1];

        // Busca a Timeline
        let request_data = {
            url: "https://api.twitter.com/1.1/statuses/home_timeline.json",
            method: "GET",
            data: {}
        }
        const tokens = {
            key: oauth_token,
            secret: oauth_token_secret
        }
        request(
            {
                url: request_data.url,
                method: request_data.method,
                form: request_data.data,
                headers: oauth.toHeader(oauth.authorize(request_data, tokens))
            },
            function (error, response, body) {
                if (body)
                    res.send(body);
                else
                    res.send("Error!");
            }
        );
    } catch (e) {
        return res.json({
            "error": e.response.data
        })
    }
});

module.exports = routes;