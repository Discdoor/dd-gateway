const { Socket } = require("socket.io");

/**
 * Web socket client.
 */
class Client {
    /**
     * Creates a new client object.
     * @param {Socket} socket The socket to use.
     */
    constructor(socket) {
        this.sock = socket;
        this.id = socket.id;
    }

    /**
     * Registers client events.
     */
    registerEvents() {
        /* to be implemented by derivatives */
    }
}

module.exports = {
    Client
}