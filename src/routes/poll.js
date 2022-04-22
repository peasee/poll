"use strict";

const Poll = require("../models/Poll");
const RateLimiter = require("../models/RateLimiter");

const express = require("express");
const route = express.Router();

const verifyCaptcha = require("../functions/verifyCaptcha");

/**
 * GET /api/poll/:pollID
 * 
 * Returns an object for the poll at the specified ID
 * Payload format takes the format of {"title", "optionCount", "n..optionCount:prompt", "n..optionCount:count"}
 * 
 * @error Returns 404 if the poll with the specified ID doesn't exist
 * @error Returns 429 if the client is rate limited
 * @error Returns 500 for an unknown error
 */
route.get("/api/poll/:pollID", async (req, res)=>{
    try {
        if(RateLimiter.canHit(req.sourceIP, "PollView") !== true) return res.status(429).json();
        if(await Poll.exists(req.params.pollID) !== true) return res.status(404).json({error: "Not found"});

        RateLimiter.hasHit(req.sourceIP, "PollView");
        return res.json(await Poll.get(req.params.pollID));
    } catch (err) {
        console.error(err);

        return res.status(500).json({error: "An unknown server error occurred"});
    }
});

/**
 * GET /api/poll/:pollID/options
 * 
 * A minimal endpoint, returning the current vote count for each option
 * Payload format takes the format of {"n..optionCount"}, with the value of each property identifying the count for that option
 * 
 * @error Returns 404 if the poll with the specified ID doesn't exist
 * @error Returns 429 if the client is rate limited
 * @error Returns 500 for an unknown error
 */
route.get("/api/poll/:pollID/options", async (req, res)=>{
    try {
        if(RateLimiter.canHit(req.sourceIP, "PollPartialView") !== true) return res.status(429).json();
        if(await Poll.exists(req.params.pollID) !== true) return res.status(404).json({error: "Not found"});

        const poll = await Poll.get(req.params.pollID);
        const response = {};

        for(let i=0; i<Number(poll.optionCount); i++) {
            response[i+1] = poll[`${i+1}:count`];
        }

        RateLimiter.hasHit(req.sourceIP, "PollPartialView");
        return res.json(response);
    } catch (err) {
        console.error(err);

        return res.status(500).json({error: "An unknown server error occurred"});
    }
});

/**
 * POST /api/poll
 * 
 * Creates a new poll, and returns the ID of the newly created poll
 * 
 * @error Returns 422 if the submitted body is invalid (missing options or title)
 * @error Returns 429 if the client is rate limited
 * @error Returns 500 for an unknown error
 */
route.post("/api/poll", async (req, res)=>{
    try {
        if(RateLimiter.canHit(req.sourceIP, "PollCreate") !== true) return res.status(429).json();
        if(req.body.title == "" || req.body.title == null || typeof req.body.title !== "string" || req.body.title.length == 0) return res.status(422).json({error: "You must supply a poll title and it must be a string!"});
        if(!(req.body.options instanceof Array) || req.body.options.length == 0 || req.body.options.filter(o=>typeof o !== "string").length > 0) return res.status(422).json({error: "You must supply one or more options and they must be strings!"});

        if(!req.body.recap) return res.status(403).json({error: "We think you're a bot!"});
        if(await verifyCaptcha(req.body.recap, "create") !== true) return res.status(403).json({error: "We think you're a bot!"});

        const pollID = await Poll.create(req.body);

        RateLimiter.hasHit(req.sourceIP, "PollCreate");
        return res.json({id: pollID});
    } catch (err) {
        console.error(err);

        return res.status(500).json({error: "An unknown server error occurred"});
    }
});

module.exports = route;