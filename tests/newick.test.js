const test = require("node:test");
const assert = require("node:assert/strict");

const { buildUpgmaTree } = require("../src/upgma");
const { convertTreeToNewick } = require("../src/newick");

const sampleMatrix = {
    Human: {
        Human: 0,
        Chimpanzee: 0.25,
        Gorilla: 0.25
    },
    Chimpanzee: {
        Human: 0.25,
        Chimpanzee: 0,
        Gorilla: 0.5
    },
    Gorilla: {
        Human: 0.25,
        Chimpanzee: 0.5,
        Gorilla: 0
    }
};

test("converts a phylogenetic tree into Newick format", () => {
    const tree = buildUpgmaTree(sampleMatrix);

    const newick = convertTreeToNewick(tree);

    assert.equal(
    newick,
    "(Gorilla:0.1875,(Human:0.125,Chimpanzee:0.125):0.0625);"
);
});

test("ends the Newick representation with a semicolon", () => {
    const tree = buildUpgmaTree(sampleMatrix);

    const newick = convertTreeToNewick(tree);

    assert.ok(newick.endsWith(";"));
});

test("includes all organism names in the Newick output", () => {
    const tree = buildUpgmaTree(sampleMatrix);

    const newick = convertTreeToNewick(tree);

    assert.ok(newick.includes("Human"));
    assert.ok(newick.includes("Chimpanzee"));
    assert.ok(newick.includes("Gorilla"));
});

test("rejects null input", () => {
    assert.throws(
        () => convertTreeToNewick(null),
        /valid phylogenetic tree/
    );
});

test("rejects non-object input", () => {
    assert.throws(
        () => convertTreeToNewick("Human"),
        /valid phylogenetic tree/
    );
});