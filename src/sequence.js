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


module.exports = {
    isValidDnaSequence,
    isValidAlignedDnaSequence
};