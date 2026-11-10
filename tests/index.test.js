const test = require("node:test");
const assert = require("node:assert/strict");

const {
    runPhylogeneticAnalysis
} = require("../src/index");

const sampleSequences = {
    Human: "ATGC",
    Chimpanzee: "ATAC",
    Gorilla: "ATGA"
};

test("runs the complete phylogenetic analysis pipeline", () => {
    const result = runPhylogeneticAnalysis(sampleSequences);

    assert.ok(result.distanceMatrix);
    assert.ok(result.tree);
    assert.ok(result.newick);
});

test("returns the expected Newick representation", () => {
    const result = runPhylogeneticAnalysis(sampleSequences);

    assert.equal(
        result.newick,
        "(Gorilla:0.1875,(Human:0.125,Chimpanzee:0.125):0.0625);"
    );
});

test("rejects invalid DNA input through the complete pipeline", () => {
    assert.throws(
        () => runPhylogeneticAnalysis({
            Human: "ATGX",
            Chimpanzee: "ATGC"
        }),
        /valid DNA sequences/
    );
});

test("rejects sequences of unequal lengths through the complete pipeline", () => {
    assert.throws(
        () => runPhylogeneticAnalysis({
            Human: "ATGC",
            Chimpanzee: "ATG"
        }),
        /equal lengths/
    );
});