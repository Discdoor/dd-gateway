const rpc = require('../rpc/rpc');

class Cacher {
    /**
     * Creates a new cacher.
     * @param {string?} fetchUrl An optional fetch URL.
     */
    constructor(fetchUrl) {
        this.cache = []; // Obj cache
        this.indexMapping = {}; // ObjId = index map table
        this.fetchUrl = fetchUrl;
    }

    /**
     * Checks if this object ID has been cached.
     * @param {string} id The object ID to check for.
     */
    exists(id) {
        return this.indexMapping[id] != null;
    }

    /**
     * Updates the specified object in the cache. If the object already exists, we update the object that already exists.
     * @param {*} object The object to cache.
     */
    update(object) {
        const oid = object.id;

        if(oid == null)
            throw new Error("Invalid object.");

        // Check for previous index
        let oldIdx = this.indexMapping[oid];

        // Add or update obj in cache
        if(oldIdx)
            this.cache[oldIdx] = object;
        else
            this.indexMapping[oid] = this.cache.push(object) - 1;
    }

    /**
     * Gets the specified object.
     * @param {string} id The ID of the object to get.
     */
    get(id) {
        const idx = this.indexMapping[id];

        if(idx == null)
            return null;

        return this.cache[idx];
    }

    /**
     * Gets (or fetches) an item. 
     * @param {string} id The ID of the item to fetch.
     */
    async getOrFetch(id) {
        if(this.fetchUrl == "")
            throw new Error("This cacher cannot fetch.");

        const item = this.get(id);

        if(item)
            return item;

        const fetchedItemResp = await rpc.getResponse(this.fetchUrl.replace("%ID%", id), {
            deliveryMethod: "http",
            method: "GET"
        });
        
        if((!fetchedItemResp.success) || (fetchedItemResp.data == null))
            return null;

        this.update(fetchedItemResp.data);
        return fetchedItemResp.data;
    }
}

module.exports = {
    Cacher
}