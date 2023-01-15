/*
HTTP RPC.
*/

const axios = require('axios');
const types = require('./types');

/**
 * RPC call parameters for http.
 */
class HTTPRPCCallParameters extends types.RPCCallParameters {
    deliveryMethod = "http";
    
    /**
     * HTTP method.
     * @type {"POST"|"GET"|"PATCH"|"DELETE"|"PUT"}
     */
    method = "GET";

    /**
     * The body to send.
     * @type {string|object}
     */
    body = "";

    /**
     * HTTP headers to set.
     */
    headers = {}
}

const DEFAULT_SETTINGS = new HTTPRPCCallParameters();

/**
 * Gets a HTTP response.
 * @param {string} resource The resource to call.
 * @param {HTTPRPCCallParameters} params The parameters to pass.
 */
async function getRPCResponseHttp(resource, params) {
    const reqPrms = {
        ...DEFAULT_SETTINGS,
        ...params
    };

    try {
        // Check if method is correct
        const axMethod = axios[reqPrms.method.toLowerCase()];

        if(!axMethod)
            throw new Error("Method not found.");

        // Construct body
        /** @type {string} */
        let body;

        if(typeof reqPrms.body === 'object')
            body = JSON.stringify(reqPrms.body);
        else if(typeof reqPrms.body === 'string')
            body = reqPrms.body;
        else
            body = `${reqPrms.body}`;

        // Get response
        let response;

        if(reqPrms.method == "GET")
            response = await axMethod(resource, { headers: reqPrms.headers });
        else
            response = await axMethod(resource, body, { headers: reqPrms.headers });

        return response.data;
    } catch(e) {
        return { success: false, message: e?.message || "", data: null }
    }
}

module.exports = {
    getRPCResponseHttp
}