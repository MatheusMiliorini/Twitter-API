const OAuth = require("oauth-1.0a");
const crypto = require("crypto");
const fs = require('fs');

const key = fs.readFileSync("keys/consumer_key.txt");
const secret = fs.readFileSync("keys/consumer_secret.txt");

const oauth = OAuth({
    consumer: {
        key,
        secret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64')
    },
})

module.exports = oauth;