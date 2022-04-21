"use strict";

const {default: axios} = require("axios");

const config = require("../../config.json");
const RECAP_SECRET_KEY = config.recapSecretKey;

async function verifyCaptcha(responseToken, targetAction) {
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAP_SECRET_KEY}&response=${responseToken}`);

    return response.data.success === true && response.data.hostname === config.host && response.data.action === targetAction && response.data.score >= 0.5;
}

module.exports = verifyCaptcha;