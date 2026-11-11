
const {
    buildUpgmaTree
} = require("../src/upgma");

const {
    convertTreeToNewick
} = require("../src/newick");


// STEP 1: Define the evolutionary distance matrix.
const matrix = {

    "Homo sapiens": {
        "Homo sapiens": 0,
        "Pan troglodytes": 0.25,
        "Gorilla gorilla": 0.25
    },

    "Pan troglodytes": {
        "Homo sapiens": 0.25,
        "Pan troglodytes": 0,
        "Gorilla gorilla": 0.5
    },

    "Gorilla gorilla": {
        "Homo sapiens": 0.25,
        "Pan troglodytes": 0.5,
        "Gorilla gorilla": 0
    }

};


// STEP 2: Construct the phylogenetic tree.
const tree = buildUpgmaTree(matrix);


// STEP 3: Convert the tree into Newick format.
const newick = convertTreeToNewick(tree);


// STEP 4: Print only the Newick representation.
console.log(newick);
