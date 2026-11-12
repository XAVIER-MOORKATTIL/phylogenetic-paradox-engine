
const crypto = require("node:crypto");

const fs = require("node:fs/promises");

const path = require("node:path");


// STEP 1: Define the default analysis storage directory.
const DEFAULT_STORAGE_DIRECTORY = path.resolve(
    __dirname,
    "..",
    "data",
    "analyses"
);


// STEP 2: Validate an analysis record.
function validateAnalysisRecord(record) {

    if (
        record === null ||
        typeof record !== "object" ||
        Array.isArray(record)
    ) {
        throw new Error(
            "Analysis record must be an object."
        );
    }


    // STEP 3: Verify that provenance is present.
    if (
        record.provenance === null ||
        typeof record.provenance !== "object" ||
        Array.isArray(record.provenance)
    ) {
        throw new Error(
            "Provenance must be an object."
        );
    }


    // STEP 4: Verify that analysis results are present.
    if (
        record.analysis === null ||
        typeof record.analysis !== "object" ||
        Array.isArray(record.analysis)
    ) {
        throw new Error(
            "Analysis must be an object."
        );
    }

}


// STEP 5: Save an analysis record as a JSON file.
async function saveAnalysisRecord(
    record,
    directory = DEFAULT_STORAGE_DIRECTORY
) {

    // Validate the record before performing filesystem operations.
    validateAnalysisRecord(record);


    // Validate the destination directory.
    if (
        typeof directory !== "string" ||
        directory.trim().length === 0
    ) {
        throw new Error(
            "Storage directory must be a valid path."
        );
    }


    // STEP 6: Generate a unique record identifier.
    const id = crypto.randomUUID();


    // STEP 7: Generate the save timestamp.
    const savedAt = new Date().toISOString();


    // STEP 8: Construct the persistent record.
    const savedRecord = {

        id,

        savedAt,

        provenance: record.provenance,

        analysis: record.analysis

    };


    // STEP 9: Serialize the record into formatted JSON.
    let serializedRecord;

    try {

        serializedRecord = JSON.stringify(
            savedRecord,
            null,
            2
        );

    } catch (error) {

        throw new Error(
            `Analysis record must be JSON-serializable: ${error.message}`
        );

    }


    if (typeof serializedRecord !== "string") {

        throw new Error(
            "Analysis record must be JSON-serializable."
        );

    }


    // STEP 10: Create the storage directory if necessary.
    await fs.mkdir(directory, {
        recursive: true
    });


    // STEP 11: Construct the JSON filename.
    const filePath = path.join(
        directory,
        `${id}.json`
    );


    // STEP 12: Write the record without overwriting existing files.
    await fs.writeFile(
        filePath,
        `${serializedRecord}\n`,
        {
            encoding: "utf8",
            flag: "wx"
        }
    );


    // STEP 13: Return the saved record's location and identity.
    return {
        id,
        savedAt,
        filePath
    };

}


// STEP 14: Export the storage function.
module.exports = {
    saveAnalysisRecord
};