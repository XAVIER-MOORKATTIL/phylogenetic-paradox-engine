const assert = require("node:assert/strict");

const {
    openMongoConnection
} = require("../src/mongoConnection");

const {
    createMongoAnalysisStore
} = require("../src/mongoAnalysisStore");


async function checkMongoAnalysisStore() {

    const {
        client,
        database
    } = await openMongoConnection();

    const store = createMongoAnalysisStore(
        database,
        "analysis_store_smoke_tests"
    );

    let recordId;

    try {

        // Artificial data for storage testing only.
        const sampleRecord = {
            provenance: {
                input: {
                    format: "fasta",
                    sequenceCount: 2
                }
            },
            analysis: {
                newick: "(Species_A:0.125,Species_B:0.125);"
            }
        };


        // TEST 1: Save.
        const saved = await store.saveAnalysisRecord(
            sampleRecord
        );

        recordId = saved.id;

        assert.ok(recordId);

        console.log("PASS: Save analysis");


        // TEST 2: Retrieve.
        const retrieved = await store.getAnalysisRecord(
            recordId
        );

        assert.deepEqual(
            retrieved.analysis,
            sampleRecord.analysis
        );

        console.log("PASS: Retrieve analysis");


        // TEST 3: List summaries.
        const records = await store.listAnalysisRecords();

        const summary = records.find(
            record => record.id === recordId
        );

        assert.ok(summary);

        assert.equal(
            Object.hasOwn(summary, "analysis"),
            false
        );

        console.log("PASS: List analysis summaries");


        // TEST 4: Delete the temporary test record.
        assert.equal(
            await store.deleteAnalysisRecord(recordId),
            true
        );

        console.log("PASS: Delete analysis");


        // TEST 5: Verify deletion.
        assert.equal(
            await store.getAnalysisRecord(recordId),
            null
        );

        console.log("PASS: Verify deleted record");

        console.log("\nAll MongoDB storage checks passed.");

    } finally {

        try {

            if (recordId) {
                await store.deleteAnalysisRecord(recordId);
            }

        } finally {

            await client.close();

        }

    }

}


checkMongoAnalysisStore().catch(error => {

    console.error(
        "MongoDB storage check failed:",
        error.name
    );

    process.exitCode = 1;

});