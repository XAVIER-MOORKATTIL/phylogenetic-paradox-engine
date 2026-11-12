
const crypto = require("node:crypto");

const packageMetadata = require("../package.json");

const {
    isValidDnaSequence,
    isValidAlignedDnaSequence,
    validateSequenceCollectionLimits
} = require("./sequence");


// Calculate a SHA-256 fingerprint.
function calculateSha256(value) {

    return crypto
        .createHash("sha256")
        .update(value, "utf8")
        .digest("hex");

}


// Validate the sequence collection.
function validateSequences(sequences, analysisType) {

    if (
        sequences === null ||
        typeof sequences !== "object" ||
        Array.isArray(sequences)
    ) {
        throw new Error(
            "Sequences must be a valid object."
        );
    }

    const taxonNames = Object.keys(sequences);

    if (taxonNames.length < 2) {
        throw new Error(
            "At least two sequences are required."
        );
    }

    // Reuse the existing collection-level validation.
    validateSequenceCollectionLimits(sequences);


    // Validate every DNA sequence.
    for (const name of taxonNames) {

        const sequence = sequences[name];

        const isValid = analysisType === "ordinary"
            ? isValidDnaSequence(sequence)
            : isValidAlignedDnaSequence(sequence);

        if (!isValid) {
            throw new Error(
                `Invalid DNA sequence for taxon "${name}".`
            );
        }

    }


    // Aligned sequences must have equal lengths.
    if (analysisType === "aligned") {

        const lengths = taxonNames.map(
            name => sequences[name].trim().length
        );

        if (!lengths.every(length => length === lengths[0])) {
            throw new Error(
                "Aligned sequences must have equal lengths."
            );
        }

    }

    return taxonNames;

}


// Create a reproducible analysis provenance record.
function createAnalysisProvenance({

    inputFormat,
    originalInput,
    sequences,
    analysisType,
    sourceMetadata

} = {}) {


    // STEP 1: Validate the input format.
    const supportedFormats = [
        "fasta",
        "json"
    ];

    if (!supportedFormats.includes(inputFormat)) {
        throw new Error(
            "Unsupported input format."
        );
    }


    // STEP 2: Validate the original input.
    if (typeof originalInput !== "string") {
        throw new Error(
            "Original input must be a string."
        );
    }


    // STEP 3: Validate the analysis type.
    const supportedAnalysisTypes = [
        "ordinary",
        "aligned"
    ];

    if (!supportedAnalysisTypes.includes(analysisType)) {
        throw new Error(
            "Unsupported analysis type."
        );
    }


    // STEP 4: Validate source metadata when supplied.
    if (
        sourceMetadata !== undefined &&
        (
            sourceMetadata === null ||
            typeof sourceMetadata !== "object" ||
            Array.isArray(sourceMetadata)
        )
    ) {
        throw new Error(
            "Source metadata must be an object."
        );
    }


    // STEP 5: Validate the sequence collection.
    const taxonNames = validateSequences(
        sequences,
        analysisType
    );


    // STEP 6: Calculate the raw input fingerprint.
    const rawInputHash = calculateSha256(originalInput);


    // STEP 7: Sort taxon names for canonical ordering.
    const sortedTaxonNames = [...taxonNames].sort();


    // STEP 8: Create a deterministic representation
    // of taxon names and their sequences.
    const canonicalSequenceData = JSON.stringify(
    sortedTaxonNames.map(name => [
        name,
        sequences[name].trim().toUpperCase()
    ])
);


    // STEP 9: Calculate the canonical sequence fingerprint.
    const sequenceDataHash = calculateSha256(
        canonicalSequenceData
    );


    // STEP 10: Record taxon names and sequence lengths.
    const taxa = sortedTaxonNames.map(name => ({
        name,
        sequenceLength: sequences[name].trim().length
    }));


    // STEP 11: Record the analysis configuration.
    const analysisConfiguration = analysisType === "ordinary"

        ? {
            alignment: "not-performed",
            distanceMethod: "uncorrected p-distance",
            gapTreatment: "not-applicable",
            treeMethod: "UPGMA",
            outputFormat: "Newick"
        }

        : {
            alignment: "provided-alignment",
            distanceMethod: "gap-aware p-distance",
            gapTreatment: "pairwise deletion",
            treeMethod: "UPGMA",
            outputFormat: "Newick"
        };


    // STEP 12: Record biological source information.
    const source = sourceMetadata === undefined

        ? {
            status: "not-provided"
        }

        : {
            status: "user-provided",
            details: sourceMetadata
        };


    // STEP 13: Build the final provenance record.
    return {

        generatedAt: new Date().toISOString(),

        software: {
            name: packageMetadata.name,
            version: packageMetadata.version
        },

        input: {
            format: inputFormat,
            sha256: rawInputHash,
            sequenceDataSha256: sequenceDataHash,
            sequenceCount: taxa.length,
            taxa
        },

        source,

        analysis: analysisConfiguration

    };

}


// Export the public provenance function.
module.exports = {
    createAnalysisProvenance
};
