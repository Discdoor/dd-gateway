const { sendResponseObject, constructResponseObject } = require('libdd-node').api;
const { validateSchema } = require('libdd-node').schema;
const cfg = require('../../../data/config.json');
const rpc = require('../../rpc/rpc');
const apis = require('../../../data/apis.json');

/**
 * Creates the route handler.
 * @param {{ app: import('express').Application, userCache: import('../../cache/cacher').Cacher }} appContext 
 */
async function init(appContext) {
    // Route for starting DM with a user
    appContext.app.post(`/${cfg.api.version}/channels/dm/:user`, async (req, res)=>{
        try {
            validateSchema({
                user: { type: 'string' }
            }, req.params);

            // Check validity of users
            const targetUser = await appContext.userCache.getOrFetch(req.params.user);
    
            if(!targetUser)
                throw new Error("Target user does not exist.");
    
            // Send DM open RPC
            const dmRPC = await rpc.getResponse(apis.msgsvc + `/channels/dm/${req.user.id}/${req.params.user}`, { method: "POST", body: { } });
            
            sendResponseObject(res, 200, constructResponseObject(true, "DM opened", dmRPC.data));
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });
}

module.exports = { init };