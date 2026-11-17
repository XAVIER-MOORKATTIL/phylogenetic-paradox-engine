const crypto = require("node:crypto");

const {
    validateAnalysisRecord
} = require("./analysisStore");


// STEP 1: Validate UUID identifiers.
function validateRecordId(id) {

    if (
        typeof id !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ) {
        throw new Error(
            "Analysis record ID must be a valid UUID."
        );
    }

}


// STEP 2: Create the MongoDB storage interface.
function createMongoAnalysisStore(
    database,
    collectionName = "analyses"
) {

    const collection = database.collection(collectionName);


    // STEP 3: Save an analysis record.
    async function saveAnalysisRecord(record) {

        validateAnalysisRecord(record);

        const id = crypto.randomUUID();
        const savedAt = new Date().toISOString();

        let savedRecord;

        try {

            savedRecord = JSON.parse(JSON.stringify({
                id,
                savedAt,
                provenance: record.provenance,
                analysis: record.analysis
            }));

        } catch (error) {

            throw new Error(
                `Analysis record must be JSON-serializable: ${error.message}`
            );

        }

        await collection.insertOne({
            _id: id,
            ...savedRecord
        });

        return {
            id,
            savedAt
        };

    }


    // STEP 4: Retrieve an analysis record.
    async function getAnalysisRecord(id) {

        validateRecordId(id);

        return collection.findOne(
            {
                _id: id
            },
            {
                projection: {
                    _id: 0
                }
            }
        );

    }


    // STEP 5: List saved analysis summaries.
    async function listAnalysisRecords() {

        return collection.find(
            {},
            {
                projection: {
                    _id: 0,
                    id: 1,
                    savedAt: 1,
                    provenance: 1
                }
            }
        )
        .sort({
            savedAt: -1,
            id: 1
        })
        .toArray();

    }


    // STEP 6: Delete an analysis record.
    async function deleteAnalysisRecord(id) {

        validateRecordId(id);

        const result = await collection.deleteOne({
            _id: id
        });

        return result.deletedCount === 1;

    }


    // STEP 7: Expose the storage operations.
    return {
        saveAnalysisRecord,
        getAnalysisRecord,
        listAnalysisRecords,
        deleteAnalysisRecord
    };

}


// STEP 8: Export the storage factory.
module.exports = {
    createMongoAnalysisStore
};