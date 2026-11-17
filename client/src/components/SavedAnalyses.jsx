import { useCallback, useEffect, useState } from 'react'
import DistanceMatrix from './DistanceMatrix'
import PhylogeneticTree from './PhylogeneticTree'
import Provenance from './Provenance'
import './SavedAnalyses.css'

function formatTimestamp(value) {
  if (typeof value !== 'string') {
    return 'Timestamp unavailable'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

// Retrieve the list of saved analysis summaries.
async function requestSavedAnalyses() {
  const response = await fetch('/api/analyses')

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      body?.error ||
      `Unable to retrieve saved analyses. HTTP ${response.status}.`
    )
  }

  if (
    !body ||
    body.success !== true ||
    !Array.isArray(body.records)
  ) {
    throw new Error(
      'The API returned an unexpected saved-analysis response.'
    )
  }

  return body.records
}

function SavedAnalyses() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedRecord, setSelectedRecord] = useState(null)
  const [loadingRecordId, setLoadingRecordId] = useState('')
  const [recordError, setRecordError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState('')
  const [deletingRecordId, setDeletingRecordId] = useState('')
  const [deleteMessage, setDeleteMessage] = useState('')

  // Refresh the list of saved analysis summaries.
const loadRecords = useCallback(async () => {
  setIsLoading(true)
  setError('')

  try {
    const savedRecords = await requestSavedAnalyses()
    setRecords(savedRecords)
  } catch (requestError) {
    setError(
      requestError instanceof Error
        ? requestError.message
        : 'An unexpected error occurred.'
    )
  } finally {
    setIsLoading(false)
  }
}, [])

  // Retrieve one complete saved analysis by its UUID.
  async function handleViewRecord(id) {
    setLoadingRecordId(id)
    setSelectedRecord(null)
    setRecordError('')

    try {

      const response = await fetch(
        `/api/analyses/${encodeURIComponent(id)}`
      )

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          body?.error ||
          `Unable to retrieve analysis. HTTP ${response.status}.`
        )
      }

      if (
        !body ||
        body.success !== true ||
        body.record?.id !== id ||
        !body.record.analysis ||
        !body.record.provenance
      ) {
        throw new Error(
          'The API returned an incomplete analysis record.'
        )
      }

      setSelectedRecord(body.record)

    } catch (requestError) {

      setRecordError(
        requestError instanceof Error
          ? requestError.message
          : 'An unexpected error occurred.'
      )

    } finally {

      setLoadingRecordId('')

    }
  }

  // Delete a saved analysis after user confirmation.
  async function handleDeleteRecord(id) {
    setDeletingRecordId(id)
    setRecordError('')
    setDeleteMessage('')

    try {
      const response = await fetch(
        `/api/analyses/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
        }
      )

      const body = await response.json().catch(() => null)

      if (!response.ok || body?.success !== true) {
        throw new Error(
          body?.error ||
          `Unable to delete analysis. HTTP ${response.status}.`
        )
      }

      // Remove the deleted record from the displayed list.
      setRecords(currentRecords =>
        currentRecords.filter(record => record.id !== id)
      )

      // Close the viewer if it currently displays the deleted record.
      if (selectedRecord?.id === id) {
        setSelectedRecord(null)
      }

      setConfirmDeleteId('')

      setDeleteMessage('Saved analysis record deleted successfully.')

    } catch (requestError) {

      setRecordError(
        requestError instanceof Error
          ? requestError.message
          : 'An unexpected deletion error occurred.'
      )

    } finally {

      setDeletingRecordId('')

    }
  }


  // Load saved records when this component first appears.
  useEffect(() => {
  let ignore = false

  async function fetchInitialRecords() {
    try {
      const response = await fetch('/api/analyses')
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          body?.error ||
          `Unable to retrieve saved analyses. HTTP ${response.status}.`
        )
      }

      if (
        !body ||
        body.success !== true ||
        !Array.isArray(body.records)
      ) {
        throw new Error(
          'The API returned an unexpected saved-analysis response.'
        )
      }

      if (!ignore) {
        setRecords(body.records)
      }
    } catch (requestError) {
      if (!ignore) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'An unexpected error occurred.'
        )
      }
    } finally {
      if (!ignore) {
        setIsLoading(false)
      }
    }
  }

  fetchInitialRecords()

  return () => {
    ignore = true
  }
}, [])


  return (
    <section className="saved-analyses-section">

      <div className="saved-analyses-header">

        <div>
          <p className="eyebrow">
            04 / PERSISTENT RECORDS
          </p>

          <h2>Saved analyses</h2>

          <p className="saved-analyses-description">
            Review analysis records previously stored by the backend.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={loadRecords}
          disabled={isLoading || loadingRecordId !== ''}
        >
          {isLoading ? 'Loading...' : 'Refresh list'}
        </button>

      </div>


      {isLoading && (
        <p className="saved-analyses-message" role="status">
          Loading saved analysis records...
        </p>
      )}


      {error && (
        <div className="saved-analyses-error" role="alert">
          <strong>Unable to load saved analyses</strong>
          <p>{error}</p>
        </div>
      )}


      {!isLoading && !error && records.length === 0 && (
        <div className="saved-analyses-empty">
          <h3>No saved analyses found</h3>

          <p>
            Run a FASTA analysis to create your first saved record.
          </p>
        </div>
      )}


      {!error && records.length > 0 && (

        <>

          <div className="saved-analyses-count">
            {records.length} saved record
            {records.length === 1 ? '' : 's'}
          </div>

          <div className="saved-analyses-list">

            {records.map(record => {

              const provenance = record.provenance || {}
              const input = provenance.input || {}
              const methods = provenance.analysis || {}

              return (

                <article
                  className="saved-analysis-card"
                  key={record.id}
                >

                  <div className="saved-analysis-card-header">

                    <span className="saved-analysis-indicator">
                      SAVED RECORD
                    </span>

                    <span className="saved-analysis-date">
                      {formatTimestamp(record.savedAt)}
                    </span>

                  </div>


                  <div className="saved-analysis-id">

                    <span>Record identifier</span>

                    <code>{record.id}</code>

                  </div>


                  <div className="saved-analysis-details">

                    <div>
                      <span>Input format</span>
                      <strong>
                        {input.format || 'Not recorded'}
                      </strong>
                    </div>

                    <div>
                      <span>Number of taxa</span>
                      <strong>
                        {Number.isInteger(input.sequenceCount)
                          ? input.sequenceCount
                          : 'Not recorded'}
                      </strong>
                    </div>

                    <div>
                      <span>Distance method</span>
                      <strong>
                        {methods.distanceMethod || 'Not recorded'}
                      </strong>
                    </div>

                    <div>
                      <span>Tree method</span>
                      <strong>
                        {methods.treeMethod || 'Not recorded'}
                      </strong>
                    </div>

                  </div>



<div className="saved-analysis-actions">

  <button
    type="button"
    className="saved-analysis-view-button"
    onClick={() => handleViewRecord(record.id)}
    disabled={
      loadingRecordId !== '' ||
      deletingRecordId !== ''
    }
  >
    {loadingRecordId === record.id
      ? 'Loading analysis...'
      : 'View analysis'}
  </button>

  <button
    type="button"
    className="saved-analysis-delete-button"
    onClick={() => {
      setConfirmDeleteId(currentId =>
        currentId === record.id ? '' : record.id
      )
      setDeleteMessage('')
      setRecordError('')
    }}
    disabled={
      loadingRecordId !== '' ||
      deletingRecordId !== ''
    }
  >
    Delete
  </button>

</div>

{confirmDeleteId === record.id && (

  <div className="delete-confirmation">

    <p>
      Permanently delete this saved analysis record?
      This action cannot be undone.
    </p>

    <div className="delete-confirmation-actions">

      <button
        type="button"
        className="confirm-delete-button"
        onClick={() => handleDeleteRecord(record.id)}
        disabled={deletingRecordId !== ''}
      >
        {deletingRecordId === record.id
          ? 'Deleting...'
          : 'Confirm deletion'}
      </button>

      <button
        type="button"
        className="cancel-delete-button"
        onClick={() => setConfirmDeleteId('')}
        disabled={deletingRecordId !== ''}
      >
        Cancel
      </button>

    </div>

  </div>

)}


                </article>

              )
            })}

          </div>

        </>

      )}


      {recordError && (
        <div className="saved-analyses-error" role="alert">
          <strong>Saved-analysis operation failed</strong>
          <p>{recordError}</p>
        </div>
      )}

      {deleteMessage && (
  <p className="saved-analysis-delete-message" role="status">
    {deleteMessage}
  </p>
)}


      {selectedRecord && (

        <section className="saved-record-viewer">

          <div className="saved-record-viewer-heading">

            <div>
              <p className="eyebrow">
                05 / RETRIEVED RESEARCH RECORD
              </p>

              <h3>Saved analysis results</h3>
            </div>

            <span className="saved-analysis-indicator">
              RETRIEVED
            </span>

          </div>


          <div className="saved-record-viewer-metadata">

            <div>
              <span>Record ID</span>
              <code>{selectedRecord.id}</code>
            </div>

            <div>
  <span>Originally saved</span>
  <strong>
    {formatTimestamp(selectedRecord.savedAt)}
  </strong>
</div>

          </div>


          <DistanceMatrix
            matrix={selectedRecord.analysis.distanceMatrix}
            method={
              selectedRecord.provenance.analysis?.distanceMethod
            }
          />


          <PhylogeneticTree
            tree={selectedRecord.analysis.tree}
            method={
              selectedRecord.provenance.analysis?.treeMethod
            }
          />


          <details className="saved-record-newick">

            <summary>Newick tree representation</summary>

            <pre>
              {selectedRecord.analysis.newick ||
                'Newick representation unavailable.'}
            </pre>

          </details>


          <details className="saved-record-provenance">

            <summary>Analysis provenance and fingerprints</summary>

            <Provenance
              provenance={selectedRecord.provenance}
            />

          </details>

        </section>

      )}

    </section>
  )
}

export default SavedAnalyses