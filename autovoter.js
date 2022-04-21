"use strict";

const crypto = require("crypto");
const {default: axios} = require("axios");

const yargs = require("yargs/yargs");
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

if(argv.totalVotes == null || isNaN(argv.totalVotes)) throw new Error("Total vote count must be provided");
if(argv.poll == null) throw new Error("Target poll ID must be provided");
if(argv.options == null) throw new Error("Comma-separated list of options must be provided");

const AVAILABLE_OPTIONS = String(argv.options).split(",");

(async ()=>{
    for(let i=0; i<argv.totalVotes; i++) {
        const option = AVAILABLE_OPTIONS[Math.floor(Math.random()*AVAILABLE_OPTIONS.length)];
        const ip = crypto.randomBytes(12).toString("hex");

        await axios.post("http://localhost:8081/api/poll/"+argv.poll+"/vote", {option}, {headers: {"CF-Connecting-IP": ip}});
        if(i % 1000 == 0) console.log("Made", i, "votes");
    }
})();