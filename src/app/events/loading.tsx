/** Shown instantly when navigating to /events while Prisma queries run. */
export default function EventsLoading() {
  return (
    <div className="container directory-page">
      {/* Page header */}
      <div className="page-header section-header" style={{ paddingBottom: 24 }}>
        <div>
          <div className="skeleton sk-text" style={{ width: 200, marginBottom: 12 }} />
          <div className="skeleton sk-h1"   style={{ width: '50%', marginBottom: 14 }} />
          <div className="skeleton sk-text" style={{ width: '60%' }} />
        </div>
        <div className="skeleton" style={{ width: 120, height: 46, borderRadius: 10, flexShrink: 0 }} />
      </div>

      {/* Filter bar skeleton */}
      <div className="filters">
        {[260, 120, 120, 120, 120, 88].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: w, height: 46, borderRadius: 9 }} />
        ))}
      </div>

      {/* Results bar */}
      <div className="results-bar">
        <div className="skeleton sk-text" style={{ width: 140 }} />
      </div>

      {/* Card grid */}
      <div className="discovery-grid">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="sk-card">
            <div className="skeleton sk-art" />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div className="skeleton sk-badge" />
              <div className="skeleton sk-badge" />
            </div>
            <div className="skeleton sk-title" style={{ width: '80%', marginBottom: 10 }} />
            <div className="skeleton sk-text"  style={{ marginBottom: 6 }} />
            <div className="skeleton sk-text"  style={{ width: '65%', marginBottom: 18 }} />
            <div style={{ borderTop: '1px solid #273650', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton sk-text" style={{ width: 80 }} />
              <div className="skeleton sk-text" style={{ width: 60 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
