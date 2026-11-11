
const express = require("express");

const {
    runPhylogeneticAnalysis,
    runAlignedPhylogeneticAnalysis
} = require("./index");


// STEP 1: Create the Express application.
const app = express();


// STEP 2: Allow the server to receive JSON data.
app.use(express.json());


// STEP 3: Health-check endpoint.
app.get("/api/health", (req, res) => {

    res.status(200).json({
        status: "ok",
        message: "Phylogenetic Paradox Engine API is running."
    });

});


// STEP 4: Ordinary DNA analysis endpoint.
app.post("/api/analyze", (req, res) => {

    try {

        const sequences = req.body?.sequences;

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


// STEP 5: Aligned DNA analysis endpoint.
app.post("/api/analyze/aligned", (req, res) => {

    try {

        const sequences = req.body?.sequences;

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


// STEP 6: Start the server.
const PORT = 3000;

if (require.main === module) {

    app.listen(PORT, () => {

        console.log(
            `Phylogenetic Paradox Engine API running at http://localhost:${PORT}`
        );

    });

}


// STEP 7: Export the application.
module.exports = app;

