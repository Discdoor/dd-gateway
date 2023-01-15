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
const { sendResponseObject, constructResponseObject } = require('libdd-node').api;
const morgan = require('morgan');
const http = require('http');
const server = http.createServer(app);
const wshost = require('./lib/events/sockhost');

/**
 * The current application context.
 * Passed to routes, etc.
 */
const appContext = {
    cfg,
    app,
    userCache: new Cacher(apis.auth + "/user/%ID%/view"),
    wshost
}

// Setup cors
app.use(cors({ origin: cfg.cors.allowedHost }));

// Setup logger
app.use(morgan('dev'));

// Use json body parser
app.use(express.json());

// Create route proxy
app.use(`/${cfg.api.version}/auth`, express.raw({ limit: '2mb' }), proxy(apis.auth));

/**
 * Version endpoint.
 */
app.get(`/${cfg.api.version}/ver`, (req, res)=>res.end(JSON.stringify({ version: cfg.api.version })));

// --------------------------------- PRIVILEGED ENDPOINTS --------------------------------- // 
// Only accessible for logged in users
const umapper = require('./lib/middleware/user-mapper');
umapper.setUserCache(appContext.userCache); // Set cache

// Add websocket route
umapper.addRoutes([`^/socket.io`]);

// Add user relation manager routes
umapper.addRoutes([`^/${cfg.api.version}/user/relations`]);

app.use(umapper.handler);

// Websocket client mapper
const wsmapper = require('./lib/middleware/ws-client-mapper');
wsmapper.setHost(wshost);
app.use(wsmapper.handler);

// Add relations redir
app.use(`/${cfg.api.version}/user/relations/@me`, (req, res, next) => {
    req.url = `/relations/${req.user.id}${req.url}`;
    proxy(`${apis.usersvc}/relations/${req.user.id}`)(req, res, next);
});

// ------------------------------------

// ---- Load routes ----
loadAllRoutes(appContext, [
    "routes/user",
    "routes/relations"
]);
// -----------------------------

// ---------------------------------------------------------------------------------------- //

/** 
 * Error middleware.
 */
app.use((error, req, res, next) => {
    console.log(error);
    if(error) 
        sendResponseObject(res, 500, constructResponseObject(false, error.message || ""));
});

/**
 * Entry point.
 */
async function main() {
    // Initialize WS part of gateway
    await wshost.init(server);

    // Do any necessary setup
    server.listen(cfg.http.port, async() => {
        console.log(`Gateway available at :${cfg.http.port}`);
    });
}

main();