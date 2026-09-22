export default function Loading() {
  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      {/* Page header skeleton */}
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton sk-text" style={{ width: 120, marginBottom: 14 }} />
        <div className="skeleton sk-h1"   style={{ width: '55%', marginBottom: 16 }} />
        <div className="skeleton sk-text" style={{ width: '70%' }} />
      </div>
      {/* Card grid skeleton — 3 columns matching discovery-grid */}
      <div className="discovery-grid">
        {[0, 1, 2].map(i => (
          <div key={i} className="sk-card">
            <div className="skeleton sk-art" />
            <div className="skeleton sk-badge" style={{ marginBottom: 14 }} />
            <div className="skeleton sk-title" style={{ width: '80%', marginBottom: 12 }} />
            <div className="skeleton sk-text"  style={{ marginBottom: 8 }} />
            <div className="skeleton sk-text"  style={{ width: '65%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

