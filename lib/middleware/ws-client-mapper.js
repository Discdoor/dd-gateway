/**
 * Web socket host.
 * @type {import('../events/sockhost')}
 */
let wsHost;

/**
 * Middleware handler.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Next func.
 */
async function handler(req, res, next) {
    if((req.user != null) && (req.session != null))
        req.wsclient = wsHost.getCallingUserClient(req.user.id, req.session);

    next();
}

module.exports = {
    setHost: (h)=>wsHost = h,
    handler
}