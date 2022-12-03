const axios = require('axios');
const apis = require('../../data/apis.json');
const { Cacher } = require('../cache/cacher');
const { constructResponseObject, sendResponseObject } = require('libdd-node').api;

// Const
const ENDP_VERIF = `${apis.auth}/session/validate`;

// Vars
let routesToHandle = [];

/** @type {Cacher} */
let userCache = null;

/**
 * Adds the specified routes to the user mapper.
 * @param {string[]} r The routes to add.
 */
const addRoutes = (r) => {
    r.forEach((v)=>routesToHandle.push(v));
}

/**
 * Sets the user cache.
 * @param {Cacher} c The cache object.
 * @returns The cache object.
 */
const setUserCache = (c) => userCache = c;

/**
 * Middleware handler.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Next func.
 */
async function handler(req, res, next) {
    // This method verifies if a user token is still valid, and also provides a user object to express.
    // This handler must ALSO cache the users - user state is rarely updated!

    // !! +++++++++++++++++++++++++++++++++++++++++++++++++ !!
    // !! TODO FOR PERFORMANCE                              !!
    // !! WE MUST CACHE THE USER TOKENS                     !!
    // !! PERFORMANCE WILL SUFFER IN LARGE SCALE OPERATIONS !!
    // !! +++++++++++++++++++++++++++++++++++++++++++++++++ !!

    // Check if route is registered as privileged
    let canHandle = false;

    for(let r of routesToHandle) {
        if(r instanceof RegExp) {
            if(r.test(req.url))
                canHandle = true;
        }
        else
            if((r[0] == '^') && (req.url.startsWith(r.substring(1))))
                canHandle = true;
            else if(req.url == r)
                canHandle = true;
    }

    if(!canHandle)
        return next(); // Pass to next middleware
    
    // Check if user can access privileged resource
    // Make call to auth server
    if(!req.headers.authorization)
        // No auth header, respond
        return sendResponseObject(res, 403, constructResponseObject(false, "Access denied"));
    
    // Make axios request
    let authResp;

    try {
        authResp = await axios.post(ENDP_VERIF, { /* no body */ }, { headers: { 'Authorization': req.headers.authorization } });

        if(!authResp.data.success)
            throw new Error();

        // Access success
        const uid = authResp.data.data.id;

        if(!userCache.exists(uid)) {
            // Fetch user object and update
            let userResp;

            try {
                userResp = await axios.get(`${apis.auth}/user/${uid}/view`, { headers: { 'Authorization': req.headers.authorization } });
                userCache.update(userResp.data.data);
            } catch(e) {
                console.log(e.message);
                return sendResponseObject(res, 500, constructResponseObject(false, "Internal Server Error"));
            }
        }
        
        req.user = userCache.get(uid);
        next();
    } catch(e) {
        // Error
        console.log(e.message);
        return sendResponseObject(res, 403, constructResponseObject(false, "Access denied"));
    }
}

module.exports = {
    setUserCache,
    addRoutes,
    handler
};