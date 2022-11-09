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
    appContext.app.post(`/${appContext.cfg.api.version}/auth/login`, async (req, res) => {
        try {
            const response = await axios.post(`${apis.auth}/validate`, { ...req.body });
            // Pipe response
            sendResponseObject(res, 200, response);
        } catch(e) {
            if(e.response.data)
                sendResponseObject(res, 400, e.response.data);
            else
                sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });
}

module.exports = {
    init
}