const { Socket } = require("socket.io");
const { Client } = require("./client");

/**
 * Represents a user client.
 */
class UserClient extends Client {
    /**
     * Creates a user client.
     * @param {Socket} socket The underlying socket.
     * @param {string} userId The ID of the user.
     * @param {string} sessionKey The session key of this user.
     */
    constructor(socket, userId, sessionKey) {
        super(socket); 
        this.user = userId;
        this.session = sessionKey;
    }

    /**
     * Registers user events.
     */
    registerEvents() {
        
    }
}

module.exports = {
    UserClient
}