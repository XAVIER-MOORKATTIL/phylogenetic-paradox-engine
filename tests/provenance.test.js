
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const {
    createAnalysisProvenance
} = require("../src/provenance");

const sequences = {
    "Homo sapiens": "ATGC",
    "Pan troglodytes": "ATAC"
};

const fastaText = `
>Homo sapiens
ATGC
>Pan troglodytes
ATAC
`;

// TEST 1: Generate a provenance record.
test("generates a provenance record for valid FASTA input", () => {

    const result = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    assert.equal(result.input.format, "fasta");

    assert.equal(result.input.sequenceCount, 2);

    assert.equal(result.software.name, "phylogenetic-paradox-engine");

});

// TEST 2: Record the SHA-256 hash of the original input.
test("records the SHA-256 hash of the original input", () => {

    const result = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    const expectedHash = crypto
        .createHash("sha256")
        .update(fastaText, "utf8")
        .digest("hex");

    assert.equal(result.input.sha256, expectedHash);

});

// TEST 3: Record sequence names and lengths.
test("records taxon names and sequence lengths", () => {

    const result = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    assert.deepEqual(result.input.taxa, [
        {
            name: "Homo sapiens",
            sequenceLength: 4
        },
        {
            name: "Pan troglodytes",
            sequenceLength: 4
        }
    ]);

});

// TEST 4: Generate a canonical sequence-data fingerprint.
test("generates a sequence-data SHA-256 fingerprint", () => {

    const result = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    assert.match(
        result.input.sequenceDataSha256,
        /^[a-f0-9]{64}$/
    );

});

// TEST 5: Keep the canonical sequence fingerprint independent of object key order.
test("generates the same sequence fingerprint regardless of object key order", () => {

    const reorderedSequences = {
        "Pan troglodytes": "ATAC",
        "Homo sapiens": "ATGC"
    };

    const firstResult = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    const secondResult = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences: reorderedSequences,
        analysisType: "ordinary"
    });

    assert.equal(
        firstResult.input.sequenceDataSha256,
        secondResult.input.sequenceDataSha256
    );

});

// TEST 6: Do not invent missing biological source information.
test("records missing biological source information explicitly", () => {

    const result = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    assert.deepEqual(result.source, {
        status: "not-provided"
    });

});

// TEST 7: Preserve explicitly supplied source information.
test("preserves source metadata supplied by the user", () => {

    const sourceMetadata = {
        type: "synthetic",
        description: "Artificial sequences created for software testing."
    };

    const result = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary",
        sourceMetadata
    });

    assert.deepEqual(result.source, {
        status: "user-provided",
        details: sourceMetadata
    });

});

// TEST 8: Record the ordinary analysis configuration.
test("records ordinary analysis methods", () => {

    const result = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    assert.deepEqual(result.analysis, {
        alignment: "not-performed",
        distanceMethod: "uncorrected p-distance",
        gapTreatment: "not-applicable",
        treeMethod: "UPGMA",
        outputFormat: "Newick"
    });

});

// TEST 9: Record the aligned analysis configuration.
test("records aligned analysis methods", () => {

    const result = createAnalysisProvenance({
        inputFormat: "json",
        originalInput: JSON.stringify(sequences),
        sequences,
        analysisType: "aligned"
    });

    assert.deepEqual(result.analysis, {
        alignment: "provided-alignment",
        distanceMethod: "gap-aware p-distance",
        gapTreatment: "pairwise deletion",
        treeMethod: "UPGMA",
        outputFormat: "Newick"
    });

});

// TEST 10: Record a valid ISO 8601 generation timestamp.
test("records an ISO 8601 generation timestamp", () => {

    const result = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    assert.equal(
        Number.isNaN(Date.parse(result.generatedAt)),
        false
    );

});

// TEST 11: Reject invalid input formats.
test("rejects unsupported input formats", () => {

    assert.throws(
        () => createAnalysisProvenance({
            inputFormat: "unknown",
            originalInput: fastaText,
            sequences,
            analysisType: "ordinary"
        }),
        /Unsupported input format/
    );

});

// TEST 12: Reject invalid analysis types.
test("rejects unsupported analysis types", () => {

    assert.throws(
        () => createAnalysisProvenance({
            inputFormat: "fasta",
            originalInput: fastaText,
            sequences,
            analysisType: "unknown"
        }),
        /Unsupported analysis type/
    );

});

// TEST 13: Reject non-string original input.
test("rejects non-string original input", () => {

    assert.throws(
        () => createAnalysisProvenance({
            inputFormat: "fasta",
            originalInput: 123,
            sequences,
            analysisType: "ordinary"
        }),
        /Original input must be a string/
    );

});

// TEST 14: Reject invalid sequence collections.
test("rejects invalid sequence collections", () => {

    assert.throws(
        () => createAnalysisProvenance({
            inputFormat: "fasta",
            originalInput: fastaText,
            sequences: null,
            analysisType: "ordinary"
        }),
        /Sequences must be a valid object/
    );

});

// TEST 15: Reject invalid source metadata.
test("rejects source metadata that is not an object", () => {

    assert.throws(
        () => createAnalysisProvenance({
            inputFormat: "fasta",
            originalInput: fastaText,
            sequences,
            analysisType: "ordinary",
            sourceMetadata: "unknown source"
        }),
        /Source metadata must be an object/
    );

});

// TEST 16: Normalize DNA letter case in the canonical fingerprint.
test("generates the same sequence fingerprint regardless of DNA letter case", () => {

    const lowercaseSequences = {
        "Homo sapiens": "atgc",
        "Pan troglodytes": "atac"
    };

    const uppercaseResult = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText,
        sequences,
        analysisType: "ordinary"
    });

    const lowercaseResult = createAnalysisProvenance({
        inputFormat: "fasta",
        originalInput: fastaText.toLowerCase(),
        sequences: lowercaseSequences,
        analysisType: "ordinary"
    });

    assert.equal(
        uppercaseResult.input.sequenceDataSha256,
        lowercaseResult.input.sequenceDataSha256
    );

    assert.notEqual(
        uppercaseResult.input.sha256,
        lowercaseResult.input.sha256
    );

});
