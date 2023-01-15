const { sendResponseObject, constructResponseObject } = require('libdd-node').api;
const { validateSchema } = require('libdd-node').schema;
const cfg = require('../../../data/config.json');
const rpc = require('../../rpc/rpc');
const apis = require('../../../data/apis.json');

/**
 * Creates the route handler.
 * @param {{ app: import('express').Application, userCache: import('../../cache/cacher').Cacher, channelCache: import('../../cache/cacher').Cacher }} appContext 
 */
async function init(appContext) {
    // Route for getting messages
    appContext.app.get(`/${cfg.api.version}/messages/:channelId/:page`, async (req, res)=>{
        try {
            // Validate
            validateSchema({
                channelId: { type: 'string' },
                page: { type: 'string' }
            }, req.params);

            // Check if user has channel permission
            const channel = await appContext.channelCache.getOrFetch(req.params.channelId);
            
            if(!channel) {
                sendResponseObject(res, 400, constructResponseObject(false, "Channel does not exist." ));
                return;
            }

            // Check permissions
            switch(channel.type) {
                default:
                    throw new Error("Not implemented");
                case 0:
                    // DM - check if DM is between the acting user and target user
                    // If so, reveal messages
                    if(!channel.recipients.includes(req.user.id))
                        throw new Error("Access denied");
                    break;
            }
            
            // Perform message retrieval RPC
            const msgResp = await rpc.getResponse(apis.msgsvc + `/messages/${req.params.channelId}/${req.params.page}`, { method: "GET", body: { } });

            if(!msgResp.success)
                throw new Error(msgResp.message);

            sendResponseObject(res, 200, constructResponseObject(true, "Messages retrieved", msgResp.data));
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });

    // Route for placing messages
    appContext.app.post(`/${cfg.api.version}/messages/:channelId`, async (req, res)=>{
        try {
            // Validate
            validateSchema({
                channelId: { type: 'string' },
            }, req.params);

            validateSchema({
                content: { type: 'string' },
                attachments: { type: 'object', optional: true }
            }, req.body);

            // Check if user has channel permission
            const channel = await appContext.channelCache.getOrFetch(req.params.channelId);
            
            if(!channel) {
                sendResponseObject(res, 400, constructResponseObject(false, "Channel does not exist." ));
                return;
            }

            // Check permissions
            switch(channel.type) {
                default:
                    throw new Error("Not implemented");
                case 0: {
                    // DM - check if DM is between the acting user and target user
                    // If so, reveal messages
                    if(!channel.recipients.includes(req.user.id))
                        throw new Error("Access denied");

                    let otherRecipient = channel.recipients[1];

                    if(otherRecipient == req.user.id)
                        otherRecipient = channel.recipients[0];

                    // Check user relation
                    // If user is blocked or has no connection, do not permit placement
                    const relationRpc = await rpc.getResponse(apis.usersvc + `/relations/${otherRecipient}`, { method: "GET", body: {}});
                    
                    if(!relationRpc.success)
                        throw new Error(relationRpc.message);

                    const relation = relationRpc.data.find(x => x.targetId == req.user.id);
                    
                    if(relation.type !== 1) {
                        if(relation.type == 2)
                            throw new Error("You have been blocked by this user.");
                        else
                            throw new Error("User has no valid connection to other user.");
                    }

                    // Perform message retrieval RPC
                    const msgResp = await rpc.getResponse(apis.msgsvc + `/messages/${req.params.channelId}`, { method: "POST", body: {
                        authorId: req.user.id,
                        attachments: req.body.attachments,
                        content: req.body.content
                    } });

                    if(!msgResp.success)
                        throw new Error(msgResp.message);

                    sendResponseObject(res, 200, constructResponseObject(true, "Message sent", msgResp.data));
                    appContext.wshost.broadcast(req.user.id, "message sent", msgResp.data);
                    // Inform other user that they've received a message
                    appContext.wshost.broadcast(otherRecipient, "message received", msgResp.data);
                    break;
                }
            }
            

        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });
}

module.exports = { init };