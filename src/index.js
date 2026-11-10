const {
    calculateDistanceMatrix,
    calculateAlignedDistanceMatrix
} = require("./distanceMatrix");

const {
    buildUpgmaTree
} = require("./upgma");

const {
    convertTreeToNewick
} = require("./newick");


// PIPELINE 1: Ordinary DNA sequences.
function runPhylogeneticAnalysis(sequences) {

    // Step 1: Calculate pairwise DNA distances.
    const distanceMatrix = calculateDistanceMatrix(sequences);

    // Step 2: Construct the phylogenetic tree.
    const tree = buildUpgmaTree(distanceMatrix);

    // Step 3: Convert the tree into Newick format.
    const newick = convertTreeToNewick(tree);

    // Step 4: Return all analysis results.
    return {
        distanceMatrix,
        tree,
        newick
    };
}


// PIPELINE 2: Aligned DNA sequences.
function runAlignedPhylogeneticAnalysis(sequences) {

    // Step 1: Calculate pairwise distances using aligned sequences.
    const distanceMatrix = calculateAlignedDistanceMatrix(sequences);

    // Step 2: Construct the phylogenetic tree.
    const tree = buildUpgmaTree(distanceMatrix);

    // Step 3: Convert the tree into Newick format.
    const newick = convertTreeToNewick(tree);

    // Step 4: Return all analysis results.
    return {
        distanceMatrix,
        tree,
        newick
    };
}


// Sample DNA sequences for demonstration.
const sampleSequences = {
    Human: "ATGC",
    Chimpanzee: "ATAC",
    Gorilla: "ATGA"
};


// Run the original pipeline when this file is executed directly.
if (require.main === module) {

    const result = runPhylogeneticAnalysis(sampleSequences);

    console.log("\n===== PHYLOGENETIC PARADOX ENGINE =====");

    console.log("\n1. DISTANCE MATRIX:");

    console.log(
        JSON.stringify(result.distanceMatrix, null, 2)
    );

    console.log("\n2. NEWICK TREE:");

    console.log(result.newick);

    console.log("\n===== ANALYSIS COMPLETED =====");
}


// Export both pipelines.
module.exports = {
    runPhylogeneticAnalysis,
    runAlignedPhylogeneticAnalysis
};