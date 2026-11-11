
const express = require("express");

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


// STEP 3: Validate the incoming request structure.
function getSequencesFromRequest(req) {

    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) {
        throw new Error("Request body must be a JSON object.");
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


// STEP 4: Health-check endpoint.
app.get("/api/health", (req, res) => {

    res.status(200).json({
        status: "ok",
        message: "Phylogenetic Paradox Engine API is running."
    });

});


// STEP 5: Ordinary DNA analysis endpoint.
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


// STEP 6: Aligned DNA analysis endpoint.
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


// STEP 7: Handle malformed JSON and other middleware errors.
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


// STEP 8: Start the development server.
const PORT = 3000;

if (require.main === module) {

    app.listen(PORT, () => {

        console.log(
            `Phylogenetic Paradox Engine API running at http://localhost:${PORT}`
        );

    });

}


// STEP 9: Export the application for automated testing.
module.exports = app;
