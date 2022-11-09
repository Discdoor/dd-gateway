const fs = require('fs');
const path = require('path');

/**
 * Loads all the specified routes.
 * @param {*} appContext The application context to pass.
 * @param {string[]} paths The paths of the routes to load.
 */
function loadAllRoutes(appContext, paths) {
    const dirsToScan = [...paths.map(x => path.join(__dirname, x))];

    for(let dir of dirsToScan)
        for(let fn of fs.readdirSync(dir))
            (require(path.join(dir, fn))).init(appContext);
}

module.exports = {
    loadAllRoutes
}