import Provenance from './Provenance'
import PhylogeneticTree from './PhylogeneticTree'
import { useState } from 'react'
import DistanceMatrix from './DistanceMatrix'
import './FastaInput.css'

// Artificial teaching data, not biological evidence.
const EXAMPLE_FASTA = `>Homo sapiens
ATGCCGTAACGT
>Pan troglodytes
ATGCCGTAACGA
>Gorilla gorilla
ATGCCGTAGCGT`

function inspectFastaText(text) {
  const lines = text.split(/\r?\n/)

  const headers = lines.filter(line =>
    line.trim().startsWith('>')
  )

  const sequenceTextCharacters = lines
    .filter(line => {
      const trimmedLine = line.trim()

      return (
        trimmedLine.length > 0 &&
        !trimmedLine.startsWith('>')
      )
    })
    .join('')
    .replace(/\s/g, '')
    .length

  return {
    recordCount: headers.length,
    sequenceTextCharacters,
  }
}

function FastaInput() {
  const [fastaText, setFastaText] = useState('')
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState('')
  const [analysisResponse, setAnalysisResponse] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  function handleInspect() {
    if (!fastaText.trim()) {
      setPreview(null)
      setMessage('Please enter FASTA text before inspecting it.')
      return
    }

    const summary = inspectFastaText(fastaText)

    if (summary.recordCount === 0) {
      setPreview(null)
      setMessage('No FASTA headers were detected. Headers begin with >.')
      return
    }

    setPreview(summary)

    setMessage(
      'Input counts generated locally. DNA validity and biological accuracy have not been checked.'
    )
  }

  function handleLoadExample() {
    setFastaText(EXAMPLE_FASTA)
    setPreview(null)
    setAnalysisResponse(null)

    setMessage(
      'Synthetic example loaded. These sequences are artificial and are not biological evidence.'
    )
  }

  function handleClear() {
    setFastaText('')
    setPreview(null)
    setAnalysisResponse(null)
    setMessage('')
  }

  async function handleAnalyze(event) {
    event.preventDefault()

    if (!fastaText.trim()) {
      setMessage('Please enter FASTA text before running an analysis.')
      setAnalysisResponse(null)
      return
    }

    setIsAnalyzing(true)
    setAnalysisResponse(null)
    setMessage('Submitting FASTA sequences to the analysis API...')

    try {
      const response = await fetch('/api/analyze/fasta', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          fasta: fastaText,
        }),
      })

      const body = await response.json()

      if (!response.ok) {
        throw new Error(
          body.error || `Analysis request failed with HTTP ${response.status}.`
        )
      }

      setAnalysisResponse(body)
      setMessage(
        'Analysis completed successfully. The backend saved an analysis record.'
      )

    } catch (error) {
      setAnalysisResponse(null)

      setMessage(
        `Analysis failed: ${error.message}`
      )

    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section className="fasta-section">

      <div className="fasta-heading">
        <div>
          <p className="eyebrow">
            03 / SEQUENCE INPUT
          </p>

          <h2>FASTA workspace</h2>

          <p className="fasta-description">
            Enter DNA sequence records for phylogenetic analysis.
          </p>
        </div>

        <span className="input-format-label">
          FASTA FORMAT
        </span>
      </div>

      <form
        className="fasta-form"
        onSubmit={handleAnalyze}
      >

        <label htmlFor="fasta-input">
          DNA sequence records
        </label>

        <p className="fasta-help">
          Each record must begin with a header starting with
          the greater-than symbol (&gt;).
        </p>

        <textarea
          id="fasta-input"
          name="fasta"
          rows={12}
          value={fastaText}
          onChange={event => {
            setFastaText(event.target.value)
            setPreview(null)
            setAnalysisResponse(null)
            setMessage('')
          }}
          placeholder={'>Species one\nATGC...\n>Species two\nATGC...'}
          spellCheck={false}
          autoComplete="off"
        />

        <div className="fasta-actions">

          <div className="secondary-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={handleLoadExample}
              disabled={isAnalyzing}
            >
              Load synthetic example
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleClear}
              disabled={isAnalyzing}
            >
              Clear
            </button>

          </div>

          <div className="analysis-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={handleInspect}
              disabled={isAnalyzing}
            >
              Inspect input
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Run analysis'}
            </button>

          </div>

        </div>

      </form>

      {message && (
        <p className="fasta-message" role="status">
          {message}
        </p>
      )}

      {preview && (
        <div className="fasta-preview">

          <h3>Input summary</h3>

          <div className="preview-grid">

            <div className="preview-item">
              <span className="preview-value">
                {preview.recordCount}
              </span>

              <span className="preview-label">
                FASTA headers detected
              </span>
            </div>

            <div className="preview-item">
              <span className="preview-value">
                {preview.sequenceTextCharacters.toLocaleString()}
              </span>

              <span className="preview-label">
                Characters outside headers
              </span>
            </div>

          </div>

          <p className="preview-disclaimer">
            These are preliminary text counts only.
            The backend parser performs actual input validation.
          </p>

        </div>
      )}

      {analysisResponse && (
        <section className="analysis-result">

          <div className="result-heading">
            <h3>Analysis completed</h3>
            <span className="result-status">Saved</span>
          </div>

          <div className="result-metadata">

            <div>
              <span>Saved record ID</span>
              <code>{analysisResponse.record?.id}</code>
            </div>

            <div>
              <span>Saved timestamp</span>
              <code>{analysisResponse.record?.savedAt}</code>
            </div>

          </div>

          <DistanceMatrix
  matrix={analysisResponse.analysis?.distanceMatrix}
  method={analysisResponse.provenance?.analysis?.distanceMethod}
/>

<PhylogeneticTree
  tree={analysisResponse.analysis?.tree}
  method={analysisResponse.provenance?.analysis?.treeMethod}
/>

          <details open>
            <summary>Analysis output</summary>

            <pre>
              {JSON.stringify(
                analysisResponse.analysis,
                null,
                2
              )}
            </pre>
          </details>

          <Provenance
  provenance={analysisResponse.provenance}
/>

        </section>
      )}

    </section>
  )
}

export default FastaInput