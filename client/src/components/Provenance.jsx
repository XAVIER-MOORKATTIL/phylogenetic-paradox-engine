
import './Provenance.css'

function formatTimestamp(value) {
  if (typeof value !== 'string') {
    return 'Not recorded'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function Provenance({ provenance }) {
  if (!provenance || typeof provenance !== 'object') {
    return (
      <section className="provenance-section">
        <h3>Analysis provenance</h3>
        <p>Provenance information is unavailable.</p>
      </section>
    )
  }

  const software = provenance.software || {}
  const input = provenance.input || {}
  const source = provenance.source || {}
  const methods = provenance.analysis || {}

  const taxa = Array.isArray(input.taxa)
    ? input.taxa
    : []

  return (
    <section className="provenance-section">

      <div className="provenance-heading">
        <div>
          <p className="eyebrow">
            03 / REPRODUCIBILITY
          </p>

          <h3>Analysis provenance</h3>

          <p className="provenance-description">
            Recorded information about the input, software,
            source and computational methods.
          </p>
        </div>
      </div>


      {/* Software information */}

      <div className="provenance-group">

        <h4>Software</h4>

        <div className="provenance-grid">

          <div className="provenance-item">
            <span>Application</span>
            <strong>{software.name || 'Not recorded'}</strong>
          </div>

          <div className="provenance-item">
            <span>Version</span>
            <strong>{software.version || 'Not recorded'}</strong>
          </div>

          <div className="provenance-item">
            <span>Generated at</span>
            <strong>{formatTimestamp(provenance.generatedAt)}</strong>
          </div>

        </div>

      </div>


      {/* Input information */}

      <div className="provenance-group">

        <h4>Input information</h4>

        <div className="provenance-grid">

          <div className="provenance-item">
            <span>Input format</span>
            <strong>{input.format || 'Not recorded'}</strong>
          </div>

          <div className="provenance-item">
            <span>Number of taxa</span>
            <strong>
              {Number.isInteger(input.sequenceCount)
                ? input.sequenceCount
                : 'Not recorded'}
            </strong>
          </div>

        </div>

        <div className="taxa-list">

          <h5>Taxa included in the analysis</h5>

          {taxa.length > 0 ? (

            <ul>
              {taxa.map((taxon, index) => (
                <li key={`${taxon.name}-${index}`}>
                  <span>{taxon.name}</span>

                  <span>
                    {taxon.sequenceLength} characters
                  </span>
                </li>
              ))}
            </ul>

          ) : (

            <p>No taxon details recorded.</p>

          )}

        </div>

      </div>


      {/* Source information */}

      <div className="provenance-group">

        <h4>Biological source information</h4>

        <div className="provenance-item">

          <span>Source status</span>

          <strong>
            {source.status === 'user-provided'
              ? 'User-provided'
              : source.status === 'not-provided'
                ? 'Not provided'
                : source.status || 'Not recorded'}
          </strong>

        </div>

        {source.details && (
          <pre className="provenance-source-details">
            {JSON.stringify(source.details, null, 2)}
          </pre>
        )}

      </div>


      {/* Computational methods */}

      <div className="provenance-group">

        <h4>Computational methods</h4>

        <div className="provenance-grid">

          <div className="provenance-item">
            <span>Alignment</span>
            <strong>{methods.alignment || 'Not recorded'}</strong>
          </div>

          <div className="provenance-item">
            <span>Distance method</span>
            <strong>
              {methods.distanceMethod || 'Not recorded'}
            </strong>
          </div>

          <div className="provenance-item">
            <span>Gap treatment</span>
            <strong>
              {methods.gapTreatment || 'Not recorded'}
            </strong>
          </div>

          <div className="provenance-item">
            <span>Tree construction</span>
            <strong>{methods.treeMethod || 'Not recorded'}</strong>
          </div>

          <div className="provenance-item">
            <span>Output format</span>
            <strong>{methods.outputFormat || 'Not recorded'}</strong>
          </div>

        </div>

      </div>


      {/* Cryptographic fingerprints */}

      <div className="provenance-group">

        <h4>SHA-256 fingerprints</h4>

        <p className="provenance-hash-description">
          These fingerprints identify the recorded input and
          canonicalized sequence data. They are integrity
          references, not proof of biological authenticity.
        </p>

        <div className="provenance-hash">

          <span>Original input fingerprint</span>

          <code>
            {input.sha256 || 'Not recorded'}
          </code>

        </div>

        <div className="provenance-hash">

          <span>Sequence-data fingerprint</span>

          <code>
            {input.sequenceDataSha256 || 'Not recorded'}
          </code>

        </div>

      </div>

    </section>
  )
}

export default Provenance