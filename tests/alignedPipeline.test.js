const test = require("node:test");
const assert = require("node:assert/strict");

const {
    runAlignedPhylogeneticAnalysis
} = require("../src/index");


const sampleSequences = {
    Human: "AT-GCA",
    Chimpanzee: "ATTC-A",
    Gorilla: "AT-GTA"
};


test("runs the complete aligned phylogenetic analysis pipeline", () => {

    const result = runAlignedPhylogeneticAnalysis(sampleSequences);

    assert.ok(result.distanceMatrix);
    assert.ok(result.tree);
    assert.ok(result.newick);

});


test("calculates the expected aligned distances", () => {

    const result = runAlignedPhylogeneticAnalysis(sampleSequences);

    assert.equal(result.distanceMatrix.Human.Chimpanzee, 0.25);
    assert.equal(result.distanceMatrix.Human.Gorilla, 0.2);
    assert.equal(result.distanceMatrix.Chimpanzee.Gorilla, 0.25);

});


test("includes all organisms in the aligned Newick tree", () => {

    const result = runAlignedPhylogeneticAnalysis(sampleSequences);

    assert.ok(result.newick.includes("Human"));
    assert.ok(result.newick.includes("Chimpanzee"));
    assert.ok(result.newick.includes("Gorilla"));

});


test("rejects invalid aligned DNA sequences", () => {

    assert.throws(
        () => runAlignedPhylogeneticAnalysis({
            Human: "ATGX",
            Chimpanzee: "ATGC"
        }),
        /valid aligned DNA sequences/
    );

});