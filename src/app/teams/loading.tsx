/** Shown instantly when navigating to /teams while the teams listing loads. */
export default function TeamsLoading() {
  return (
    <div className="container directory-page">
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: 24 }}>
        <div className="skeleton sk-text" style={{ width: 180, marginBottom: 12 }} />
        <div className="skeleton sk-h1"   style={{ width: '45%', marginBottom: 14 }} />
        <div className="skeleton sk-text" style={{ width: '55%' }} />
      </div>

      {/* Results bar */}
      <div className="results-bar">
        <div className="skeleton sk-text" style={{ width: 120 }} />
      </div>

      {/* Team card grid */}
      <div className="discovery-grid">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="sk-card team-preview" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Top row: monogram + badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 14 }} />
              <div className="skeleton sk-badge" />
            </div>
            <div className="skeleton sk-title" style={{ width: '70%', marginBottom: 10 }} />
            <div className="skeleton sk-text"  style={{ width: '55%', marginBottom: 18 }} />
            {/* Bottom row */}
            <div style={{ borderTop: '1px solid #273650', paddingTop: 18, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                {[0, 1, 2].map(j => (
                  <div key={j} className="skeleton sk-avatar" style={{ marginLeft: j === 0 ? 0 : -6, border: '3px solid #101b30' }} />
                ))}
              </div>
              <div className="skeleton sk-text" style={{ width: 80 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
