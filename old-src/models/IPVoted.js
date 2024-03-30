"use strict";

const db = require("../db");
const { createHash } = require("crypto");

module.exports = {
    /**
     * @async
     * @name IPVoted.hasVoted
     * 
     * Returns a boolean check if the specified IP has already voted for the specified poll.
     * The Poll ID and IP are combined and hashed to create a hash-key to store in Redis.
     * 
     * @param {string} pollID - the poll to check against
     * @param {string} ip - the IP to check
     */
    async hasVoted(pollID, ip) {
        const keyHash = createHash("sha1").update(`${pollID}${ip}`).digest("hex");
        const ipData = await db.get(keyHash);
        return ipData !== null;
    },

    /**
     * @async
     * @name IPVoted.vote
     * 
     * Registers the IP as having voted for the specified poll.
     * 
     * @param {string} pollID - the poll to register the IP as voted for.
     * @param {string} ip - the IP to list as having voted.
     */
    async vote(pollID, ip) {
        const keyHash = createHash("sha1").update(`${pollID}${ip}`).digest("hex");
        await db.multi().set(keyHash, "1").expire(keyHash, 24 * 60 * 60).exec();
    }
};