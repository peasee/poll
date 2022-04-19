"use strict";

const config = require("../config.json");

const cluster = require("cluster");
const server = require("./server");

if(cluster.isMaster) {
    for(let i=0; i<config.threads; i++) {
        cluster.fork();
    }
} else {
    server(config.port);
}