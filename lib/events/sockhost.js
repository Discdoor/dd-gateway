/*
Gateway web socket event host.
*/

const { Server } = require('socket.io');
const http = require('http');
const cfg = require('../../data/config.json');
const rpc = require('../rpc/rpc');
const apis = require('../../data/apis.json');

/** @type {Server} */
let io;

// Active clients array for each user.
let activeClients = {};

// socket ID -> user ID.
let userToSocketMap = {};

/**
 * Registers events for the specified socket.
 * @param {Socket} socket
 */
async function registerEvents(socket) {
    
}

/**
 * Initializes the web socket server.
 * @param {http.Server} httpServer The underlying http server to use for serving.
 */
async function init(httpServer) {
    // Construct server
    io = new Server(httpServer, {
        cors: {
            origin: cfg.cors.allowedHost,
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[ws] connection received from ${socket.id}`);

        // Register events
        socket.on('user client begin', async (sessKey)=>{
            console.log(`[ws ${socket.id}] received client auth request.`);
            
            // Disconnect if the session key is not valid
            if(typeof sessKey !== 'string') {
                socket.emit('user client rejected', "Malformed session key");
                socket.disconnect();
                console.log(`[ws ${socket.id}] client rejected - session key type was not valid.`);
                return;
            }

            // Check session user key
            let userObjResponse = await rpc.getResponse(apis.auth + "/user/@me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${sessKey}`
                }
            });

            // Key is not valid
            if(!userObjResponse.success) {
                socket.emit('user client rejected', "Access denied");
                socket.disconnect();
                console.log(`[ws ${socket.id}] client rejected - somehow an already authenticated client cannot be authenticated again.`);
                return;
            }

            // Store active client
            const userId = userObjResponse.data.id;

            if(!activeClients[userId])
                activeClients[userId] = [];

            activeClients[userId].push({
                id: socket.id,
                user: userId,
                sock: socket
            });

            userToSocketMap[socket.id] = userId;

            registerEvents(socket);

            // Accept client
            socket.emit("user client accepted");
            console.log(`[ws ${socket.id}] accepted client for user ${userObjResponse.data.id}.`);
        });

        // Disconnect handler
        socket.on('disconnect', () => {
            const userId = userToSocketMap[socket.id];

            if(!userId)
                return;

            const clientReg = activeClients[userId];

            if(clientReg) {
                const clId = clientReg.findIndex(x => x.user == userId);
            
                if(clId >= 0)
                    clientReg.splice(clId, 1);

                console.log(`[ws ${socket.id}] user ${userId} has disconnected`);
                userToSocketMap[socket.id] = null;
            }
        })
    });
}

module.exports = {
    init
}