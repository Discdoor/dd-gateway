/*
Gateway web socket event host.
*/

const { Server } = require('socket.io');
const http = require('http');
const cfg = require('../../data/config.json');
const rpc = require('../rpc/rpc');
const apis = require('../../data/apis.json');
const { UserClient } = require('./user-client');

/** @type {Server} */
let io;

// Active clients array for each user.
let activeClients = {};

// socket ID -> user ID.
let userToSocketMap = {};

/**
 * Broadcasts an event to the specified user's clients.
 * @param {string} userId The ID of the user to act on.
 * @param {string} evt The name of the event to broadcast.
 * @param  {...any} args The arguments to pass.
 */
async function broadcast(userId, evt, ...args) {
    const userClients = activeClients[userId];

    if(!userClients)
        return; // Nothing to broadcast

    for(let s of userClients) {
        try {
            if(s.sock != null) 
                s.sock.emit(evt, ...args);
        } catch(e) {
            continue;
        }
    }
}

/**
 * Gets the calling client.
 * @param {string} userId The ID of the user.
 * @param {string} sessionKey The key of the session.
 * @returns {UserClient}
 */
async function getCallingUserClient(userId, sessionKey) {
    const userClients = activeClients[userId];

    if(!userClients)
        return null; // User has no clients

    for(let s of userClients) {
        try {
            if((s.sock != null) && (s.user == userId) && (s.session == sessionKey)) 
                return s;
        } catch(e) {
            continue;
        }
    }

    return null;
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

            const client = new UserClient(socket, userId, sessKey);
            activeClients[userId].push(client);
            userToSocketMap[socket.id] = userId;

            await client.registerEvents();

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
    init,
    broadcast,
    getCallingUserClient
}