const { sendResponseObject } = require('libdd-node/lib/api');

/**
 * Initializes the route.
 * @param {{
 *  cfg: import('../../../data/config.json')
 *  app: import('express').Application,
 *  sessionMgr: import('../../state/session-manager')
 * }} appContext The app context.
 */
async function init(appContext) {
    appContext.app.post(`/${appContext.cfg.api.version}/auth/register`, (req, res) => {
        
    });
}

module.exports = {
    init
}