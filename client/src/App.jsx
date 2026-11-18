import FastaInput from './components/FastaInput'
import SavedAnalyses from './components/SavedAnalyses'
import './App.css'

function FeatureCard({ number, title, description, status }) {
  return (
    <article className="feature-card">
      <div className="feature-top">
        <span className="feature-number">{number}</span>
        <span className="feature-status">{status}</span>
      </div>

      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

function App() {
  return (
    <main className="app-shell">

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            PPE
          </div>

          <div className="brand-copy">
            <span className="brand-name">
              Phylogenetic Paradox Engine
            </span>
            <span className="brand-subtitle">
              Evolutionary analysis workspace
            </span>
          </div>
        </div>

        <div className="environment-label">
          <span className="status-dot"></span>
          RESEARCH WORKSPACE
        </div>
      </header>


      <section className="hero">
        <p className="eyebrow">
          MOLECULAR EVOLUTION / RESEARCH WORKSPACE
        </p>

        <h1>
          Explore patterns of
          <br />
          <span>shared ancestry.</span>
        </h1>

        <p className="hero-description">
          A computational workspace for examining DNA sequence
          differences, estimating evolutionary distances, and
          constructing phylogenetic trees.
        </p>

        <div className="hero-tags">
          <span>DNA sequence analysis</span>
          <span>UPGMA clustering</span>
          <span>Newick output</span>
        </div>
      </section>

      <FastaInput />
      <SavedAnalyses />
      <section className="workspace-grid">

        <div className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / COMPUTATIONAL PIPELINE</p>
              <h2>Analysis modules</h2>
            </div>

            <span className="panel-label">
              BACKEND IMPLEMENTED
            </span>
          </div>

          <p className="panel-description">
            The analytical modules are implemented in the backend
and accessible through the connected React interface.
          </p>

          <div className="feature-list">

            <FeatureCard
              number="01"
              title="FASTA ingestion"
              description="Parse DNA sequence records and validate taxon names and sequence limits."
              status="Backend ready"
            />

            <FeatureCard
              number="02"
              title="Evolutionary distances"
              description="Calculate ordinary and aligned pairwise p-distance matrices."
              status="Backend ready"
            />

            <FeatureCard
              number="03"
              title="Phylogenetic trees"
              description="Construct UPGMA trees and generate Newick output with analysis provenance."
              status="Backend ready"
            />

          </div>
        </div>


        <aside className="science-panel">
          <div className="science-icon" aria-hidden="true">
            i
          </div>

          <p className="eyebrow">
            SCIENTIFIC GUARDRAIL
          </p>

          <h2>
            Common ancestry is not direct ancestry.
          </h2>

          <p className="science-description">
            Humans and modern sharks share ancient vertebrate
            ancestry. Modern sharks are not direct ancestors of
            modern humans.
          </p>

          <div className="science-divider"></div>

          <p className="science-note">
            A phylogenetic tree is an evolutionary hypothesis
            inferred from data and analytical assumptions.
            Computational output alone does not establish
            biological truth.
          </p>

          <div className="science-footer">
            DATA INTEGRITY / SCIENTIFIC VALIDATION
          </div>
        </aside>

      </section>


      <section className="limits-section">
        <p className="eyebrow">02 / CURRENT BACKEND LIMITS</p>

        <div className="limits-grid">

          <div className="limit-card">
            <span className="limit-value">50</span>
            <span className="limit-label">
              Maximum taxa
            </span>
          </div>

          <div className="limit-card">
            <span className="limit-value">10,000</span>
            <span className="limit-label">
              Maximum sequence characters
            </span>
          </div>

          <div className="limit-card">
            <span className="limit-value">NEWICK</span>
            <span className="limit-label">
              Tree representation format
            </span>
          </div>

        </div>
      </section>


      <footer className="footer">
        <span>PHYLOGENETIC PARADOX ENGINE</span>
        <span>
          Educational computational tool · Results depend on
          data quality and model assumptions.
        </span>
      </footer>

    </main>
  )
}

export default App