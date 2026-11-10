const test = require("node:test");
const assert = require("node:assert/strict");

const {
    isValidAlignedDnaSequence
} = require("../src/sequence");

test("accepts an aligned DNA sequence without gaps", () => {
    assert.equal(isValidAlignedDnaSequence("ATGC"), true);
});

test("accepts an aligned DNA sequence with gaps", () => {
    assert.equal(isValidAlignedDnaSequence("AT-GC"), true);
});

test("accepts lowercase aligned DNA sequences", () => {
    assert.equal(isValidAlignedDnaSequence("at-gc"), true);
});

test("rejects invalid DNA characters", () => {
    assert.equal(isValidAlignedDnaSequence("AT-GX"), false);
});

test("rejects an empty sequence", () => {
    assert.equal(isValidAlignedDnaSequence(""), false);
});

test("rejects a sequence containing only gaps", () => {
    assert.equal(isValidAlignedDnaSequence("---"), false);
});

test("rejects non-string input", () => {
    assert.equal(isValidAlignedDnaSequence(12345), false);
});