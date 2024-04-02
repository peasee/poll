"use strict";

const { nanoid } = require("nanoid/non-secure");
const db = require("../db");

// store an intermediate cache to restrict Redis hits - lower CPU usage wherever we can.
const resultCache = {};

// the intermediate cache has a ttl of 5 seconds.
// delete any old objects after 60 seconds,
//  as we can assume after a minute there's low traffic to this item if it's not been refreshed again.
function cacheCleanup() {
    Object.keys(resultCache).forEach(k=>{
        if(resultCache[k].cExpr >= Date.now()) delete resultCache[k];
    });
}

setInterval(cacheCleanup, 60000);

// export the actual model functions
module.exports = {

    /**
     * @async
     * @name Poll.create
     * 
     * Creates a new poll and associated option keys and sets them to Redis with a 24 hour expiry.
     * 
     * @param {object} poll - the poll data object to create. Should contain a title and array of options
     * @returns {string} the ID of the newly created poll
     */
    async create(poll) {
        const id = nanoid();

        let transaction = db.multi()
            .hSet(id, "title", poll.title, {})
            .hSet(id, "optionCount", poll.options.length);

        
        for(let i=0; i<poll.options.length; i++) {
            transaction = transaction.hSet(id, `${i+1}:prompt`, poll.options[i]);
            transaction = transaction.hSet(id, `${i+1}:count`, "0");
        }
        
        transaction.expire(id, 24 * 60 * 60);
        await transaction.exec();

        return id;
    },

    /**
     * @async
     * @name Poll.recache
     * 
     * Retrieves the poll into the intermediary cache if it's not yet there or has expired its 5 second TTL.
     * 
     * @param {string} pollID - the ID of the poll to recache
     */
    async recache(pollID) {
        if(!resultCache[pollID] || resultCache[pollID].cExpr <= Date.now()) {
            resultCache[pollID] = {value: await db.hGetAll(pollID), cExpr: Date.now() + (5 * 1000)};
        }
    },

    /**
     * @name Poll.exists
     * 
     * Returns a boolean check if the poll with the specified ID exists.
     * Utilises the intermediary cache - 
     *  the thought being high-traffic polls will hit the cache for existence checks instead of performing hExists operations on Redis.
     * 
     * @param {string} pollID - the ID of the poll to check
     * @returns {boolean} the result of the existence check
     */
    async exists(pollID) {
        await this.recache(pollID);

        return resultCache[pollID].value != null;
    },

    /**
     * @async
     * @name Poll.get
     * 
     * Returns the poll object of the specified poll ID.
     * 
     * @param {string} pollID - the ID of the poll to check
     * @returns {object} the poll object
     */
    async get(pollID) {
        await this.recache(pollID);
        
        return resultCache[pollID].value;
    },

    /**
     * @name Poll.vote
     * 
     * Increments an option for the poll by 1. Does not check for existence of the option nor poll being incremented.
     * 
     * @param {string} pollID - the poll to increment a vote on
     * @param {number} optionID - the option to increment
     * @returns {Promise} the promise for the Redis action to resolve
     */
    vote(pollID, optionID) {
        return db.hIncrBy(pollID, `${optionID}:count`, 1);
    }
};