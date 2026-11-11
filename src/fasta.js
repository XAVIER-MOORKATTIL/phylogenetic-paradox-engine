
const {
    isValidDnaSequence,
    validateSequenceCollectionLimits
} = require("./sequence");


// Parse ordinary DNA sequences from FASTA text.
function parseFasta(fastaText) {

    // STEP 1: Validate the input type.
    if (typeof fastaText !== "string") {
        throw new Error("FASTA input must be a string.");
    }


    // STEP 2: Remove an optional UTF-8 byte order mark.
    const cleanedText = fastaText.replace(/^\uFEFF/, "");


    // STEP 3: Split the input into individual lines.
    // Supports Windows, Unix, and classic Mac line endings.
    const lines = cleanedText.split(/\r\n|\n|\r/);


    // STEP 4: Prepare the result and current-record variables.
    const sequences = {};

    let currentTaxon = null;

    let currentSequenceParts = [];


    // STEP 5: Save and validate the current FASTA record.
    function saveCurrentRecord() {

        if (currentTaxon === null) {
            return;
        }

        const sequence = currentSequenceParts.join("").toUpperCase();

        if (!isValidDnaSequence(sequence)) {
            throw new Error(
                `FASTA record "${currentTaxon}" contains an empty or invalid DNA sequence.`
            );
        }

        Object.defineProperty(sequences, currentTaxon, {
    value: sequence,
    enumerable: true,
    configurable: true,
    writable: true
});
    }


    // STEP 6: Process every line.
    for (const line of lines) {

        // Ignore completely blank or whitespace-only lines.
        if (line.trim().length === 0) {
            continue;
        }


        // STEP 7: Detect a FASTA header.
        if (line.startsWith(">")) {

            // Save the previous record before starting another.
            saveCurrentRecord();


            // Extract the taxon name after the ">" character.
            const taxonName = line.slice(1);


            // Reject an empty header.
            if (taxonName.trim().length === 0) {
                throw new Error(
                    "FASTA headers must contain a taxon name."
                );
            }


            // Reject duplicate taxon names.
            if (
                Object.prototype.hasOwnProperty.call(
                    sequences,
                    taxonName
                )
            ) {
                throw new Error(
                    `Duplicate taxon name: "${taxonName}".`
                );
            }


            // Start a new FASTA record.
            currentTaxon = taxonName;

            currentSequenceParts = [];

        } else {

            // STEP 8: Reject sequence data before the first header.
            if (currentTaxon === null) {
                throw new Error(
                    "Sequence data found before the first FASTA header."
                );
            }


            // STEP 9: Validate individual sequence lines.
            if (!/^[ACGT]+$/i.test(line)) {
                throw new Error(
                    `FASTA record "${currentTaxon}" contains an empty or invalid DNA sequence.`
                );
            }


            // Store the current sequence line.
            currentSequenceParts.push(line);

        }

    }


    // STEP 10: Save the final FASTA record.
    saveCurrentRecord();


    // STEP 11: Reject input without any FASTA records.
    if (Object.keys(sequences).length === 0) {
        throw new Error(
            "FASTA input must contain at least one record."
        );
    }


    // STEP 12: Apply the existing collection-level validation.
    validateSequenceCollectionLimits(sequences);


    // STEP 13: Return the parsed sequences.
    return sequences;

}


// Export the parser for use by other modules.
module.exports = {
    parseFasta
};
