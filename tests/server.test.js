
const test = require("node:test");
const assert = require("node:assert/strict");
const { before, after } = require("node:test");

const app = require("../src/server");


// Store the temporary test server.
let server;
let baseUrl;


// Start the server before running API tests.
before(async () => {

    // Port 0 lets Windows assign an available port.
    server = app.listen(0);

    // Wait until the server is ready.
    await new Promise(resolve => {
        server.once("listening", resolve);
    });

    // Obtain the actual port assigned by Windows.
    const address = server.address();

    baseUrl = `http://127.0.0.1:${address.port}`;
});


// Close the temporary server after all tests.
after(async () => {

    if (!server) {
        return;
    }

    await new Promise((resolve, reject) => {

        server.close(error => {

            if (error) {
                reject(error);
            } else {
                resolve();
            }

        });

    });
});


// TEST 1: Health endpoint.
test("GET /api/health returns API status", async () => {

    const response = await fetch(`${baseUrl}/api/health`);

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
});


// TEST 2: Ordinary DNA analysis.
test("POST /api/analyze returns a phylogenetic analysis", async () => {

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sequences: {
                Human: "ATGC",
                Chimpanzee: "ATAC",
                Gorilla: "ATGA"
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(
        body.analysis.distanceMatrix.Human.Chimpanzee,
        0.25
    );

    assert.ok(body.analysis.newick.endsWith(";"));
});


// TEST 3: Aligned DNA analysis.
test("POST /api/analyze/aligned returns an aligned analysis", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences: {
                    Human: "AT-GC",
                    Chimpanzee: "AT-AC",
                    Gorilla: "AT-GA"
                }
            })

        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(
        body.analysis.distanceMatrix.Human.Chimpanzee,
        0.25
    );
});


// TEST 4: Invalid DNA input.
test("POST /api/analyze rejects invalid DNA sequences", async () => {

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sequences: {
                Human: "ATGX",
                Chimpanzee: "ATAC"
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Both inputs must be valid DNA sequences."
    );
});


// TEST 5: Reject malformed JSON.
test("POST /api/analyze rejects malformed JSON", async () => {

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: '{"sequences":'

    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body contains invalid JSON."
    );
});


// TEST 6: Reject a request without the sequences property.
test("POST /api/analyze rejects a missing sequences property", async () => {

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            organisms: {
                Human: "ATGC",
                Chimpanzee: "ATAC"
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body must contain a sequences property."
    );
});


// TEST 7: Reject an array instead of a JSON object.
test("POST /api/analyze rejects an array request body", async () => {

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify([
            "ATGC",
            "ATAC"
        ])

    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body must be a JSON object."
    );
});


// TEST 8: Reject a request body larger than 100 KB.
test("POST /api/analyze rejects oversized request bodies", async () => {

    const oversizedSequence = "A".repeat(101 * 1024);

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sequences: {
                Human: oversizedSequence,
                Chimpanzee: "ATAC"
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 413);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body exceeds the 100kb limit."
    );
});