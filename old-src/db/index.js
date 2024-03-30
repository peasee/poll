"use strict";

const redis = require("redis");
const client = redis.createClient();
client.connect();

module.exports = client;