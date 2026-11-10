
const test = require("node:test");
const assert = require("node:assert/strict");

const { isValidDnaSequence } = require("../src/sequence");

test("accepts a valid DNA sequence", () => {
    assert.equal(isValidDnaSequence("ATGC"), true);
});

test("accepts lowercase DNA sequences", () => {
    assert.equal(isValidDnaSequence("atgc"), true);
});

test("rejects invalid DNA characters", () => {
    assert.equal(isValidDnaSequence("ATGX"), false);
});

test("rejects an empty sequence", () => {
    assert.equal(isValidDnaSequence(""), false);
});

test("rejects non-string input", () => {
    assert.equal(isValidDnaSequence(12345), false);
});
