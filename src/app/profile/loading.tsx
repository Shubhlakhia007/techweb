/** Shown instantly when navigating to /profile while the authenticated profile editor loads. */
export default function ProfileLoading() {
  return (
    <div className="container">
      {/* Header */}
      <div className="page-header section-header" style={{ paddingBottom: 24 }}>
        <div>
          <div className="skeleton sk-h1"   style={{ width: 180, marginBottom: 12 }} />
          <div className="skeleton sk-text" style={{ width: 300 }} />
        </div>
        <div className="skeleton" style={{ width: 100, height: 46, borderRadius: 10, flexShrink: 0 }} />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        <div className="skeleton sk-text" style={{ width: 160 }} />
      </div>

      {/* Form card */}
      <div className="card form-card">
        {/* Section title */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0 }} />
          <div>
            <div className="skeleton sk-title" style={{ width: 180, marginBottom: 8 }} />
            <div className="skeleton sk-text"  style={{ width: 260 }} />
          </div>
        </div>

        {/* Two-column form rows */}
        {[0, 1].map(row => (
          <div key={row} className="form-row" style={{ marginBottom: 20 }}>
            {[0, 1].map(col => (
              <div key={col} className="form-group" style={{ marginBottom: 0 }}>
                <div className="skeleton sk-text" style={{ width: 80, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 46, borderRadius: 9 }} />
              </div>
            ))}
          </div>
        ))}

        {/* Full-width textarea */}
        <div className="form-group">
          <div className="skeleton sk-text" style={{ width: 40, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 9 }} />
        </div>

        {/* Skills section placeholder */}
        <div style={{ borderTop: '1px solid #273650', paddingTop: 24, marginTop: 8 }}>
          <div className="skeleton sk-title" style={{ width: 120, marginBottom: 16 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[80, 95, 70, 110, 85].map((w, i) => (
              <div key={i} className="skeleton sk-badge" style={{ width: w, height: 36 }} />
            ))}
          </div>
        </div>

        {/* Action bar */}
        <div style={{ borderTop: '1px solid #273650', paddingTop: 22, marginTop: 26, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="skeleton" style={{ width: 120, height: 46, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}
