/*
Main gateway source.
*/

const express = require('express');
const app = express();
const proxy = require('express-http-proxy');
const cfg = require('./data/config.json');
const path = require('path');
const libdd = require('libdd-node');

app.get(`/${cfg.api.version}/ver`, (req, res)=>res.end(JSON.stringify({ version: cfg.api.version })));

app.listen(cfg.http.port, () => {
    console.log(`Gateway available at :${cfg.http.port}`);
});