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

/**
 * The current application context.
 * Passed to routes, etc.
 */
const appContext = {
    cfg,
    app,
    sessionMgr: null
}

// Setup cors
app.use(cors({ origin: cfg.cors.allowedHost }))

// Use json body parser
app.use(express.json());

// Load the routes
loadAllRoutes(appContext, [
    "routes/auth"
]);

/**
 * Version endpoint.
 */
app.get(`/${cfg.api.version}/ver`, (req, res)=>res.end(JSON.stringify({ version: cfg.api.version })));

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