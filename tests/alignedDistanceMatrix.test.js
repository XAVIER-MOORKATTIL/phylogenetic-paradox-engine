const test = require("node:test");
const assert = require("node:assert/strict");

const {
    calculateAlignedDistanceMatrix
} = require("../src/distanceMatrix");

const sampleSequences = {
    Human: "AT-GCA",
    Chimpanzee: "ATTC-A",
    Gorilla: "AT-GTA"
};

test("creates a distance matrix for aligned DNA sequences", () => {
    const matrix = calculateAlignedDistanceMatrix(sampleSequences);

    assert.equal(Object.keys(matrix).length, 3);
});

test("calculates the expected aligned pairwise distances", () => {
    const matrix = calculateAlignedDistanceMatrix(sampleSequences);

    assert.equal(matrix.Human.Chimpanzee, 0.25);
    assert.equal(matrix.Human.Gorilla, 0.2);
    assert.equal(matrix.Chimpanzee.Gorilla, 0.25);
});

test("produces zero distance on the diagonal", () => {
    const matrix = calculateAlignedDistanceMatrix(sampleSequences);

    assert.equal(matrix.Human.Human, 0);
    assert.equal(matrix.Chimpanzee.Chimpanzee, 0);
    assert.equal(matrix.Gorilla.Gorilla, 0);
});

test("produces a symmetrical aligned distance matrix", () => {
    const matrix = calculateAlignedDistanceMatrix(sampleSequences);

    assert.equal(
        matrix.Human.Chimpanzee,
        matrix.Chimpanzee.Human
    );
});

test("rejects input that is not an object", () => {
    assert.throws(
        () => calculateAlignedDistanceMatrix("ATGC"),
        /object of named aligned DNA sequences/
    );
});

test("rejects fewer than two aligned sequences", () => {
    assert.throws(
        () => calculateAlignedDistanceMatrix({
            Human: "ATGC"
        }),
        /At least two aligned sequences/
    );
});

test("rejects aligned sequences with no comparable positions", () => {
    assert.throws(
        () => calculateAlignedDistanceMatrix({
            Human: "---A",
            Chimpanzee: "TTT-"
        }),
        /No comparable nucleotide positions/
    );
});