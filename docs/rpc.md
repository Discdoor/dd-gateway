# Remote Procedure Call (RPC)

The gateway interacts with other services using an RPC model. This means, if the gateway is being asked to verify a user, it will have to make an RPC call to the authentication service to authenticate a user.

The main advantage of this kind of model is that it allows all the microservices to be loosely coupled - which makes them easier to clusterize and maintain.

## Method of RPC

We are currently using `HTTP` as the default transport for RPC calls. Whilst it may not be super efficient, HTTP has been shown to be reliable as an RPC transport. 

## Example RPC flow

### Creating a user account

- Uses client to call account creation endpoint
- Client forwards request to gateway
- Gateway creates RPC request to Auth server
- Auth server answers
- Gateway sends back the result to the client
- Client reports to user

### Sending a message

- User enters message in client
- Client creates message place request for a specified channel and sends it to gateway
- Gateway does RPC check to check if channel exists
- If channel is DM channel, do additional checks such as:
  - RPC to relations service, to check what that user means to the caller (blocked, friend, etc.)
  - RPC to user service to check if recipient is still registered
- Gateway does RPC to messaging service to create message
- Message server sends message ID back to gateway
- Gateway reports message Id to client
- Client informs user that message was sent.