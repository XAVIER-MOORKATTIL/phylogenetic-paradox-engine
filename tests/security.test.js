const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const express = require("express");

const {
    configureSecurity
} = require("../src/security");

const {
    configureAuthentication
} = require("../src/authentication");


const testEnv = {
    NODE_ENV: "development",
    APP_AUTH_REQUIRED: "true",
    APP_AUTH_USERNAME: "test-user",
    APP_AUTH_PASSWORD: "artificial-test-password-123456",
    APP_PUBLIC_ORIGIN: "http://localhost:3003"
};


const authorization = "Basic " + Buffer.from(
    `${testEnv.APP_AUTH_USERNAME}:${testEnv.APP_AUTH_PASSWORD}`
).toString("base64");


// Create an isolated test server.
async function startTestServer(t, protectedApp = false, apiLimit = 120) {

    const app = express();

    configureSecurity(app, {
        nodeEnv: "development",
        apiLimit
    });

    if (protectedApp) {
        configureAuthentication(app, testEnv);
    }

    app.get("/api/health", (req, res) => {
        res.json({ status: "ok" });
    });

    app.get("/api/analyses", (req, res) => {
        res.json({ success: true });
    });

    app.post("/api/analyze/fasta", (req, res) => {
        res.json({ success: true });
    });

    const server = app.listen(0, "127.0.0.1");

    await once(server, "listening");

    t.after(() => new Promise(resolve => {
        server.close(resolve);
    }));

    return `http://127.0.0.1:${server.address().port}`;

}


// TEST 1: Security response headers.
test("returns security headers", async t => {

    const baseUrl = await startTestServer(t);

    const response = await fetch(
        `${baseUrl}/api/analyses`
    );

    assert.ok(
        response.headers.get("content-security-policy")
    );

    assert.equal(
        response.headers.get("x-content-type-options"),
        "nosniff"
    );

    assert.equal(
        response.headers.get("cache-control"),
        "no-store"
    );

    assert.equal(
        response.headers.get("x-powered-by"),
        null
    );

});


// TEST 2: Reject unauthorized access.
test("rejects unauthenticated API requests", async t => {

    const baseUrl = await startTestServer(t, true);

    const response = await fetch(
        `${baseUrl}/api/analyses`
    );

    assert.equal(response.status, 401);

    assert.ok(
        response.headers.get("www-authenticate")
    );

});


// TEST 3: Accept valid credentials.
test("accepts valid authentication credentials", async t => {

    const baseUrl = await startTestServer(t, true);

    const response = await fetch(
        `${baseUrl}/api/analyses`,
        {
            headers: { authorization }
        }
    );

    assert.equal(response.status, 200);

});


// TEST 4: Keep health endpoint accessible.
test("allows unauthenticated health checks", async t => {

    const baseUrl = await startTestServer(t, true);

    const response = await fetch(
        `${baseUrl}/api/health`
    );

    assert.equal(response.status, 200);

});


// TEST 5: Reject cross-origin modifications.
test("rejects cross-origin POST requests", async t => {

    const baseUrl = await startTestServer(t, true);

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",
            headers: {
                authorization,
                Origin: "https://example.com"
            }
        }
    );

    assert.equal(response.status, 403);

});


// TEST 6: Accept authorized same-origin modifications.
test("accepts authenticated same-origin POST requests", async t => {

    const baseUrl = await startTestServer(t, true);

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",
            headers: {
                authorization,
                Origin: testEnv.APP_PUBLIC_ORIGIN
            }
        }
    );

    assert.equal(response.status, 200);

});


// TEST 7: Enforce API rate limits.
test("rejects excessive API requests", async t => {

    const baseUrl = await startTestServer(t, false, 2);

    for (let i = 0; i < 2; i++) {

        const response = await fetch(
            `${baseUrl}/api/analyses`
        );

        assert.equal(response.status, 200);

        await response.text();

    }

    const response = await fetch(
        `${baseUrl}/api/analyses`
    );

    assert.equal(response.status, 429);

});


// TEST 8: Require authentication in production.
test("rejects missing production credentials", () => {

    const app = express();

    assert.throws(
        () => configureAuthentication(app, {
            NODE_ENV: "production"
        }),
        /credentials/
    );

});