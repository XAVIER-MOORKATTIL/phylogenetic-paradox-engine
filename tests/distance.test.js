
const test = require("node:test");
const assert = require("node:assert/strict");

const { calculatePDistance } = require("../src/distance");

test("calculates zero distance for identical sequences", () => {
    assert.equal(calculatePDistance("ATGC", "ATGC"), 0);
});

test("calculates distance for different sequences", () => {
    assert.equal(calculatePDistance("ATGCA", "ATACG"), 0.4);
});

test("calculates maximum distance for completely different sequences", () => {
    assert.equal(calculatePDistance("AAAA", "TTTT"), 1);
});

test("handles lowercase DNA sequences", () => {
    assert.equal(calculatePDistance("atgc", "ATGC"), 0);
});

test("rejects sequences of unequal lengths", () => {
    assert.throws(
        () => calculatePDistance("ATGC", "ATG"),
        /equal lengths/
    );
});

test("rejects invalid DNA sequences", () => {
    assert.throws(
        () => calculatePDistance("ATGX", "ATGC"),
        /valid DNA sequences/
    );
});
