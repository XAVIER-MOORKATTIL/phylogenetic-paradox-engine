
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    calculateDistanceMatrix
} = require("../src/distanceMatrix");

const sampleSequences = {
    Human: "ATGC",
    Chimpanzee: "ATAC",
    Gorilla: "ATGA"
};

test("creates a distance matrix for multiple organisms", () => {
    const matrix = calculateDistanceMatrix(sampleSequences);

    assert.equal(Object.keys(matrix).length, 3);
});

test("calculates the expected pairwise distances", () => {
    const matrix = calculateDistanceMatrix(sampleSequences);

    assert.equal(matrix.Human.Chimpanzee, 0.25);
    assert.equal(matrix.Human.Gorilla, 0.25);
    assert.equal(matrix.Chimpanzee.Gorilla, 0.5);
});

test("produces zero distance on the diagonal", () => {
    const matrix = calculateDistanceMatrix(sampleSequences);

    assert.equal(matrix.Human.Human, 0);
    assert.equal(matrix.Chimpanzee.Chimpanzee, 0);
    assert.equal(matrix.Gorilla.Gorilla, 0);
});

test("produces a symmetrical distance matrix", () => {
    const matrix = calculateDistanceMatrix(sampleSequences);

    assert.equal(
        matrix.Human.Chimpanzee,
        matrix.Chimpanzee.Human
    );
});

test("rejects input that is not an object", () => {
    assert.throws(
        () => calculateDistanceMatrix("ATGC"),
        /object of named DNA sequences/
    );
});

test("rejects fewer than two sequences", () => {
    assert.throws(
        () => calculateDistanceMatrix({
            Human: "ATGC"
        }),
        /At least two sequences/
    );
});
