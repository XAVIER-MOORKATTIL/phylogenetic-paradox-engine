
const express = require("express");

const {
    parseFasta
} = require("./fasta");

const {
    createAnalysisProvenance
} = require("./provenance");

const {
    saveAnalysisRecord
} = require("./analysisStore");

const {
    runPhylogeneticAnalysis,
    runAlignedPhylogeneticAnalysis
} = require("./index");


// STEP 1: Create the Express application.
const app = express();


// STEP 2: Allow the server to receive JSON data.
app.use(express.json({
    limit: "100kb"
}));


// STEP 3: Validate and retrieve ordinary sequences.
function getSequencesFromRequest(req) {

    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) {
        throw new Error(
            "Request body must be a JSON object."
        );
    }

    if (
        !Object.prototype.hasOwnProperty.call(
            req.body,
            "sequences"
        )
    ) {
        throw new Error(
            "Request body must contain a sequences property."
        );
    }

    return req.body.sequences;
}


// STEP 4: Validate and retrieve FASTA input.
function getFastaFromRequest(req) {

    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) {
        throw new Error(
            "Request body must be a JSON object."
        );
    }

    if (
        !Object.prototype.hasOwnProperty.call(
            req.body,
            "fasta"
        )
    ) {
        throw new Error(
            "Request body must contain a fasta property."
        );
    }

    return req.body.fasta;
}


// STEP 5: Health-check endpoint.
app.get("/api/health", (req, res) => {

    res.status(200).json({
        status: "ok",
        message: "Phylogenetic Paradox Engine API is running."
    });

});


// STEP 6: Ordinary DNA analysis endpoint.
app.post("/api/analyze", (req, res) => {

    try {

        const sequences = getSequencesFromRequest(req);

        const result = runPhylogeneticAnalysis(sequences);

        res.status(200).json({
            success: true,
            analysis: result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            error: error.message
        });

    }

});


// STEP 7: Aligned DNA analysis endpoint.
app.post("/api/analyze/aligned", (req, res) => {

    try {

        const sequences = getSequencesFromRequest(req);

        const result = runAlignedPhylogeneticAnalysis(sequences);

        res.status(200).json({
            success: true,
            analysis: result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            error: error.message
        });

    }

});


// STEP 8: FASTA analysis endpoint with provenance and persistence.
app.post("/api/analyze/fasta", async (req, res, next) => {

    let fastaText;
    let sequences;
    let result;
    let provenance;

    // Part 1: Validate input and perform the analysis.
    try {

        // Retrieve FASTA text from the request.
        fastaText = getFastaFromRequest(req);

        // Convert FASTA text into a sequence object.
        sequences = parseFasta(fastaText);

        // Run the existing ordinary DNA analysis pipeline.
        result = runPhylogeneticAnalysis(sequences);

        // Generate a provenance record.
        provenance = createAnalysisProvenance({

            inputFormat: "fasta",
            originalInput: fastaText,
            sequences,
            analysisType: "ordinary",
            sourceMetadata: req.body.sourceMetadata

        });

    } catch (error) {

        // Invalid input or analysis errors are client errors.
        return res.status(400).json({
            success: false,
            error: error.message
        });

    }

    // Part 2: Save the analysis and provenance.
    let savedRecord;

    try {

        savedRecord = await saveAnalysisRecord(
            {
                provenance,
                analysis: result
            },
            process.env.ANALYSIS_STORAGE_DIRECTORY
        );

    } catch (error) {

        // Pass storage failures to the global error middleware.
        return next(error);

    }

    // Part 3: Return the successful analysis response.
    return res.status(200).json({

        success: true,
        analysis: result,
        provenance,
        record: {
            id: savedRecord.id,
            savedAt: savedRecord.savedAt
        }

    });

});


// STEP 9: Handle malformed JSON and other middleware errors.
app.use((error, req, res, next) => {

    if (error.type === "entity.parse.failed") {

        return res.status(400).json({
            success: false,
            error: "Request body contains invalid JSON."
        });

    }

    if (error.type === "entity.too.large") {

        return res.status(413).json({
            success: false,
            error: "Request body exceeds the 100kb limit."
        });

    }

    console.error(error);

    return res.status(500).json({
        success: false,
        error: "Internal server error."
    });

});


// STEP 10: Start the development server.
const PORT = 3000;

if (require.main === module) {

    app.listen(PORT, () => {

        console.log(
            `Phylogenetic Paradox Engine API running at http://localhost:${PORT}`
        );

    });

}


// STEP 11: Export the application for automated testing.
module.exports = app;
