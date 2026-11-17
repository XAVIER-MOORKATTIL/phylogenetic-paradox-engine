const { isDeepStrictEqual } = require("node:util");

const {
    listAnalysisRecords,
    getAnalysisRecord,
    validateAnalysisRecord
} = require("../src/analysisStore");

const {
    openMongoConnection
} = require("../src/mongoConnection");


async function migrateAnalyses() {

    // STEP 1: Select migration mode.
    const apply = process.argv.includes("--apply");

    // STEP 2: Read the existing local records.
    const summaries = await listAnalysisRecords();

    const records = [];

    for (const summary of summaries) {

        const record = await getAnalysisRecord(
            summary.id
        );

        validateAnalysisRecord(record);

        if (
            record.id !== summary.id ||
            record.savedAt !== summary.savedAt
        ) {
            throw new Error(
                "Stored record metadata mismatch."
            );
        }

        records.push(record);

    }

    console.log("Local records:", records.length);


    // STEP 3: Connect to MongoDB.
    const {
        client,
        database
    } = await openMongoConnection();

    try {

        const collection = database.collection(
            "analyses"
        );

        const pending = [];

        let existingCount = 0;


        // STEP 4: Check for existing records and conflicts.
        for (const record of records) {

            const existing = await collection.findOne(
                { _id: record.id },
                { projection: { _id: 0 } }
            );

            if (existing === null) {

                pending.push(record);

            } else {

                if (!isDeepStrictEqual(existing, record)) {

                    console.error(
                        "Conflicting record ID:",
                        record.id
                    );

                    throw new Error(
                        "Migration conflict detected."
                    );

                }

                existingCount++;

            }

        }

        console.log("Already present:", existingCount);
        console.log("Ready to migrate:", pending.length);


        // STEP 5: Stop here when running a dry run.
        if (!apply) {

            console.log(
                "DRY RUN: No database records modified."
            );

            return;

        }


        // STEP 6: Insert missing records only.
        let insertedCount = 0;

        for (const record of pending) {

            const result = await collection.updateOne(
                { _id: record.id },
                {
                    $setOnInsert: record
                },
                {
                    upsert: true
                }
            );

            insertedCount += result.upsertedCount;

        }


        // STEP 7: Verify every migrated record.
        for (const record of records) {

            const stored = await collection.findOne(
                { _id: record.id },
                { projection: { _id: 0 } }
            );

            if (!isDeepStrictEqual(stored, record)) {

                console.error(
                    "Verification failed for:",
                    record.id
                );

                throw new Error(
                    "Migrated record differs from original."
                );

            }

        }

        console.log("Inserted records:", insertedCount);
        console.log("Verified records:", records.length);

        console.log("Migration completed successfully.");
        console.log("Original JSON files preserved.");

    } finally {

        await client.close();

    }

}


migrateAnalyses().catch(error => {

    console.error(
        "Migration failed:",
        error.name
    );

    process.exitCode = 1;

});