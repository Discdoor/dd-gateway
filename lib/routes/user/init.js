const { sendResponseObject, constructResponseObject } = require('libdd-node').api;
const { validateSchema } = require('libdd-node').schema;
const axios = require('axios');
const cfg = require('../../../data/config.json');
const apis = require('../../../data/apis.json');

/**
 * Creates the route handler.
 * @param {{ app: import('express').Application, userCache: import('../../cache/cacher').Cacher }} appContext 
 */
async function init(appContext) {
    appContext.app.get(`/${cfg.api.version}/user/:id`, async (req, res)=>{
        try {
            validateSchema({
                id: { type: "string" },
            }, req.params);

            // Check if user exists in cache
            const uid = req.params.id;
            let userObj;

            if(appContext.userCache.exists(uid))
                userObj = appContext.userCache.get(uid);
            else {
                let userResp;

                try {
                    userResp = await axios.get(`${apis.auth}/user/${uid}/view`);
                    appContext.userCache.update(userResp.data.data);
                    userObj = userResp.data.data;
                } catch(e) {
                    console.log(e.message);
                    return sendResponseObject(res, 500, constructResponseObject(false, "Internal Server Error"));
                }
            }

            return sendResponseObject(res, 200, constructResponseObject(true, "", userObj));
        } catch(e) {
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });
}

module.exports = { init };