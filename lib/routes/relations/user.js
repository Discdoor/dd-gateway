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
    // Route for blocking user
    appContext.app.post(`/${cfg.api.version}/user/relations/block`, async (req, res)=>{
        try {
            // Validate
            validateSchema({
                target: { type: 'string' }
            }, req.body);

            const target = await appContext.userCache.getOrFetch(req.body.target);
            
            // Perform frq accept RPC
            const relResp = await rpc.getResponse(apis.usersvc + `/relations/${req.user.id}/block`, { method: "POST", body: { target: target.id } });

            if(!relResp.success)
                throw new Error(relResp.message);

            sendResponseObject(res, 200, constructResponseObject(true, "User blocked", target));
            
            appContext.wshost.broadcast(req.user.id, "block added", target);
            appContext.wshost.broadcast(target.id, "blocked", req.user);
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });
}

module.exports = { init };