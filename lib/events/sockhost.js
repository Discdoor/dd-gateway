/*
Gateway web socket event host.
*/

const { Server } = require('socket.io');
const http = require('http');

/** @type {Server} */
let io;

/**
 * Initializes the web socket server.
 * @param {http.Server} httpServer The underlying http server to use for serving.
 */
async function init(httpServer) {
    // Construct server
    io = new Server(httpServer);

    io.on('connection', (socket) => {
        
    });
}

module.exports = {
    init
}