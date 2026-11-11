
const MAX_SPECIES = 50;
const MAX_SEQUENCE_LENGTH = 10000;


// Validate an ordinary DNA sequence.
function isValidDnaSequence(sequence) {

    if (typeof sequence !== "string") {
        return false;
    }

    const cleanedSequence = sequence.trim();

    if (cleanedSequence.length === 0) {
        return false;
    }

    return /^[ACGT]+$/i.test(cleanedSequence);
}


// Validate an aligned DNA sequence.
function isValidAlignedDnaSequence(sequence) {

    if (typeof sequence !== "string") {
        return false;
    }

    const cleanedSequence = sequence.trim();

    if (cleanedSequence.length === 0) {
        return false;
    }

    if (!/[ACGT]/i.test(cleanedSequence)) {
        return false;
    }

    return /^[ACGT-]+$/i.test(cleanedSequence);
}


// Validate collection-level limits and species names.
function validateSequenceCollectionLimits(sequences) {

    const speciesNames = Object.keys(sequences);

    if (speciesNames.length > MAX_SPECIES) {
        throw new Error(
            `A maximum of ${MAX_SPECIES} organisms is allowed.`
        );
    }

    for (const name of speciesNames) {

if (!/^[A-Za-z](?:[A-Za-z0-9]|[ _-](?=[A-Za-z0-9])){0,49}$/.test(name)) {
    throw new Error(
        "Species names must start with a letter and contain only letters, numbers, and single spaces, underscores, or hyphens between name segments (maximum 50 characters)."
    );
}


        const sequence = sequences[name];

        if (typeof sequence !== "string") {
            continue;
        }

        if (sequence.trim().length > MAX_SEQUENCE_LENGTH) {
            throw new Error(
                `Each DNA sequence must contain at most ${MAX_SEQUENCE_LENGTH} characters.`
            );
        }
    }
}


module.exports = {
    isValidDnaSequence,
    isValidAlignedDnaSequence,
    validateSequenceCollectionLimits
};
