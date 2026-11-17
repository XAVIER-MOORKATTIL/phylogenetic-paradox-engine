
import './DistanceMatrix.css'

// Format the numerical values returned by the backend.
function formatDistance(value) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return 'N/A'
  }

  if (value === 0) {
    return '0'
  }

  return value.toFixed(6)
}

function DistanceMatrix({ matrix, method }) {

  // Obtain organism names from the backend matrix.
  const taxa =
    matrix &&
    typeof matrix === 'object' &&
    !Array.isArray(matrix)
      ? Object.keys(matrix)
      : []

  if (taxa.length === 0) {
    return (
      <section className="distance-matrix-section">
        <h3>Pairwise distance matrix</h3>
        <p>Distance matrix is unavailable.</p>
      </section>
    )
  }

  return (
    <section className="distance-matrix-section">

      <div className="distance-matrix-heading">
        <div>
          <p className="eyebrow">
            01 / EVOLUTIONARY DISTANCES
          </p>

          <h3>Pairwise distance matrix</h3>
        </div>

        <span className="matrix-taxon-count">
          {taxa.length} taxa
        </span>
      </div>

      <div className="matrix-table-container">

        <table className="distance-matrix-table">

          <caption>
            Pairwise distances calculated by {method || 'the recorded analysis method'}.
          </caption>

          <thead>
            <tr>
              <th scope="col">Taxon</th>

              {taxa.map(taxon => (
                <th scope="col" key={taxon}>
                  {taxon}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {taxa.map(rowTaxon => (

              <tr key={rowTaxon}>

                <th scope="row">
                  {rowTaxon}
                </th>

                {taxa.map(columnTaxon => {

                  const value =
                    matrix[rowTaxon]?.[columnTaxon]

                  return (
                    <td
                      key={columnTaxon}
                      title={
                        typeof value === 'number'
                          ? `Exact value: ${value}`
                          : 'Value unavailable'
                      }
                    >
                      {formatDistance(value)}
                    </td>
                  )
                })}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <p className="matrix-method-note">
        These values are taken directly from the backend response.
        A value of zero indicates identical sequences at the
        compared positions. The distance method is {method || 'not specified'}.
      </p>

    </section>
  )
}

export default DistanceMatrix