
# Phylogenetic Paradox Engine

A JavaScript-based prototype for DNA sequence comparison, pairwise genetic distance calculation, and phylogenetic tree construction.

## Project Overview

The Phylogenetic Paradox Engine explores how computational methods can analyse DNA sequence differences and construct evolutionary trees.

The current prototype implements two analysis pipelines:

1. Ordinary DNA sequence analysis.
2. Aligned DNA sequence analysis.

Both pipelines calculate pairwise distances, construct a tree using UPGMA, and generate a Newick representation.

## Technology Stack

- JavaScript
- Node.js
- Node.js native test runner
- Git

## Current Features

- DNA sequence validation.
- Aligned DNA sequence validation.
- Pairwise p-distance calculation.
- Gap-aware aligned p-distance calculation using pairwise deletion.
- Ordinary DNA distance matrices.
- Aligned DNA distance matrices.
- UPGMA phylogenetic tree construction.
- Distance matrix validation.
- Newick tree serialization.
- Automated tests using Node.js native test runner.

## Project Structure

```text
phylogenetic-paradox-engine/
│
├── src/
│   ├── sequence.js
│   ├── distance.js
│   ├── distanceMatrix.js
│   ├── upgma.js
│   ├── newick.js
│   └── index.js
│
├── tests/
│   ├── sequence.test.js
│   ├── distance.test.js
│   ├── distanceMatrix.test.js
│   ├── upgma.test.js
│   ├── newick.test.js
│   ├── index.test.js
│   ├── alignedSequence.test.js
│   ├── alignedDistance.test.js
│   ├── alignedDistanceMatrix.test.js
│   └── alignedPipeline.test.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Installation

Install Node.js, then clone or download the repository.

Navigate to the project directory:

```bash
cd phylogenetic-paradox-engine
```

Install dependencies:

```bash
npm install
```

## Run the Application

```bash
node src/index.js
```

## Run Automated Tests

```bash
npm test
```

The current prototype has 63 passing automated tests.

## Current Scientific Limitations

This project is an educational computational prototype, not a validated phylogenetic research platform.

- The demonstration sequences are artificial.
- P-distance does not correct for multiple substitutions at the same nucleotide site.
- Pairwise deletion can result in different pairs being compared over different alignment positions.
- UPGMA assumes approximately constant evolutionary rates and an ultrametric tree.
- The current implementation does not provide statistical support values or evolutionary uncertainty estimates.
- No biological conclusion should be drawn from the demonstration dataset.

Real evolutionary analysis requires validated homologous sequence datasets, appropriate alignment methods, evolutionary substitution models, suitable phylogenetic inference methods, and statistical evaluation.

## Planned Development

- Integration of real biological sequence datasets.
- Improved sequence alignment and data validation.
- Additional phylogenetic inference algorithms.
- Statistical support and uncertainty estimation.
- Phylogenetic hypothesis comparison.
- Node.js and Express backend.
- React frontend.
- MongoDB Atlas integration.
- Reproducible analysis records and results.

## Project Objective

To develop a reproducible computational platform for evaluating phylogenetic hypotheses using biological sequence data and transparent scientific methods.
