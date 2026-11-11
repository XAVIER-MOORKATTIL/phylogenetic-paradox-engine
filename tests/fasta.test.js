
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    parseFasta
} = require("../src/fasta");


// TEST 1: Parse multiple FASTA records.
test("parses multiple FASTA records", () => {

    const fasta = `
>Homo sapiens
ATGC
>Pan troglodytes
ATAC
`;

    const result = parseFasta(fasta);

    assert.deepEqual(result, {
        "Homo sapiens": "ATGC",
        "Pan troglodytes": "ATAC"
    });

});


// TEST 2: Parse sequences spread across multiple lines.
test("parses multiline DNA sequences", () => {

    const fasta = `
>Homo sapiens
ATG
CGA
TC
>Pan troglodytes
ATA
CGT
`;

    const result = parseFasta(fasta);

    assert.deepEqual(result, {
        "Homo sapiens": "ATGCGATC",
        "Pan troglodytes": "ATACGT"
    });

});


// TEST 3: Convert lowercase DNA characters to uppercase.
test("converts lowercase DNA sequences to uppercase", () => {

    const fasta = `
>Homo sapiens
atgc
>Pan troglodytes
atac
`;

    const result = parseFasta(fasta);

    assert.deepEqual(result, {
        "Homo sapiens": "ATGC",
        "Pan troglodytes": "ATAC"
    });

});


// TEST 4: Ignore blank lines and support Windows line endings.
test("handles blank lines and Windows line endings", () => {

    const fasta =
        "\r\n>Homo sapiens\r\nATG\r\n\r\nC\r\n" +
        "\r\n>Pan troglodytes\r\nATAC\r\n";

    const result = parseFasta(fasta);

    assert.deepEqual(result, {
        "Homo sapiens": "ATGC",
        "Pan troglodytes": "ATAC"
    });

});


// TEST 5: Preserve scientific taxon names.
test("supports spaces, underscores, and hyphens in taxon names", () => {

    const fasta = `
>Homo sapiens
ATGC
>Pan_troglodytes
ATAC
>Gorilla-gorilla
ATCC
`;

    const result = parseFasta(fasta);

    assert.deepEqual(result, {
        "Homo sapiens": "ATGC",
        "Pan_troglodytes": "ATAC",
        "Gorilla-gorilla": "ATCC"
    });

});


// TEST 6: Allow one valid FASTA record.
test("parses a single valid FASTA record", () => {

    const fasta = `
>Homo sapiens
ATGC
`;

    const result = parseFasta(fasta);

    assert.deepEqual(result, {
        "Homo sapiens": "ATGC"
    });

});


// TEST 7: Reject input that is not a string.
test("rejects non-string FASTA input", () => {

    assert.throws(
        () => parseFasta(null),
        /FASTA input must be a string/
    );

});


// TEST 8: Reject empty FASTA input.
test("rejects empty FASTA input", () => {

    assert.throws(
        () => parseFasta(""),
        /FASTA input must contain at least one record/
    );

});


// TEST 9: Reject sequence data before the first header.
test("rejects sequence data before the first FASTA header", () => {

    const fasta = `
ATGC
>Homo sapiens
ATAC
`;

    assert.throws(
        () => parseFasta(fasta),
        /Sequence data found before the first FASTA header/
    );

});


// TEST 10: Reject empty FASTA headers.
test("rejects FASTA headers without taxon names", () => {

    const fasta = `
>
ATGC
`;

    assert.throws(
        () => parseFasta(fasta),
        /FASTA headers must contain a taxon name/
    );

});


// TEST 11: Reject records without DNA sequences.
test("rejects FASTA records with empty sequences", () => {

    const fasta = `
>Homo sapiens
>Pan troglodytes
ATAC
`;

    assert.throws(
        () => parseFasta(fasta),
        /empty or invalid DNA sequence/
    );

});


// TEST 12: Reject invalid DNA characters.
test("rejects sequences containing invalid DNA characters", () => {

    const fasta = `
>Homo sapiens
ATGN
>Pan troglodytes
ATAC
`;

    assert.throws(
        () => parseFasta(fasta),
        /empty or invalid DNA sequence/
    );

});


// TEST 13: Reject duplicate taxon names.
test("rejects duplicate taxon names", () => {

    const fasta = `
>Homo sapiens
ATGC
>Homo sapiens
ATAC
`;

    assert.throws(
        () => parseFasta(fasta),
        /Duplicate taxon name/
    );

});


// TEST 14: Reject invalid taxon names.
test("rejects taxon names that violate collection validation rules", () => {

    const fasta = `
>Homo@ sapiens
ATGC
>Pan troglodytes
ATAC
`;

    assert.throws(
        () => parseFasta(fasta),
        /Species names must start with a letter/
    );

});


// TEST 15: Enforce the maximum number of organisms.
test("rejects FASTA files containing more than 50 organisms", () => {

    const records = [];

    for (let index = 1; index <= 51; index++) {

        records.push(
            `>Species${index}\nATGC`
        );

    }

    const fasta = records.join("\n");

    assert.throws(
        () => parseFasta(fasta),
        /maximum of 50 organisms/
    );

});


// TEST 16: Enforce the maximum sequence length.
test("rejects DNA sequences longer than 10000 characters", () => {

    const longSequence = "A".repeat(10001);

    const fasta = `
>Homo sapiens
${longSequence}
>Pan troglodytes
ATGC
`;

    assert.throws(
        () => parseFasta(fasta),
        /at most 10000 characters/
    );

});


// TEST 17: Reject special JavaScript object-prototype property names.
test("rejects taxon names that conflict with JavaScript object properties", () => {

    const fasta = `
>__proto__
ATGC
`;

    assert.throws(
        () => parseFasta(fasta),
        /Species names must start with a letter/
    );

});
