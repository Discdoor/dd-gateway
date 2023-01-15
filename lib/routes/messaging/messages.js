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
            const msgResp = await rpc.getResponse(apis.msgsvc + `/messages/${req.body.channelId}/${req.body.page}`, { method: "GET", body: { } });

            if(!msgResp.success)
                throw new Error(msgResp.message);

            sendResponseObject(res, 200, constructResponseObject(true, "Messages retrieved", msgResp));
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });
}

module.exports = { init };