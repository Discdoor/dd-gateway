/*
Main gateway source.
*/

const express = require('express');
const app = express();
const cfg = require('./data/config.json');

app.get(`/api/${cfg.api.version}/ver`, (req, res)=>res.end(JSON.stringify({ version: cfg.api.version })));

app.listen(cfg.http.port, () => {
    console.log(`Gateway available at :${cfg.http.port}`);
});