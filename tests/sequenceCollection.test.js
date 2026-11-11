
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateSequenceCollectionLimits
} = require("../src/sequence");


// TEST 1: Accept scientific names containing spaces.
test("accepts scientific taxon names containing spaces", () => {

    const sequences = {
        "Homo sapiens": "ATGC",
        "Pan troglodytes": "ATAC"
    };

    assert.doesNotThrow(() => {
        validateSequenceCollectionLimits(sequences);
    });

});


// TEST 2: Accept names containing underscores.
test("accepts taxon names containing underscores", () => {

    const sequences = {
        Homo_sapiens: "ATGC",
        Pan_troglodytes: "ATAC"
    };

    assert.doesNotThrow(() => {
        validateSequenceCollectionLimits(sequences);
    });

});


// TEST 3: Accept names containing hyphens.
test("accepts taxon names containing hyphens", () => {

    const sequences = {
        "Homo-sapiens": "ATGC",
        "Pan-troglodytes": "ATAC"
    };

    assert.doesNotThrow(() => {
        validateSequenceCollectionLimits(sequences);
    });

});


// TEST 4: Reject names beginning with numbers.
test("rejects taxon names beginning with numbers", () => {

    const sequences = {
        "1Homo": "ATGC",
        Chimpanzee: "ATAC"
    };

    assert.throws(
        () => validateSequenceCollectionLimits(sequences),
        /Species names must start with a letter/
    );

});


// TEST 5: Reject consecutive spaces.
test("rejects taxon names containing consecutive spaces", () => {

    const sequences = {
        "Homo  sapiens": "ATGC",
        Chimpanzee: "ATAC"
    };

    assert.throws(
        () => validateSequenceCollectionLimits(sequences),
        /Species names must start with a letter/
    );

});


// TEST 6: Reject leading spaces.
test("rejects taxon names beginning with spaces", () => {

    const sequences = {
        " Homo sapiens": "ATGC",
        Chimpanzee: "ATAC"
    };

    assert.throws(
        () => validateSequenceCollectionLimits(sequences),
        /Species names must start with a letter/
    );

});


// TEST 7: Reject trailing spaces.
test("rejects taxon names ending with spaces", () => {

    const sequences = {
        "Homo sapiens ": "ATGC",
        Chimpanzee: "ATAC"
    };

    assert.throws(
        () => validateSequenceCollectionLimits(sequences),
        /Species names must start with a letter/
    );

});


// TEST 8: Reject unsupported special characters.
test("rejects taxon names containing unsupported special characters", () => {

    const sequences = {
        "Homo@ sapiens": "ATGC",
        Chimpanzee: "ATAC"
    };

    assert.throws(
        () => validateSequenceCollectionLimits(sequences),
        /Species names must start with a letter/
    );

});


// TEST 9: Reject consecutive separators.
test("rejects consecutive underscores and hyphens", () => {

    const sequences = {
        "Homo__sapiens": "ATGC",
        Chimpanzee: "ATAC"
    };

    assert.throws(
        () => validateSequenceCollectionLimits(sequences),
        /Species names must start with a letter/
    );

});


// TEST 10: Reject names exceeding 50 characters.
test("rejects taxon names longer than 50 characters", () => {

    const longName = "A" + "b".repeat(50);

    const sequences = {
        [longName]: "ATGC",
        Chimpanzee: "ATAC"
    };

    assert.throws(
        () => validateSequenceCollectionLimits(sequences),
        /Species names must start with a letter/
    );

});
