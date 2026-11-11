
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

// TEST 9: Reject invalid species names in ordinary analysis.
test("POST /api/analyze rejects invalid species names", async () => {

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sequences: {
                "Human species": "ATGC",
                Chimpanzee: "ATAC"
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(body.error, /Species names must start with a letter/);
});


// TEST 10: Reject more than 50 organisms in ordinary analysis.
test("POST /api/analyze rejects more than 50 organisms", async () => {

    const sequences = Object.fromEntries(

        Array.from(
            { length: 51 },
            (_, index) => [`Species_${index + 1}`, "ATGC"]
        )

    );

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ sequences })

    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "A maximum of 50 organisms is allowed."
    );
});


// TEST 11: Reject oversized DNA sequences in ordinary analysis.
test("POST /api/analyze rejects sequences longer than 10000 characters", async () => {

    const longSequence = "A".repeat(10001);

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sequences: {
                Human: longSequence,
                Chimpanzee: "ATAC"
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Each DNA sequence must contain at most 10000 characters."
    );
});


// TEST 12: Reject invalid species names in aligned analysis.
test("POST /api/analyze/aligned rejects invalid species names", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences: {
                    "Human species": "AT-GC",
                    Chimpanzee: "AT-AC"
                }
            })

        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(body.error, /Species names must start with a letter/);
});


// TEST 13: Reject more than 50 organisms in aligned analysis.
test("POST /api/analyze/aligned rejects more than 50 organisms", async () => {

    const sequences = Object.fromEntries(

        Array.from(
            { length: 51 },
            (_, index) => [`Species_${index + 1}`, "AT-GC"]
        )

    );

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ sequences })

        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "A maximum of 50 organisms is allowed."
    );
});


// TEST 14: Reject oversized DNA sequences in aligned analysis.
test("POST /api/analyze/aligned rejects sequences longer than 10000 characters", async () => {

    const longSequence = "A".repeat(10001);

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences: {
                    Human: longSequence,
                    Chimpanzee: "ATAC"
                }
            })

        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Each DNA sequence must contain at most 10000 characters."
    );
});

// TEST 15: Accept exactly 50 organisms in ordinary analysis.
test("POST /api/analyze accepts exactly 50 organisms", async () => {

    const sequences = Object.fromEntries(

        Array.from(
            { length: 50 },
            (_, index) => [`Species_${index + 1}`, "ATGC"]
        )

    );

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ sequences })

    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(Object.keys(body.analysis.distanceMatrix).length, 50);
});


// TEST 16: Accept exactly 50 organisms in aligned analysis.
test("POST /api/analyze/aligned accepts exactly 50 organisms", async () => {

    const sequences = Object.fromEntries(

        Array.from(
            { length: 50 },
            (_, index) => [`Species_${index + 1}`, "AT-GC"]
        )

    );

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ sequences })

        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(Object.keys(body.analysis.distanceMatrix).length, 50);
});


// TEST 17: Accept exactly 10000 DNA characters in ordinary analysis.
test("POST /api/analyze accepts DNA sequences of exactly 10000 characters", async () => {

    const sequence = "A".repeat(10000);

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sequences: {
                Human: sequence,
                Chimpanzee: sequence
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.analysis.distanceMatrix.Human.Chimpanzee, 0);
});


// TEST 18: Accept exactly 10000 aligned DNA characters.
test("POST /api/analyze/aligned accepts aligned sequences of exactly 10000 characters", async () => {

    const sequence = "A".repeat(10000);

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences: {
                    Human: sequence,
                    Chimpanzee: sequence
                }
            })

        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.analysis.distanceMatrix.Human.Chimpanzee, 0);
});


// TEST 19: Accept a species name of exactly 50 characters.
test("POST /api/analyze accepts a species name of exactly 50 characters", async () => {

    const speciesName = "A" + "b".repeat(49);

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sequences: {
                [speciesName]: "ATGC",
                Chimpanzee: "ATAC"
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.analysis.distanceMatrix[speciesName]);
});


// TEST 20: Reject a species name of 51 characters.
test("POST /api/analyze rejects a species name of 51 characters", async () => {

    const speciesName = "A" + "b".repeat(50);

    const response = await fetch(`${baseUrl}/api/analyze`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sequences: {
                [speciesName]: "ATGC",
                Chimpanzee: "ATAC"
            }
        })

    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(
        body.error,
        /Species names must start with a letter/
    );
});