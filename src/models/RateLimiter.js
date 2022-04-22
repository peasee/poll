"use strict";

const { createHash } = require("crypto");
const ROUTE_LIMITS = {
    "PollView": Math.floor((60*1000)/6), // 6r/m
    "PollPartialView": Math.floor((60*1000)/20), // 20r/m
    "PollCreate": Math.floor((60*1000)/6), // 6r/m
    "PollVote": Math.floor((60*1000)/6) // 6r/m
};

const currentHits = {};

function hitCleanup() {
    Object.keys(currentHits).forEach(k=>{
        if(currentHits[k] + 60*1000 < Date.now()) delete currentHits[k];
    });
}

setInterval(hitCleanup, 60000);

module.exports = {
    canHit(ip, route) {
        const keyHash = createHash("sha1").update(`${ip}${route}`).digest("hex");
        return currentHits == null || currentHits[keyHash] + ROUTE_LIMITS[route] < Date.now();
    },

    hasHit(ip, route) {
        const keyHash = createHash("sha1").update(`${ip}${route}`).digest("hex");
        currentHits[keyHash] = Date.now();
    }
};