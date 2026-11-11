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

// TEST 6: Quote scientific names containing spaces.
test("quotes taxon names containing spaces", () => {

    const tree = {
        name: null,

        left: {
            node: {
                name: "Homo sapiens"
            },
            branchLength: 0.1
        },

        right: {
            node: {
                name: "Pan troglodytes"
            },
            branchLength: 0.1
        }
    };

    assert.equal(
        convertTreeToNewick(tree),
        "('Homo sapiens':0.1,'Pan troglodytes':0.1);"
    );

});


// TEST 7: Escape apostrophes inside taxon names.
test("escapes apostrophes in taxon names", () => {

    const tree = {
        name: null,

        left: {
            node: {
                name: "Species O'Brien"
            },
            branchLength: 0.2
        },

        right: {
            node: {
                name: "Human"
            },
            branchLength: 0.2
        }
    };

    assert.equal(
        convertTreeToNewick(tree),
        "('Species O''Brien':0.2,Human:0.2);"
    );

});


// TEST 8: Quote taxon names containing Newick punctuation.
test("quotes taxon names containing Newick punctuation", () => {

    const tree = {
        name: null,

        left: {
            node: {
                name: "Species:A"
            },
            branchLength: 0.1
        },

        right: {
            node: {
                name: "Human"
            },
            branchLength: 0.1
        }
    };

    assert.equal(
        convertTreeToNewick(tree),
        "('Species:A':0.1,Human:0.1);"
    );

});


// TEST 9: Reject empty taxon names.
test("rejects empty taxon names", () => {

    const tree = {
        name: ""
    };

    assert.throws(
        () => convertTreeToNewick(tree),
        /Taxon names must be non-empty strings/
    );

});


// TEST 10: Reject malformed internal nodes.
test("rejects internal nodes with missing branches", () => {

    const tree = {
        name: null,
        left: {
            node: {
                name: "Human"
            },
            branchLength: 0.1
        }
    };

    assert.throws(
        () => convertTreeToNewick(tree),
        /valid left and right branches/
    );

});


// TEST 11: Reject negative branch lengths.
test("rejects negative branch lengths", () => {

    const tree = {
        name: null,

        left: {
            node: {
                name: "Human"
            },
            branchLength: -0.1
        },

        right: {
            node: {
                name: "Chimpanzee"
            },
            branchLength: 0.1
        }
    };

    assert.throws(
        () => convertTreeToNewick(tree),
        /finite non-negative numbers/
    );

});


// TEST 12: Reject infinite branch lengths.
test("rejects infinite branch lengths", () => {

    const tree = {
        name: null,

        left: {
            node: {
                name: "Human"
            },
            branchLength: Infinity
        },

        right: {
            node: {
                name: "Chimpanzee"
            },
            branchLength: 0.1
        }
    };

    assert.throws(
        () => convertTreeToNewick(tree),
        /finite non-negative numbers/
    );

});


// TEST 13: Reject circular tree structures.
test("rejects circular tree structures", () => {

    const tree = {
        name: null,
        left: null,
        right: {
            node: {
                name: "Human"
            },
            branchLength: 0.1
        }
    };

    tree.left = {
        node: tree,
        branchLength: 0.1
    };

    assert.throws(
        () => convertTreeToNewick(tree),
        /cycles or reused nodes/
    );

});