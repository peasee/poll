"use strict";

module.exports = function loadSourceIP(req, res, next) {
    req.sourceIP = req.headers["cf-connecting-ip"] || req.socket.remoteAddress;
    return next();
}