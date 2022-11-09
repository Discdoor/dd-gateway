const { sendResponseObject, constructResponseObject } = require('libdd-node/lib/api');
const axios = require('axios');
const apis = require('../../../data/apis.json');

/**
 * Initializes the route.
 * @param {{
 *  cfg: import('../../../data/config.json')
 *  app: import('express').Application,
 *  sessionMgr: import('../../state/session-manager')
 * }} appContext The app context.
 */
async function init(appContext) {
    appContext.app.post(`/${appContext.cfg.api.version}/auth/register`, async (req, res) => {
        try {
            const response = await axios.post(`${apis.auth}/register`, { ...req.body });
            sendResponseObject(res, 200, response.data);
        } catch(e) {
            if(!e.response)
                sendResponseObject(res, 400, constructResponseObject(false, "API failure"));
            else if(e.response.data)
                sendResponseObject(res, 400, e.response.data);
            else
                sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });
}

module.exports = {
    init
}