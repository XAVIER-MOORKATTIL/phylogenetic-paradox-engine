const test = require("node:test");
const assert = require("node:assert/strict");

const {
    calculateAlignedPDistance
} = require("../src/distance");

test("calculates zero distance for identical aligned sequences", () => {
    assert.equal(
        calculateAlignedPDistance("ATGC", "ATGC"),
        0
    );
});

test("calculates distance while ignoring gap positions", () => {
    assert.equal(
        calculateAlignedPDistance("ATGCA", "AT-TA"),
        0.25
    );
});

test("ignores positions containing gaps in either sequence", () => {
    assert.equal(
        calculateAlignedPDistance("AT-GCA", "ATTC-A"),
        0.25
    );
});

test("handles lowercase aligned sequences", () => {
    assert.equal(
        calculateAlignedPDistance("at-gc", "AT-GC"),
        0
    );
});

test("rejects invalid aligned DNA sequences", () => {
    assert.throws(
        () => calculateAlignedPDistance("ATGX", "ATGC"),
        /valid aligned DNA sequences/
    );
});

test("rejects aligned sequences of unequal lengths", () => {
    assert.throws(
        () => calculateAlignedPDistance("AT-GC", "ATGC"),
        /equal lengths/
    );
});

test("rejects sequences with no comparable positions", () => {
    assert.throws(
        () => calculateAlignedPDistance("---A", "TTT-"),
        /No comparable nucleotide positions/
    );
});