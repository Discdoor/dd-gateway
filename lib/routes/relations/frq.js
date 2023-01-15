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
    // Route for adding friends
    appContext.app.post(`/${cfg.api.version}/user/relations/add`, async (req, res)=>{
        try {
            // Validate
            validateSchema({
                tag: { type: 'string' }
            }, req.body);
            
            // Perform tag resolution RPC
            const tagResolveResp = await rpc.getResponse(apis.auth + "/user/resolve", { method: "POST", body: { tag: req.body.tag } });

            if(!tagResolveResp.success)
                throw new Error(tagResolveResp.message);
            
            // Perform relation add RPC
            const friendReqResp = await rpc.getResponse(apis.usersvc + `/relations/${req.user.id}/friend/request`, { method: "POST", body: { target: tagResolveResp.data.id } });

            if(!friendReqResp.success)
                throw new Error(friendReqResp.message);

            // Adding was successful, inform client of this and also the user in question, so that it can be cached
            sendResponseObject(res, 200, constructResponseObject(true, "Friend added", tagResolveResp.data));
            
            // Inform user client (and their other clients) of this change
            appContext.wshost.broadcast(req.user.id, "friend request placed", tagResolveResp.data);

            // Inform target user that an incoming request has come
            appContext.wshost.broadcast(tagResolveResp.data.id, "friend request incoming", req.user);
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });

    // Route for accepting friends
    appContext.app.post(`/${cfg.api.version}/user/relations/accept`, async (req, res)=>{
        try {
            // Validate
            validateSchema({
                target: { type: 'string' } // The ID of the user to accept the request from
            }, req.body);

            const friend = await appContext.userCache.getOrFetch(req.body.target);
            
            // Perform frq accept RPC
            const friendReqResp = await rpc.getResponse(apis.usersvc + `/relations/${req.user.id}/friend/accept`, { method: "POST", body: { target: friend.id } });

            if(!friendReqResp.success)
                throw new Error(friendReqResp.message);

            sendResponseObject(res, 200, constructResponseObject(true, "Friend accepted", friend));
            
            // Inform user client (and their other clients) of this change
            appContext.wshost.broadcast(req.user.id, "friend accept successful", friend);

            // Inform target user that an incoming request has come
            appContext.wshost.broadcast(friend.id, "friend request accepted", req.user);
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });

    // Route for denying friends
    appContext.app.post(`/${cfg.api.version}/user/relations/deny`, async (req, res)=>{
        try {
            // Validate
            validateSchema({
                target: { type: 'string' } // The ID of the user to accept the request from
            }, req.body);

            const target = await appContext.userCache.getOrFetch(req.body.target);
            
            // Perform frq accept RPC
            const friendReqResp = await rpc.getResponse(apis.usersvc + `/relations/${req.user.id}/friend/deny`, { method: "POST", body: { target: target.id } });

            if(!friendReqResp.success)
                throw new Error(friendReqResp.message);

            sendResponseObject(res, 200, constructResponseObject(true, "Friend accept denied", target));
            
            // Inform user client (and their other clients) of this change
            appContext.wshost.broadcast(req.user.id, "friend deny successful", target);

            // Inform target user that their request was denied
            appContext.wshost.broadcast(target.id, "friend request denied", req.user);
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });

     // Route for retracting request
     appContext.app.post(`/${cfg.api.version}/user/relations/retract`, async (req, res)=>{
        try {
            // Validate
            validateSchema({
                target: { type: 'string' } // The ID of the user to accept the request from
            }, req.body);

            const target = await appContext.userCache.getOrFetch(req.body.target);
            
            // Perform frq accept RPC
            const friendReqResp = await rpc.getResponse(apis.usersvc + `/relations/${req.user.id}/friend/retract`, { method: "POST", body: { target: target.id } });

            if(!friendReqResp.success)
                throw new Error(friendReqResp.message);

            sendResponseObject(res, 200, constructResponseObject(true, "Friend accept retracted", target));
            
            // Inform user client (and their other clients) of this change
            appContext.wshost.broadcast(req.user.id, "friend retract successful", target);

            // Inform target user that their request was denied
            appContext.wshost.broadcast(target.id, "friend request retracted", req.user);
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });

    // Route for removing friend
    appContext.app.post(`/${cfg.api.version}/user/relations/remove`, async (req, res)=>{
        try {
            // Validate
            validateSchema({
                target: { type: 'string' } // The ID of the user to accept the request from
            }, req.body);

            const target = await appContext.userCache.getOrFetch(req.body.target);
            
            // Perform frq accept RPC
            const relResp = await rpc.getResponse(apis.usersvc + `/relations/${req.user.id}/friend/remove/${target.id}`, { method: "DELETE" });

            if(!relResp.success)
                throw new Error(relResp.message);

            sendResponseObject(res, 200, constructResponseObject(true, "Friend removed", target));
            
            // Inform user client (and their other clients) of this change
            appContext.wshost.broadcast(req.user.id, "friend remove successful", target);

            // Inform target user that they have been removed as a friend
            appContext.wshost.broadcast(target.id, "removed as friend", req.user);
        } catch(e) {
            console.log(e);
            sendResponseObject(res, 400, constructResponseObject(false, e.message || ""));
        }
    });
}

module.exports = { init };