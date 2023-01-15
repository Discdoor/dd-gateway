const http = require('http');
const http_rpc = require('./http');

const TESTING_PORT = 12652;
const TESTING_HOST = 'localhost';
const TEST_URL = `http://${TESTING_HOST}:${TESTING_PORT}`;

function createJsonResp(res, obj) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(JSON.stringify(obj));
}

describe("http rpc tests", () => {
    /** @type {http.Server} */
    let server;

    beforeAll(() => {
        return new Promise((resolve) => {
            server = http.createServer((req, res) => {
                switch(req.method) {
                    case "GET":
                        if(req.url == "/test-get")
                            return createJsonResp(res, { success: true });
                        break;
                    case "POST":
                        if(req.url == "/test-post")
                            return createJsonResp(res, { success: true });
                        break;
                }
            });
    
            server.listen(TESTING_PORT, TESTING_HOST, () => {
                console.log(`Test server is running on http://${TESTING_HOST}:${TESTING_PORT}`);
                resolve();
            });
        });
    })

    test("make get request", async () => {
        const resp = await http_rpc.getRPCResponseHttp(`${TEST_URL}/test-get`, { method: "GET" });
        expect(resp).toBeDefined();
        expect(resp).not.toBeNull();
        expect(resp.success).toBe(true);
    });

    test("make post request", async () => {
        const resp = await http_rpc.getRPCResponseHttp(`${TEST_URL}/test-post`, { method: "POST" });
        expect(resp).toBeDefined();
        expect(resp).not.toBeNull();
        expect(resp.success).toBe(true);
    });

    afterAll(() => {
        server.close();
        console.log("HTTP rpc tests concluded.");
    });
});