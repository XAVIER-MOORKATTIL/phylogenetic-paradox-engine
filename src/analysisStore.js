
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



// STEP 14: Retrieve a saved analysis record by its identifier.
async function getAnalysisRecord(
    id,
    directory = DEFAULT_STORAGE_DIRECTORY
) {

    // Validate the record identifier before constructing a file path.
    if (
        typeof id !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ) {
        throw new Error(
            "Analysis record ID must be a valid UUID."
        );
    }


    // Validate the storage directory.
    if (
        typeof directory !== "string" ||
        directory.trim().length === 0
    ) {
        throw new Error(
            "Storage directory must be a valid path."
        );
    }

    // Verify that the storage path exists and is a directory.
    let directoryStats;

    try {

        directoryStats = await fs.stat(directory);

    } catch (error) {

        // A missing storage directory means no records exist.
        if (error.code === "ENOENT") {
            return null;
        }

        // Other filesystem errors must reach the caller.
        throw error;

    }

    // Reject a regular file being used as a storage directory.
    if (!directoryStats.isDirectory()) {

        throw new Error(
            "Analysis storage path is not a directory."
        );

    }


    // Construct the expected JSON file path.
    const filePath = path.join(
        directory,
        `${id}.json`
    );


    // STEP 15: Read the stored JSON record.
    let fileContents;

    try {

        fileContents = await fs.readFile(
            filePath,
            "utf8"
        );

    } catch (error) {

        // A missing record is a normal lookup result.
        if (error.code === "ENOENT") {
            return null;
        }

        // Other filesystem failures must reach the caller.
        throw error;

    }


    // STEP 16: Parse the JSON record.
    let savedRecord;

    try {

        savedRecord = JSON.parse(fileContents);

    } catch (error) {

        throw new Error(
            `Stored analysis record contains invalid JSON: ${error.message}`
        );

    }


    // STEP 17: Return the retrieved record.
    return savedRecord;

}



// STEP 18: List saved analysis records.
async function listAnalysisRecords(
    directory = DEFAULT_STORAGE_DIRECTORY
) {

    // Part 1: Validate the storage directory path.
    if (
        typeof directory !== "string" ||
        directory.trim().length === 0
    ) {
        throw new Error(
            "Storage directory must be a valid path."
        );
    }


    // Part 2: Check whether the storage directory exists.
    let directoryStats;

    try {

        directoryStats = await fs.stat(directory);

    } catch (error) {

        // A missing directory means there are no saved records.
        if (error.code === "ENOENT") {
            return [];
        }

        throw error;

    }


    // Part 3: Ensure the storage path is a directory.
    if (!directoryStats.isDirectory()) {

        throw new Error(
            "Analysis storage path is not a directory."
        );

    }


    // Part 4: Read the directory entries.
    const entries = await fs.readdir(
        directory,
        {
            withFileTypes: true
        }
    );


    // Part 5: Select JSON files only.
    const jsonFiles = entries.filter(entry =>
        entry.isFile() &&
        entry.name.endsWith(".json")
    );


    // Part 6: Read and parse every saved record.
    const records = await Promise.all(
        jsonFiles.map(async entry => {

            const filePath = path.join(
                directory,
                entry.name
            );

            const fileContents = await fs.readFile(
                filePath,
                "utf8"
            );

            let savedRecord;

            try {

                savedRecord = JSON.parse(fileContents);

            } catch (error) {

                throw new Error(
                    `Stored analysis record contains invalid JSON: ${error.message}`
                );

            }


            // Validate the stored record structure.
            validateAnalysisRecord(savedRecord);


            // Ensure the record ID matches its filename.
            const expectedId = entry.name.slice(0, -5);

            if (
                savedRecord.id !== expectedId ||
                typeof savedRecord.savedAt !== "string"
            ) {
                throw new Error(
                    "Stored analysis record has invalid metadata."
                );
            }


            // Return a lightweight summary.
            return {
                id: savedRecord.id,
                savedAt: savedRecord.savedAt,
                provenance: savedRecord.provenance
            };

        })
    );


    // Part 7: Sort newest records first.
    records.sort((a, b) =>
        b.savedAt.localeCompare(a.savedAt)
    );


    return records;

}


// STEP 19: Delete a saved analysis record by its identifier.
async function deleteAnalysisRecord(
    id,
    directory = DEFAULT_STORAGE_DIRECTORY
) {

    // Part 1: Validate the record identifier.
    if (
        typeof id !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ) {
        throw new Error(
            "Analysis record ID must be a valid UUID."
        );
    }


    // Part 2: Validate the storage directory path.
    if (
        typeof directory !== "string" ||
        directory.trim().length === 0
    ) {
        throw new Error(
            "Storage directory must be a valid path."
        );
    }


    // Part 3: Verify that the storage directory exists.
    let directoryStats;

    try {

        directoryStats = await fs.stat(directory);

    } catch (error) {

        // A missing directory means there is nothing to delete.
        if (error.code === "ENOENT") {
            return false;
        }

        throw error;

    }


    // Part 4: Reject a regular file used as a storage directory.
    if (!directoryStats.isDirectory()) {

        throw new Error(
            "Analysis storage path is not a directory."
        );

    }


    // Part 5: Construct the exact JSON filename.
    const filePath = path.join(
        directory,
        `${id}.json`
    );


    // Part 6: Delete the record.
    try {

        await fs.unlink(filePath);

        return true;

    } catch (error) {

        // A missing record is not a filesystem failure.
        if (error.code === "ENOENT") {
            return false;
        }

        throw error;

    }

}

// STEP 19: Export the storage functions.
module.exports = {
    validateAnalysisRecord,
    saveAnalysisRecord,
    getAnalysisRecord,
    listAnalysisRecords,
    deleteAnalysisRecord
};