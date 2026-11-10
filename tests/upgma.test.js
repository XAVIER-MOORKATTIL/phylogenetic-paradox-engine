
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildUpgmaTree
} = require("../src/upgma");


// Sample distance matrix.
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


// Helper function: collect all leaf names from a tree.
function collectLeafNames(node) {

    if (node.name !== null) {
        return [node.name];
    }

    return [
        ...collectLeafNames(node.left.node),
        ...collectLeafNames(node.right.node)
    ];
}


// TEST 1: The tree contains all organisms.
test("includes all organisms in the UPGMA tree", () => {

    const tree = buildUpgmaTree(sampleMatrix);

    const names = collectLeafNames(tree).sort();

    assert.deepEqual(
        names,
        ["Chimpanzee", "Gorilla", "Human"]
    );
});


// TEST 2: Human and Chimpanzee form the first cluster.
test("groups the closest organisms together", () => {

    const tree = buildUpgmaTree(sampleMatrix);

    const leftNames = collectLeafNames(tree.left.node);
    const rightNames = collectLeafNames(tree.right.node);

    const children = [leftNames, rightNames];

    assert.ok(
        children.some(group =>
            group.includes("Human") &&
            group.includes("Chimpanzee") &&
            group.length === 2
        )
    );
});


// TEST 3: The root has the expected height.
test("calculates the expected root height", () => {

    const tree = buildUpgmaTree(sampleMatrix);

    assert.equal(tree.height, 0.1875);
});


// TEST 4: The root branch lengths are correct.
test("calculates the expected root branch lengths", () => {

    const tree = buildUpgmaTree(sampleMatrix);

    assert.equal(tree.left.branchLength, 0.1875);
    assert.equal(tree.right.branchLength, 0.0625);
});


// TEST 5: Rejects fewer than two organisms.
test("rejects fewer than two organisms", () => {

    assert.throws(
        () => buildUpgmaTree({
            Human: {
                Human: 0
            }
        }),
        /At least two organisms/
    );
});


// TEST 6: Rejects an asymmetrical matrix.
test("rejects an asymmetrical distance matrix", () => {

    const invalidMatrix = {
        Human: {
            Human: 0,
            Chimpanzee: 0.25
        },
        Chimpanzee: {
            Human: 0.3,
            Chimpanzee: 0
        }
    };

    assert.throws(
        () => buildUpgmaTree(invalidMatrix),
        /symmetrical/
    );
});


// TEST 7: Rejects negative distances.
test("rejects negative distances", () => {

    const invalidMatrix = {
        Human: {
            Human: 0,
            Chimpanzee: -0.25
        },
        Chimpanzee: {
            Human: -0.25,
            Chimpanzee: 0
        }
    };

    assert.throws(
        () => buildUpgmaTree(invalidMatrix),
        /finite non-negative numbers/
    );
});


// TEST 8: Rejects null input.
test("rejects null input", () => {

    assert.throws(
        () => buildUpgmaTree(null),
        /valid distance matrix object/
    );
});


// TEST 9: Rejects array input.
test("rejects array input", () => {

    assert.throws(
        () => buildUpgmaTree([]),
        /valid distance matrix object/
    );
});


// TEST 10: Rejects a missing organism row.
test("rejects a missing organism row", () => {

    assert.throws(
        () => buildUpgmaTree({
            Human: {
                Human: 0,
                Chimpanzee: 0.25
            },
            Chimpanzee: null
        }),
        /Invalid distance matrix/
    );
});


// TEST 11: Rejects an incomplete distance matrix.
test("rejects an incomplete distance matrix", () => {

    assert.throws(
        () => buildUpgmaTree({
            Human: {
                Human: 0,
                Chimpanzee: 0.25
            },
            Chimpanzee: {
                Chimpanzee: 0
            }
        }),
        /Distance matrix is incomplete/
    );
});


// TEST 12: Rejects non-zero diagonal distances.
test("rejects non-zero diagonal distances", () => {

    assert.throws(
        () => buildUpgmaTree({
            Human: {
                Human: 0.1,
                Chimpanzee: 0.25
            },
            Chimpanzee: {
                Human: 0.25,
                Chimpanzee: 0
            }
        }),
        /Diagonal distances must be zero/
    );
});
