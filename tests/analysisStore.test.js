
const test = require("node:test");
const assert = require("node:assert/strict");

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const {
    saveAnalysisRecord
} = require("../src/analysisStore");


// Create a temporary directory for each test.
async function createTemporaryDirectory() {

    return fs.mkdtemp(
        path.join(os.tmpdir(), "phylogenetic-engine-")
    );

}


// Sample analysis record.
function createSampleRecord() {

    return {

        provenance: {
            generatedAt: "2026-11-12T00:00:00.000Z",

            software: {
                name: "phylogenetic-paradox-engine",
                version: "1.0.0"
            },

            input: {
                format: "fasta",
                sha256: "a".repeat(64),
                sequenceDataSha256: "b".repeat(64),
                sequenceCount: 2
            },

            source: {
                status: "not-provided"
            },

            analysis: {
                distanceMethod: "uncorrected p-distance",
                treeMethod: "UPGMA",
                outputFormat: "Newick"
            }

        },

        analysis: {
            distanceMatrix: {
                "Homo sapiens": {
                    "Homo sapiens": 0,
                    "Pan troglodytes": 0.25
                },

                "Pan troglodytes": {
                    "Homo sapiens": 0.25,
                    "Pan troglodytes": 0
                }
            },

            tree: {
                name: null
            },

            newick: "(Homo_sapiens,Pan_troglodytes);"
        }

    };

}


// TEST 1: Save an analysis record as a JSON file.
test("saves an analysis record as a JSON file", async t => {

    const directory = await createTemporaryDirectory();

    t.after(async () => {
        await fs.rm(directory, {
            recursive: true,
            force: true
        });
    });

    const record = createSampleRecord();

    const result = await saveAnalysisRecord(
        record,
        directory
    );

    assert.ok(result.id);

    assert.ok(
        result.filePath.endsWith(".json")
    );

    const fileContents = await fs.readFile(
        result.filePath,
        "utf8"
    );

    const savedRecord = JSON.parse(fileContents);

    assert.equal(savedRecord.id, result.id);

    assert.deepEqual(
        savedRecord.provenance,
        record.provenance
    );

    assert.deepEqual(
        savedRecord.analysis,
        record.analysis
    );

});


// TEST 2: Generate a unique identifier for each record.
test("generates unique identifiers for different records", async t => {

    const directory = await createTemporaryDirectory();

    t.after(async () => {
        await fs.rm(directory, {
            recursive: true,
            force: true
        });
    });

    const firstRecord = await saveAnalysisRecord(
        createSampleRecord(),
        directory
    );

    const secondRecord = await saveAnalysisRecord(
        createSampleRecord(),
        directory
    );

    assert.notEqual(
        firstRecord.id,
        secondRecord.id
    );

});


// TEST 3: Generate valid UUID identifiers.
test("generates UUID-format record identifiers", async t => {

    const directory = await createTemporaryDirectory();

    t.after(async () => {
        await fs.rm(directory, {
            recursive: true,
            force: true
        });
    });

    const result = await saveAnalysisRecord(
        createSampleRecord(),
        directory
    );

    assert.match(
        result.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

});


// TEST 4: Record a valid ISO 8601 save timestamp.
test("records an ISO 8601 save timestamp", async t => {

    const directory = await createTemporaryDirectory();

    t.after(async () => {
        await fs.rm(directory, {
            recursive: true,
            force: true
        });
    });

    const result = await saveAnalysisRecord(
        createSampleRecord(),
        directory
    );

    assert.equal(
        Number.isNaN(Date.parse(result.savedAt)),
        false
    );

    const savedRecord = JSON.parse(
        await fs.readFile(result.filePath, "utf8")
    );

    assert.equal(
        savedRecord.savedAt,
        result.savedAt
    );

});


// TEST 5: Create the storage directory when it does not exist.
test("creates the storage directory automatically", async t => {

    const parentDirectory = await createTemporaryDirectory();

    t.after(async () => {
        await fs.rm(parentDirectory, {
            recursive: true,
            force: true
        });
    });

    const directory = path.join(
        parentDirectory,
        "nested",
        "analyses"
    );

    await saveAnalysisRecord(
        createSampleRecord(),
        directory
    );

    const stats = await fs.stat(directory);

    assert.equal(stats.isDirectory(), true);

});


// TEST 6: Reject invalid record input.
test("rejects a record that is not an object", async () => {

    await assert.rejects(
        () => saveAnalysisRecord(null),
        /Analysis record must be an object/
    );

});


// TEST 7: Reject records without provenance.
test("rejects a record with missing provenance", async () => {

    await assert.rejects(
        () => saveAnalysisRecord({
            analysis: {}
        }),
        /Provenance must be an object/
    );

});


// TEST 8: Reject records without analysis results.
test("rejects a record with missing analysis results", async () => {

    await assert.rejects(
        () => saveAnalysisRecord({
            provenance: {}
        }),
        /Analysis must be an object/
    );

});


// TEST 9: Reject circular records that cannot be serialized.
test("rejects records containing circular references", async () => {

    const record = createSampleRecord();

    record.provenance.circularReference = record.provenance;

    await assert.rejects(
        () => saveAnalysisRecord(record),
        /JSON-serializable/
    );

});