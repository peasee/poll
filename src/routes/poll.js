"use strict";

const Poll = require("../models/Poll");

const express = require("express");
const route = express.Router();

/**
 * GET /api/poll/:pollID
 * 
 * Returns an object for the poll at the specified ID
 * Payload format takes the format of {"title", "optionCount", "n..optionCount:prompt", "n..optionCount:count"}
 * 
 * TODO: Add throttling to this endpoint for a very restrictive once per minute
 *      Clients can hit the options endpoint to retrieve count updates for options, minimising response traffic. This can be done in nginx.
 * 
 * @error Returns 404 if the poll with the specified ID doesn't exist
 */
route.get("/api/poll/:pollID", async (req, res)=>{
    if(await Poll.exists(req.params.pollID) !== true) return res.status(404).json({error: "Not found"});

    return res.json(await Poll.get(req.params.pollID));
});

/**
 * GET /api/poll/:pollID/options
 * 
 * A minimal endpoint, returning the current vote count for each option
 * Payload format takes the format of {"n..optionCount"}, with the value of each property identifying the count for that option
 * 
 * TODO: Add throttling to this endpoint for once every 5 seconds - this can actually be done in nginx
 * 
 * @error Returns 404 if the poll with the specified ID doesn't exist
 */
route.get("/api/poll/:pollID/options", async (req, res)=>{
    if(await Poll.exists(req.params.pollID) !== true) return res.status(404).json({error: "Not found"});

    const poll = await Poll.get(req.params.pollID);
    const response = {};

    for(let i=0; i<Number(poll.optionCount); i++) {
        response[i+1] = poll[`${i+1}:count`];
    }

    return res.json(response);
});

/**
 * POST /api/poll
 * 
 * Creates a new poll, and returns the ID of the newly created poll
 * 
 * @error Returns 422 if the submitted body is invalid (missing options or title)
 */
route.post("/api/poll", async (req, res)=>{
    // TODO: confirm body for creating a poll

    const pollID = await Poll.create(req.body);

    return res.json({id: pollID});
});

module.exports = route;