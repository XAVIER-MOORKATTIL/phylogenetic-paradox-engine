
# Phylogenetic Paradox Engine

A JavaScript-based educational prototype for DNA sequence validation, pairwise genetic distance calculation, phylogenetic tree construction, and Newick serialization.

The project provides ordinary DNA analysis, aligned DNA analysis, FASTA parsing, and an Express REST API.

**Project status:** Working prototype.

## 1. Project Overview

The Phylogenetic Paradox Engine explores how computational methods can analyse DNA sequence differences and construct phylogenetic trees.

The application supports three input workflows:

1. Ordinary DNA sequences supplied as JavaScript objects.
2. Aligned DNA sequences supplied as JavaScript objects.
3. Ordinary DNA sequences supplied in FASTA format.

Each analysis workflow calculates pairwise distances, constructs a tree using UPGMA, and generates a Newick representation.

The project also includes independent Newick-format interoperability verification using Biopython.

## 2. Technology Stack

- JavaScript
- Node.js
- Express 5
- CommonJS modules
- Node.js native test runner
- Git
- Python and Biopython (optional, for independent Newick verification)

## 3. Current Features

### Sequence processing

- Ordinary DNA sequence validation.
- Aligned DNA sequence validation.
- Scientific taxon-name validation.
- FASTA parsing.
- Multiline FASTA sequence support.
- Lowercase DNA normalization.
- Duplicate taxon-name detection.
- Input-size and sequence-length limits.

### Phylogenetic analysis

- Pairwise p-distance calculation.
- Gap-aware aligned p-distance calculation using pairwise deletion.
- Ordinary DNA distance matrices.
- Aligned DNA distance matrices.
- UPGMA phylogenetic tree construction.
- Distance matrix validation.
- Newick tree serialization.

### API

- Express REST API.
- Health-check endpoint.
- Ordinary DNA analysis endpoint.
- Aligned DNA analysis endpoint.
- FASTA analysis endpoint.
- JSON request validation.
- Malformed JSON handling.
- Request-body size limits.

### Verification

- Automated tests using Node.js native test runner.
- Independent Newick parsing using Biopython.
- Synthetic FASTA demonstration dataset.
- Saved Newick demonstration output.

## 4. Project Structure

```text
phylogenetic-paradox-engine/
|
|-- data/
|   |-- example-synthetic.fasta
|   |-- example-synthetic.nwk
|
|-- scripts/
|   |-- generate_newick.js
|   |-- verify_newick.py
|
|-- src/
|   |-- sequence.js
|   |-- distance.js
|   |-- distanceMatrix.js
|   |-- fasta.js
|   |-- upgma.js
|   |-- newick.js
|   |-- index.js
|   |-- server.js
|
|-- tests/
|   |-- sequence.test.js
|   |-- sequenceCollection.test.js
|   |-- distance.test.js
|   |-- distanceMatrix.test.js
|   |-- alignedSequence.test.js
|   |-- alignedDistance.test.js
|   |-- alignedDistanceMatrix.test.js
|   |-- alignedPipeline.test.js
|   |-- fasta.test.js
|   |-- upgma.test.js
|   |-- newick.test.js
|   |-- index.test.js
|   |-- server.test.js
|
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- README.md
```

## 5. Installation

### Requirements

- Node.js
- npm

For independent Newick verification:

- Python 3
- Biopython

### Install project dependencies

Navigate to the project directory:

```powershell
cd phylogenetic-paradox-engine
```

Install the dependencies:

```powershell
npm install
```

## 6. Run the Application

The project provides two ways to execute the application.

### A. Run the command-line demonstration

```powershell
node src/index.js
```

This executes the sample ordinary DNA analysis pipeline and prints the distance matrix and Newick tree.

### B. Start the Express API server

```powershell
node src/server.js
```

The development server listens at:

```text
http://localhost:3000
```

The server must remain running while API requests are submitted.

## 7. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API status |
| POST | `/api/analyze` | Analyse ordinary DNA sequences |
| POST | `/api/analyze/aligned` | Analyse aligned DNA sequences |
| POST | `/api/analyze/fasta` | Analyse DNA sequences supplied in FASTA format |

All POST endpoints accept JSON requests.

### A. Health check

```text
GET /api/health
```

Example PowerShell request:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

### B. Ordinary DNA analysis

```text
POST /api/analyze
```

Example JSON body:

```json
{
    "sequences": {
        "Homo sapiens": "ATGC",
        "Pan troglodytes": "ATAC"
    }
}
```

### C. Aligned DNA analysis

```text
POST /api/analyze/aligned
```

Example JSON body:

```json
{
    "sequences": {
        "Homo sapiens": "AT-GC",
        "Pan troglodytes": "AT-AC"
    }
}
```

Aligned sequences must have equal lengths. Gap positions are handled using pairwise deletion.

### D. FASTA analysis

```text
POST /api/analyze/fasta
```

Example JSON body:

```json
{
    "fasta": ">Homo sapiens\nATGC\n>Pan troglodytes\nATAC\n"
}
```

The FASTA parser converts the text into a JavaScript sequence object and passes it to the existing ordinary DNA analysis pipeline.

### Successful response structure

All three analysis endpoints return the following general structure:

```json
{
    "success": true,
    "analysis": {
        "distanceMatrix": {},
        "tree": {},
        "newick": "..."
    }
}
```

The analysis contains:

- `distanceMatrix`: calculated pairwise distances.
- `tree`: constructed UPGMA tree.
- `newick`: serialized phylogenetic tree.

## 8. FASTA Demonstration

The project includes:

```text
data/example-synthetic.fasta
```

The file contains three synthetic sequence records:

```text
>Homo sapiens
ATGCCGTAACGT
>Pan troglodytes
ATGCCGTAACGA
>Gorilla gorilla
ATGCCGTAGCGT
```

These are artificial sequences for software testing. They are not actual biological sequence observations.

### Submit the sample FASTA file using PowerShell

First, start the Express server in a separate terminal:

```powershell
node src/server.js
```

In another PowerShell terminal, execute:

```powershell
# STEP 1: Read the FASTA file.
$fastaText = [System.IO.File]::ReadAllText(
    (Resolve-Path "data/example-synthetic.fasta")
)

# STEP 2: Convert the FASTA text into JSON.
$requestBody = ConvertTo-Json -InputObject ([ordered]@{
    fasta = $fastaText
}) -Compress

# STEP 3: Submit the FASTA data to the API.
$result = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/analyze/fasta" `
    -Method Post `
    -ContentType "application/json" `
    -Body $requestBody

# STEP 4: Display the analysis results.
$result | ConvertTo-Json -Depth 10
```

The successful response contains the distance matrix, UPGMA tree, and Newick representation.

### Expected pairwise distances

For the included 12-nucleotide synthetic dataset:

| Taxon pair | p-distance |
|---|---:|
| Homo sapiens / Pan troglodytes | 0.08333 |
| Homo sapiens / Gorilla gorilla | 0.08333 |
| Pan troglodytes / Gorilla gorilla | 0.16667 |

## 9. Save the Generated Newick Tree

The API-generated Newick representation can be saved to a file:

```powershell
[System.IO.File]::WriteAllText(
    "data/example-synthetic.nwk",
    $result.analysis.newick,
    [System.Text.UTF8Encoding]::new($false)
)
```

The resulting file is:

```text
data/example-synthetic.nwk
```

## 10. Independent Newick Verification

The project includes:

```text
scripts/verify_newick.py
```

This script uses Biopython to parse a Newick representation independently.

Install Biopython if it is not already available:

```powershell
python -m pip install biopython
```

Run the verification:

```powershell
Get-Content -Raw -Path "data/example-synthetic.nwk" |
    python scripts/verify_newick.py
```

The verification checks:

- Whether Biopython can parse the Newick representation.
- Whether the three expected taxon names are preserved.
- Whether the organism count is correct.
- Whether non-root branch lengths are present and non-negative.

The current verification script expects the three taxa in the included synthetic dataset.

A successful result demonstrates Newick-format interoperability. It does not establish biological accuracy.

## 11. Run Automated Tests

Execute:

```powershell
npm test
```

The project uses Node.js native test runner through the following npm script:

```json
{
    "test": "node --test"
}
```

At the time of this README revision, the project has:

- 155 automated tests passing.
- 0 failed tests.

The suite covers sequence validation, distance calculations, matrices, UPGMA, Newick serialization, FASTA parsing, and API endpoints.

## 12. Input Validation Limits

The current prototype applies the following limits:

| Validation | Limit or rule |
|---|---|
| Maximum organisms | 50 |
| Maximum sequence length | 10,000 characters |
| Maximum taxon-name length | 50 characters |
| DNA alphabet | A, C, G, T |
| FASTA taxon labels | Letters, numbers, spaces, underscores and hyphens, subject to validation rules |
| API JSON body | 100 KB |

The current FASTA parser:

- Accepts multiline DNA sequences.
- Supports lowercase DNA characters.
- Converts accepted sequences to uppercase.
- Ignores blank lines.
- Rejects duplicate taxon names.
- Rejects invalid DNA characters.
- Uses the entire FASTA header after `>` as the taxon name.

It does not currently support ambiguous nucleotide symbols, FASTA descriptions after taxon names, or alignment gaps in FASTA input.

The aligned DNA workflow is available separately through `/api/analyze/aligned`.

## 13. Scientific Limitations

This project is an educational computational prototype, not a validated phylogenetic research platform.

Important limitations include:

1. The included demonstration sequences are artificial.
2. P-distance does not correct for multiple substitutions occurring at the same nucleotide site.
3. The ordinary analysis pipeline does not perform sequence alignment.
4. Pairwise deletion in aligned analysis can cause different pairs to be compared over different alignment positions.
5. UPGMA assumes approximately constant evolutionary rates and an ultrametric tree.
6. The current implementation does not provide bootstrap support values or evolutionary uncertainty estimates.
7. The current implementation does not perform maximum-likelihood or Bayesian phylogenetic inference.
8. Independent Newick parsing verifies software interoperability, not biological conclusions.

Real evolutionary analysis requires validated homologous sequence datasets, appropriate sequence alignment, suitable evolutionary substitution models, justified outgroups, appropriate inference methods, statistical evaluation, and reproducible data provenance.

No biological ancestry claim should be inferred from the synthetic demonstration dataset.

## 14. Planned Development

Potential future improvements include:

- Integration of validated biological sequence datasets.
- Improved sequence alignment.
- Support for additional nucleotide ambiguity symbols.
- Additional phylogenetic inference algorithms.
- Maximum-likelihood and Bayesian inference.
- Statistical support and uncertainty estimation.
- Phylogenetic hypothesis comparison.
- React frontend.
- MongoDB Atlas integration.
- Reproducible analysis records and result provenance.

## 15. Project Objective

To develop a reproducible computational platform for evaluating phylogenetic hypotheses using biological sequence data, transparent computational methods, and scientifically responsible interpretation.
