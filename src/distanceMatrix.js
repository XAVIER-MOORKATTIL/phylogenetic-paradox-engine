
const {
    calculatePDistance,
    calculateAlignedPDistance
} = require("./distance");

const {
    validateSequenceCollectionLimits
} = require("./sequence");


function calculateDistanceMatrix(sequences) {

    if (
        typeof sequences !== "object" ||
        sequences === null ||
        Array.isArray(sequences)
    ) {
        throw new Error("Input must be an object of named DNA sequences.");
    }

    const speciesNames = Object.keys(sequences);

    if (speciesNames.length < 2) {
        throw new Error("At least two sequences are required.");
    }

    validateSequenceCollectionLimits(sequences);

    const matrix = {};

    for (const nameA of speciesNames) {

        matrix[nameA] = {};

        for (const nameB of speciesNames) {

            matrix[nameA][nameB] = calculatePDistance(
                sequences[nameA],
                sequences[nameB]
            );
        }
    }

    return matrix;
}


function calculateAlignedDistanceMatrix(sequences) {

    if (
        typeof sequences !== "object" ||
        sequences === null ||
        Array.isArray(sequences)
    ) {
        throw new Error(
            "Input must be an object of named aligned DNA sequences."
        );
    }

    const speciesNames = Object.keys(sequences);

    if (speciesNames.length < 2) {
        throw new Error(
            "At least two aligned sequences are required."
        );
    }

    validateSequenceCollectionLimits(sequences);

    const matrix = {};

    for (const nameA of speciesNames) {

        matrix[nameA] = {};

        for (const nameB of speciesNames) {

            matrix[nameA][nameB] = calculateAlignedPDistance(
                sequences[nameA],
                sequences[nameB]
            );
        }
    }

    return matrix;
}


module.exports = {
    calculateDistanceMatrix,
    calculateAlignedDistanceMatrix
};
