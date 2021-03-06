"use strict";

const Poll = require("../models/Poll");
const IPVoted = require("../models/IPVoted");
const RateLimiter = require("../models/RateLimiter");

const express = require("express");
const route = express.Router();

const verifyCaptcha = require("../functions/verifyCaptcha");

/**
 * POST /api/poll/:pollID/vote
 * 
 * Submits a vote for the specified option ID in the body to the specified poll by ID
 * Does not perform a check if the specified option exists - 
 *  there's little point wasting resources on attackers doing this, as real users won't ever vote for options that don't exist (nor see votes for these phantom options)
 * 
 * @error Returns a 403 if the user at the specified IP has already voted on this poll
 * @error Returns 429 if the client is rate limited
 * @error Returns 500 for an unknown error
 */
route.post("/api/poll/:pollID/vote", async (req, res)=>{
    try {
        if(RateLimiter.canHit(req.sourceIP, "PollVote") !== true) return res.status(429).json();
        if(!req.body.option) return res.status(422).json({error: "You must supply an option ID to vote for!"});

        if(!req.body.recap) return res.status(403).json({error: "We think you're a bot!"});
        if(await verifyCaptcha(req.body.recap, "vote") !== true) return res.status(403).json({error: "We think you're a bot!"});

        // we assume trust in the cf-connecting-ip here because the only thing it can come from is CloudFlare
        // ... assuming you're running behind CloudFlare, of course.
        if(await IPVoted.hasVoted(req.params.pollID, req.sourceIP) !== false) return res.status(403).json({error: "You've already voted on this poll!"});

        await Promise.all([
            Poll.vote(req.params.pollID, req.body.option),
            IPVoted.vote(req.params.pollID, req.sourceIP)
        ]);

        RateLimiter.hasHit(req.sourceIP, "PollVote");
        return res.json({voted: true});
    } catch (err) {
        console.error(err);

        return res.status(500).json({error: "An unknown server error occurred"});
    }
});

module.exports = route;