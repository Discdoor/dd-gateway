/*
Remote procedure call (RPC) module.
*/

const types = require('./types');
const rpc_http = require('./http');

const DEFAULT_SETTINGS = new types.RPCCallParameters();
DEFAULT_SETTINGS.deliveryMethod = "http"; // Use HTTP for now

/**
 * Performs an RPC call to another service.
 * @param {string} resource The resource to call.
 * @param {types.RPCCallParameters} params The parameters to pass.
 * @returns {Object}
 */
async function getResponse(resource, params) {
    const actualParams = {
        ...DEFAULT_SETTINGS,
        ...params
    }

    switch(actualParams.deliveryMethod) {
        default:
            throw new Error("RPC method not implemented");
        case "http":
            return rpc_http.getRPCResponseHttp(resource, actualParams);
    }
}

module.exports = {
    getResponse
}