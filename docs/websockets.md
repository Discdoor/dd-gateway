# Web Sockets in the API Gateway

The DiscDoor API gateway makes extensive use of the WebSocket API through the `socket.io` library. The gateway hosts a WebSocket server, which can only be accessed by clients who have a valid login.

## Role of the Socket Host

The API gateway hosts a WebSocket server which handles realtime events between the client, gateway, or potentially some external service.

Examples of real time events include:
 - User receiving a message from another user
 - User being requested as a friend
 - User receiving many different messages from different people in a guild.

## Middleware

The API gateway provides `express.js` middleware to fetch the currently associated WebSocket client in relation to the caller of a given API endpoint. This middleware adds a `wsclient` object, which is assigned to the `req` object for each request that gets mapped through it.