"use strict";

const Poll = require("../models/Poll");
const IPVoted = require("../models/IPVoted");

const express = require("express");
const route = express.Router();

/**
 * POST /api/poll/:pollID/vote
 * 
 * Submits a vote for the specified option ID in the body to the specified poll by ID
 * Does not perform a check if the specified option exists - 
 *  there's little point wasting resources on attackers doing this, as real users won't ever vote for options that don't exist (nor see votes for these phantom options)
 * 
 * @error Returns a 403 if the user at the specified IP has already voted on this poll
 */
route.post("/api/poll/:pollID/vote", async (req, res)=>{
    // we assume trust in the cf-connecting-ip here because the only thing it can come from is CloudFlare
    // ... assuming you're running behind CloudFlare, of course.
    if(await IPVoted.hasVoted(req.params.pollID, req.headers["cf-connecting-ip"] || req.socket.remoteAddress) !== false) return res.status(403).json({error: "You've already voted on this poll!"});

    await Promise.all([
        Poll.vote(req.params.pollID, req.body.option),
        IPVoted.vote(req.params.pollID, req.headers["cf-connecting-ip"] || req.socket.remoteAddress)
    ]);

    return res.json({voted: true});
});

module.exports = route;