const {
    isValidAlignedDnaSequence
} = require("./sequence");

const { isValidDnaSequence } = require("./sequence");

function calculatePDistance(sequenceA, sequenceB) {
    if (
        !isValidDnaSequence(sequenceA) ||
        !isValidDnaSequence(sequenceB)
    ) {
        throw new Error("Both inputs must be valid DNA sequences.");
    }

    const dnaA = sequenceA.trim().toUpperCase();
    const dnaB = sequenceB.trim().toUpperCase();

    if (dnaA.length !== dnaB.length) {
        throw new Error("Both sequences must have equal lengths.");
    }

    let differences = 0;

    for (let i = 0; i < dnaA.length; i++) {
        if (dnaA[i] !== dnaB[i]) {
            differences++;
        }
    }

    return differences / dnaA.length;
}

function calculateAlignedPDistance(sequenceA, sequenceB) {
    if (
        !isValidAlignedDnaSequence(sequenceA) ||
        !isValidAlignedDnaSequence(sequenceB)
    ) {
        throw new Error("Both inputs must be valid aligned DNA sequences.");
    }

    const dnaA = sequenceA.trim().toUpperCase();
    const dnaB = sequenceB.trim().toUpperCase();

    if (dnaA.length !== dnaB.length) {
        throw new Error("Both aligned sequences must have equal lengths.");
    }

    let differences = 0;
    let comparableSites = 0;

    for (let i = 0; i < dnaA.length; i++) {

        // Ignore a position if either sequence contains a gap.
        if (dnaA[i] === "-" || dnaB[i] === "-") {
            continue;
        }

        comparableSites++;

        if (dnaA[i] !== dnaB[i]) {
            differences++;
        }
    }

    if (comparableSites === 0) {
        throw new Error("No comparable nucleotide positions found.");
    }

    return differences / comparableSites;
}

module.exports = {
    calculatePDistance,
    calculateAlignedPDistance
};
