# API Gateway Documentation

The API gateway is responsible for handling client requests, providing a realtime websocket connection for events, and providing a method to bind all microservices together. It is the most essential service in the DiscDoor architecture - no client will run properly without its presence.

This gateway is stateless - it does not store any data, but it does cache commonly accessed objects such as `User` objects to reduce Database requests.

## Further Reading
 - [Entities](./entities.md)
 - [Web Sockets](./websockets.md)
 - [RPC](./rpc.md)
 - [Configuration](./config.md)