/** Shown instantly when navigating to /events/[id] while the event detail loads. */
export default function EventDetailLoading() {
  return (
    <div className="container">
      {/* Breadcrumb + header */}
      <div className="page-header">
        <div className="skeleton sk-text" style={{ width: 140, marginBottom: 18 }} />
        <div className="skeleton sk-h1"   style={{ width: '60%', marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div className="skeleton sk-badge" />
          <div className="skeleton sk-badge" />
          <div className="skeleton sk-badge" />
        </div>
        <div className="skeleton sk-text" style={{ width: '75%' }} />
      </div>

      {/* Event facts strip */}
      <div className="event-facts" style={{ paddingBottom: 28 }}>
        {[0, 1, 2].map(i => (
          <div key={i}>
            <div className="skeleton sk-text" style={{ width: 60, marginBottom: 8 }} />
            <div className="skeleton sk-title" style={{ width: 110 }} />
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="skeleton sk-title" style={{ width: 140, marginBottom: 18 }} />
          {[1, 0.8, 0.9, 0.7].map((w, i) => (
            <div key={i} className="skeleton sk-text" style={{ width: `${w * 100}%`, marginBottom: 10 }} />
          ))}
        </div>
        <div className="card">
          <div className="skeleton sk-title" style={{ width: 160, marginBottom: 18 }} />
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBlock: 14, borderBottom: '1px solid #273650' }}>
              <div className="skeleton sk-avatar" />
              <div style={{ flex: 1 }}>
                <div className="skeleton sk-text" style={{ width: '60%', marginBottom: 8 }} />
                <div className="skeleton sk-text" style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
