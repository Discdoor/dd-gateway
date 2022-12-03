/*
Main gateway source.
*/

const express = require('express');
const app = express();
const proxy = require('express-http-proxy');
const cfg = require('./data/config.json');
const { loadAllRoutes } = require('./lib/routeloader');
const cors = require('cors');
const apis = require('./data/apis.json');
const { Cacher } = require('./lib/cache/cacher');

/**
 * The current application context.
 * Passed to routes, etc.
 */
const appContext = {
    cfg,
    app,
    userCache: new Cacher()
}

// Setup cors
app.use(cors({ origin: cfg.cors.allowedHost }))

// Use json body parser
app.use(express.json());

// Load the routes
// Disable for now
// loadAllRoutes(appContext, [
//     "routes/auth"
// ]);

// Create route proxy
app.use(`/${cfg.api.version}/auth`, proxy(apis.auth));

/**
 * Version endpoint.
 */
app.get(`/${cfg.api.version}/ver`, (req, res)=>res.end(JSON.stringify({ version: cfg.api.version })));

// --------------------------------- PRIVILEGED ENDPOINTS --------------------------------- // 
// Only accessible for logged in users
const umapper = require('./lib/middleware/user-mapper');
umapper.setUserCache(appContext.userCache); // Set cache

// ---- USER SERVICE AND RELATIONS ----

// Add user relation manager routes
umapper.addRoutes([`^/${cfg.api.version}/user/relations`]);

app.use(umapper.handler);

// Add relations redir
app.use(`/${cfg.api.version}/user/relations/@me`, (req, res, next) => {
    req.url = `/relations/${req.user.id}${req.url}`;
    proxy(`${apis.usersvc}/relations/${req.user.id}`)(req, res, next);
});

// ------------------------------------

// ---- USER DATA RETRIEVAL ----

// -----------------------------

// ---------------------------------------------------------------------------------------- //

/**
 * Entry point.
 */
async function main() {
    // Do any necessary setup
    app.listen(cfg.http.port, () => {
        console.log(`Gateway available at :${cfg.http.port}`);
    });
}

main();