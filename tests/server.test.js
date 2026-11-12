
const {
    test,
    before,
    after
} = require("node:test");

const assert = require("node:assert/strict");

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const app = require("../src/server");

// ============================================================
// TEST SERVER CONFIGURATION
// ============================================================

// Store the temporary test server.
let server;
let baseUrl;
let analysisStorageDirectory;
let originalAnalysisStorageDirectory;

// Start the server before executing API tests.
before(async () => {


    // Preserve any previously configured storage directory.
    originalAnalysisStorageDirectory =
        process.env.ANALYSIS_STORAGE_DIRECTORY;


    // Create an isolated temporary storage directory.
    analysisStorageDirectory = await fs.mkdtemp(
        path.join(os.tmpdir(), "phylogenetic-api-tests-")
    );


    // Tell the Express API to use temporary storage.
    process.env.ANALYSIS_STORAGE_DIRECTORY =
        analysisStorageDirectory;


    // Port 0 allows Windows to assign an available port.
    server = app.listen(0);


    // Wait until the server starts listening.
    await new Promise(resolve => {
        server.once("listening", resolve);
    });


    // Retrieve the port assigned by Windows.
    const address = server.address();


    // Construct the base URL for API requests.
    baseUrl = `http://127.0.0.1:${address.port}`;

});

// Close the temporary server after all tests finish.
after(async () => {

    // Stop the temporary HTTP server.
    if (server) {

        await new Promise((resolve, reject) => {

            server.close(error => {

                if (error) {
                    reject(error);
                } else {
                    resolve();
                }

            });

        });

    }


    // Delete the temporary analysis storage directory.
    if (analysisStorageDirectory) {

        await fs.rm(analysisStorageDirectory, {
            recursive: true,
            force: true
        });

    }


    // Restore the original environment variable.
    if (originalAnalysisStorageDirectory === undefined) {

        delete process.env.ANALYSIS_STORAGE_DIRECTORY;

    } else {

        process.env.ANALYSIS_STORAGE_DIRECTORY =
            originalAnalysisStorageDirectory;

    }

});

// ============================================================
// BASIC API FUNCTIONALITY
// ============================================================

// TEST 1: Verify the API health endpoint.
test("GET /api/health returns API status", async () => {

    const response = await fetch(
        `${baseUrl}/api/health`
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");

});

// TEST 2: Verify ordinary DNA analysis.
test("POST /api/analyze returns a phylogenetic analysis", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
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
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(
        body.analysis.distanceMatrix.Human.Chimpanzee,
        0.25
    );

    assert.ok(
        body.analysis.newick.endsWith(";")
    );

});

// TEST 3: Verify aligned DNA analysis.
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

// ============================================================
// REQUEST VALIDATION
// ============================================================

// TEST 4: Reject invalid DNA sequences.
test("POST /api/analyze rejects invalid DNA sequences", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
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
        }
    );

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

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: '{"sequences":'
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body contains invalid JSON."
    );

});

// TEST 6: Reject requests without a sequences property.
test("POST /api/analyze rejects a missing sequences property", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
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
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body must contain a sequences property."
    );

});

// TEST 7: Reject arrays instead of JSON objects.
test("POST /api/analyze rejects an array request body", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify([
                "ATGC",
                "ATAC"
            ])
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body must be a JSON object."
    );

});

// TEST 8: Reject request bodies larger than 100 KB.
test("POST /api/analyze rejects oversized request bodies", async () => {

    const oversizedSequence = "A".repeat(101 * 1024);

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
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
        }
    );

    const body = await response.json();

    assert.equal(response.status, 413);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body exceeds the 100kb limit."
    );

});

// ============================================================
// SCIENTIFIC TAXON-NAME VALIDATION
// ============================================================

// TEST 9: Reject invalid taxon names in ordinary analysis.
test("POST /api/analyze rejects invalid species names", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences: {
                    "Human@species": "ATGC",
                    Chimpanzee: "ATAC"
                }
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(
        body.error,
        /Species names must start with a letter/
    );

});

// TEST 10: Accept scientific taxon names containing spaces.
test("POST /api/analyze accepts scientific taxon names containing spaces", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences: {
                    "Homo sapiens": "ATGC",
                    "Pan troglodytes": "ATAC"
                }
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.match(
        body.analysis.newick,
        /'Homo sapiens'/
    );

    assert.match(
        body.analysis.newick,
        /'Pan troglodytes'/
    );

});

// TEST 11: Reject more than 50 organisms in ordinary analysis.
test("POST /api/analyze rejects more than 50 organisms", async () => {

    const sequences = Object.fromEntries(

        Array.from(
            { length: 51 },
            (_, index) => [
                `Species_${index + 1}`,
                "ATGC"
            ]
        )

    );

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences
            })
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

// TEST 12: Reject DNA sequences longer than 10000 characters.
test("POST /api/analyze rejects sequences longer than 10000 characters", async () => {

    const longSequence = "A".repeat(10001);

    const response = await fetch(
        `${baseUrl}/api/analyze`,
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

// TEST 13: Reject invalid taxon names in aligned analysis.
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
                    "Human@species": "AT-GC",
                    Chimpanzee: "AT-AC"
                }
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(
        body.error,
        /Species names must start with a letter/
    );

});

// TEST 14: Accept scientific taxon names in aligned analysis.
test("POST /api/analyze/aligned accepts scientific taxon names containing spaces", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences: {
                    "Homo sapiens": "AT-GC",
                    "Pan troglodytes": "AT-AC"
                }
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(
        body.analysis.distanceMatrix["Homo sapiens"]["Pan troglodytes"],
        0.25
    );

    assert.match(
        body.analysis.newick,
        /'Homo sapiens'/
    );

    assert.match(
        body.analysis.newick,
        /'Pan troglodytes'/
    );

});

// TEST 15: Reject more than 50 organisms in aligned analysis.
test("POST /api/analyze/aligned rejects more than 50 organisms", async () => {

    const sequences = Object.fromEntries(

        Array.from(
            { length: 51 },
            (_, index) => [
                `Species_${index + 1}`,
                "AT-GC"
            ]
        )

    );

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences
            })
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

// TEST 16: Reject oversized aligned DNA sequences.
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

// ============================================================
// INPUT BOUNDARY TESTS
// ============================================================

// TEST 17: Accept exactly 50 organisms in ordinary analysis.
test("POST /api/analyze accepts exactly 50 organisms", async () => {

    const sequences = Object.fromEntries(

        Array.from(
            { length: 50 },
            (_, index) => [
                `Species_${index + 1}`,
                "ATGC"
            ]
        )

    );

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(
        Object.keys(body.analysis.distanceMatrix).length,
        50
    );

});

// TEST 18: Accept exactly 50 organisms in aligned analysis.
test("POST /api/analyze/aligned accepts exactly 50 organisms", async () => {

    const sequences = Object.fromEntries(

        Array.from(
            { length: 50 },
            (_, index) => [
                `Species_${index + 1}`,
                "AT-GC"
            ]
        )

    );

    const response = await fetch(
        `${baseUrl}/api/analyze/aligned`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(
        Object.keys(body.analysis.distanceMatrix).length,
        50
    );

});

// TEST 19: Accept exactly 10000 DNA characters in ordinary analysis.
test("POST /api/analyze accepts DNA sequences of exactly 10000 characters", async () => {

    const sequence = "A".repeat(10000);

    const response = await fetch(
        `${baseUrl}/api/analyze`,
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

    assert.equal(
        body.analysis.distanceMatrix.Human.Chimpanzee,
        0
    );

});

// TEST 20: Accept exactly 10000 aligned DNA characters.
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

    assert.equal(
        body.analysis.distanceMatrix.Human.Chimpanzee,
        0
    );

});

// TEST 21: Accept a taxon name containing exactly 50 characters.
test("POST /api/analyze accepts a species name of exactly 50 characters", async () => {

    const speciesName = "A" + "b".repeat(49);

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
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
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.ok(
        body.analysis.distanceMatrix[speciesName]
    );

});

// TEST 22: Reject a taxon name containing 51 characters.
test("POST /api/analyze rejects a species name of 51 characters", async () => {

    const speciesName = "A" + "b".repeat(50);

    const response = await fetch(
        `${baseUrl}/api/analyze`,
        {
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
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(
        body.error,
        /Species names must start with a letter/
    );

});


// ============================================================
// FASTA API TESTS
// ============================================================


// TEST 23: Analyze valid FASTA input.
test("POST /api/analyze/fasta returns a phylogenetic analysis", async () => {

    const fasta = `
>Homo sapiens
ATGC
>Pan troglodytes
ATAC
>Gorilla gorilla
ATGA
`;

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fasta
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(
        body.analysis.distanceMatrix["Homo sapiens"]["Pan troglodytes"],
        0.25
    );

    assert.ok(
        body.analysis.newick.includes("Homo sapiens")
    );

    assert.ok(
        body.analysis.newick.includes("Pan troglodytes")
    );

});


// TEST 24: Reject a request without a FASTA property.
test("POST /api/analyze/fasta rejects a missing fasta property", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                sequences: {
                    Human: "ATGC"
                }
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(
        body.error,
        /fasta property/
    );

});


// TEST 25: Reject non-string FASTA input.
test("POST /api/analyze/fasta rejects non-string input", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fasta: 123
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(
        body.error,
        /FASTA input must be a string/
    );

});


// TEST 26: Reject invalid DNA characters in FASTA input.
test("POST /api/analyze/fasta rejects invalid DNA sequences", async () => {

    const fasta = `
>Homo sapiens
ATGN
>Pan troglodytes
ATAC
`;

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fasta
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(
        body.error,
        /empty or invalid DNA sequence/
    );

});


// TEST 27: Reject malformed JSON sent to the FASTA endpoint.
test("POST /api/analyze/fasta rejects malformed JSON", async () => {

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: "{ invalid json"
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.equal(
        body.error,
        "Request body contains invalid JSON."
    );

});


// ============================================================
// PROVENANCE API TESTS
// ============================================================


// TEST 28: Return provenance with successful FASTA analysis.
test("POST /api/analyze/fasta returns analysis provenance", async () => {

    const fasta = `
>Homo sapiens
ATGC
>Pan troglodytes
ATAC
`;

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fasta
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(body.provenance.input.format, "fasta");

    assert.equal(
        body.provenance.input.sequenceCount,
        2
    );

    assert.match(
        body.provenance.input.sha256,
        /^[a-f0-9]{64}$/
    );

    assert.match(
        body.provenance.input.sequenceDataSha256,
        /^[a-f0-9]{64}$/
    );

    assert.equal(
        body.provenance.source.status,
        "not-provided"
    );

    assert.equal(
        body.provenance.analysis.treeMethod,
        "UPGMA"
    );

});


// TEST 29: Preserve optional source metadata.
test("POST /api/analyze/fasta records user-provided source metadata", async () => {

    const fasta = `
>Homo sapiens
ATGC
>Pan troglodytes
ATAC
`;

    const sourceMetadata = {
        type: "synthetic",
        description: "Artificial sequences created for software testing."
    };

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fasta,
                sourceMetadata
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);

    assert.equal(
        body.provenance.source.status,
        "user-provided"
    );

    assert.deepEqual(
        body.provenance.source.details,
        sourceMetadata
    );

});


// TEST 30: Reject invalid source metadata.
test("POST /api/analyze/fasta rejects invalid source metadata", async () => {

    const fasta = `
>Homo sapiens
ATGC
>Pan troglodytes
ATAC
`;

    const response = await fetch(
        `${baseUrl}/api/analyze/fasta`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fasta,
                sourceMetadata: "unknown source"
            })
        }
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);

    assert.match(
        body.error,
        /Source metadata must be an object/
    );

});

// ============================================================
// PERSISTENT ANALYSIS STORAGE API TESTS
// ============================================================


// TEST 31: Save successful FASTA analysis as a persistent JSON record.
test("POST /api/analyze/fasta saves a persistent analysis record", async () => {

    const fasta = `
>Homo sapiens
ATGC
>Pan troglodytes
ATAC
`;

    const sourceMetadata = {
        type: "synthetic",
        description: "Artificial sequences created for software testing."
    };

    let recordPath;

    try {

        const response = await fetch(
            `${baseUrl}/api/analyze/fasta`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    fasta,
                    sourceMetadata
                })
            }
        );

        const body = await response.json();

        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        // The API must not expose the computer's local filesystem path.
assert.equal(
    Object.prototype.hasOwnProperty.call(
        body.record,
        "filePath"
    ),
    false
);

        // Verify the returned persistent record identifier.
        assert.match(
            body.record.id,
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );

        // Verify the save timestamp.
        assert.equal(
            Number.isNaN(Date.parse(body.record.savedAt)),
            false
        );


        // Locate the expected JSON record.
        recordPath = path.join(
    analysisStorageDirectory,
    `${body.record.id}.json`
);


        // Read the persistent record from disk.
        const fileContents = await fs.readFile(
            recordPath,
            "utf8"
        );

        const savedRecord = JSON.parse(fileContents);


        // Verify the record identifier.
        assert.equal(
            savedRecord.id,
            body.record.id
        );


        // Verify the provenance was saved.
        assert.deepEqual(
            savedRecord.provenance,
            body.provenance
        );


        // Verify the analysis results were saved.
        assert.deepEqual(
            savedRecord.analysis,
            body.analysis
        );


        // Verify the source metadata survived persistence.
        assert.deepEqual(
            savedRecord.provenance.source.details,
            sourceMetadata
        );

    } finally {

        // Remove the temporary record created by this test.
        if (recordPath) {
            await fs.rm(recordPath, {
                force: true
            });
        }

    }

});

// TEST 32: Return HTTP 500 when persistent storage fails.
test("POST /api/analyze/fasta returns HTTP 500 when storage fails", async () => {

    const fasta = `
>Homo sapiens
ATGC
>Pan troglodytes
ATAC
`;

    // Preserve the original storage configuration.
    const originalStorageDirectory =
        process.env.ANALYSIS_STORAGE_DIRECTORY;

    // Create a file where the storage directory is expected.
    const invalidStoragePath = path.join(
        analysisStorageDirectory,
        "storage-is-a-file"
    );

    try {

        await fs.writeFile(
            invalidStoragePath,
            "This is a file, not a directory."
        );

        // Force the storage operation to fail.
        process.env.ANALYSIS_STORAGE_DIRECTORY =
            invalidStoragePath;

        const response = await fetch(
            `${baseUrl}/api/analyze/fasta`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    fasta
                })
            }
        );

        const body = await response.json();

        // Storage failure must be treated as a server error.
        assert.equal(response.status, 500);
        assert.equal(body.success, false);

        assert.equal(
            body.error,
            "Internal server error."
        );

    } finally {

        // Restore the original storage configuration.
        if (originalStorageDirectory === undefined) {
            delete process.env.ANALYSIS_STORAGE_DIRECTORY;
        } else {
            process.env.ANALYSIS_STORAGE_DIRECTORY =
                originalStorageDirectory;
        }

        // Remove the temporary file.
        await fs.rm(invalidStoragePath, {
            force: true
        });

    }

});