
import './PhylogeneticTree.css'

const LEFT_PADDING = 35
const TREE_WIDTH = 590
const TOP_PADDING = 42
const LEAF_GAP = 68
const SVG_WIDTH = 900

// Convert the backend tree into screen coordinates.
function buildTreeLayout(root) {
  let nextLeafIndex = 0

  function visit(node, distanceFromRoot) {
    if (!node || typeof node !== 'object') {
      return null
    }

    const edges = ['left', 'right']
      .map(key => node[key])
      .filter(edge =>
        edge &&
        typeof edge === 'object' &&
        edge.node &&
        typeof edge.node === 'object'
      )

    const current = {
      node,
      x: distanceFromRoot,
      y: 0,
      children: [],
    }

    // A node without children is a terminal taxon.
    if (edges.length === 0) {
      current.y =
        TOP_PADDING + nextLeafIndex * LEAF_GAP

      nextLeafIndex += 1

      return current
    }

    // Visit each child using its actual branch length.
    current.children = edges.map(edge => {

      const branchLength =
        Number.isFinite(edge.branchLength) &&
        edge.branchLength >= 0
          ? edge.branchLength
          : 0

      const childLayout = visit(
        edge.node,
        distanceFromRoot + branchLength
      )

      return {
        branchLength,
        layout: childLayout,
      }

    }).filter(child => child.layout !== null)

    // Place an internal node between its children.
    if (current.children.length === 0) {
      return null
    }

    const totalChildY = current.children.reduce(
      (total, child) => total + child.layout.y,
      0
    )

    current.y =
      totalChildY / current.children.length

    return current
  }

  return visit(root, 0)
}


// Collect all nodes and connecting branches.
function collectTreeElements(layout) {
  const nodes = []
  const edges = []
  const leaves = []

  function visit(current) {
    if (!current) {
      return
    }

    nodes.push(current)

    if (current.children.length === 0) {
      leaves.push(current)
      return
    }

    current.children.forEach(child => {

      edges.push({
        parent: current,
        child: child.layout,
        branchLength: child.branchLength,
      })

      visit(child.layout)

    })
  }

  visit(layout)

  return {
    nodes,
    edges,
    leaves,
  }
}


function PhylogeneticTree({ tree, method }) {
  if (!tree || typeof tree !== 'object') {
    return (
      <section className="phylo-tree-section">
        <h3>Phylogenetic tree</h3>
        <p>Tree data is unavailable.</p>
      </section>
    )
  }

  const layout = buildTreeLayout(tree)

  if (!layout) {
    return (
      <section className="phylo-tree-section">
        <h3>Phylogenetic tree</h3>
        <p>The tree structure could not be displayed.</p>
      </section>
    )
  }

  const {
    nodes,
    edges,
    leaves,
  } = collectTreeElements(layout)

  if (leaves.length < 2) {
    return (
      <section className="phylo-tree-section">
        <h3>Phylogenetic tree</h3>
        <p>At least two terminal taxa are required.</p>
      </section>
    )
  }

  const maximumDepth = Math.max(
    ...leaves.map(leaf => leaf.x)
  )

  // Translate evolutionary distance into SVG horizontal position.
  function getX(distance) {
    if (maximumDepth === 0) {
      return LEFT_PADDING
    }

    return (
      LEFT_PADDING +
      (distance / maximumDepth) * TREE_WIDTH
    )
  }

  const svgHeight = Math.max(
    180,
    TOP_PADDING * 2 +
      (leaves.length - 1) * LEAF_GAP
  )

  return (
    <section className="phylo-tree-section">

      <div className="phylo-tree-heading">

        <div>
          <p className="eyebrow">
            02 / PHYLOGENETIC INFERENCE
          </p>

          <h3>UPGMA phylogenetic tree</h3>
        </div>

        <span className="tree-taxon-count">
          {leaves.length} taxa
        </span>

      </div>

      <p className="phylo-tree-description">
        A rooted tree with horizontal branch lengths
        proportional to the values returned by the backend.
      </p>

      <div className="phylo-tree-container">

        <svg
          className="phylo-tree-svg"
          viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
          role="img"
          aria-label="Rooted UPGMA phylogenetic tree with branch lengths"
        >

          <title>
            UPGMA phylogenetic tree
          </title>

          {/* Draw the branches. */}
          {edges.map((edge, index) => {

            const parentX = getX(edge.parent.x)
            const childX = getX(edge.child.x)

            const parentY = edge.parent.y
            const childY = edge.child.y

            const labelX =
              (parentX + childX) / 2

            return (
              <g key={`branch-${index}`}>

                <path
                  className="phylo-branch"
                  d={
                    `M ${parentX} ${parentY} ` +
                    `V ${childY} ` +
                    `H ${childX}`
                  }
                />

                <text
                  className="phylo-branch-label"
                  x={labelX}
                  y={childY - 9}
                  textAnchor="middle"
                >
                  {edge.branchLength.toFixed(6)}
                </text>

              </g>
            )
          })}


          {/* Draw internal nodes and terminal taxa. */}
          {nodes.map((current, index) => {

            const x = getX(current.x)
            const isLeaf = current.children.length === 0

            return (
              <g key={`node-${index}`}>

                <circle
                  className="phylo-node"
                  cx={x}
                  cy={current.y}
                  r={isLeaf ? 4 : 3.5}
                />

                {isLeaf && (

                  <text
                    className="phylo-leaf-label"
                    x={x + 13}
                    y={current.y + 5}
                  >
                    {current.node.name || 'Unnamed taxon'}
                  </text>

                )}

              </g>
            )
          })}

        </svg>

      </div>

      <div className="phylo-tree-legend">
        <span>
          <span className="legend-dot"></span>
          Terminal taxa
        </span>

        <span>
          <span className="legend-line"></span>
          Evolutionary branch
        </span>

        <span>
          Labels show branch lengths
        </span>
      </div>

      <p className="phylo-tree-note">
        Tree method: {method || 'UPGMA'}.
        Branch lengths represent the backend's distance-based
        estimates. UPGMA assumes approximately constant
        evolutionary rates. No statistical branch-support
        values are calculated by this visualization.
      </p>

    </section>
  )
}

export default PhylogeneticTree