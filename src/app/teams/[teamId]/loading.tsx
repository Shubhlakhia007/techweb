/** Shown instantly when navigating to /teams/[id] while the team dashboard loads. */
export default function TeamDetailLoading() {
  return (
    <div className="container">
      {/* Breadcrumb + header */}
      <div className="page-header">
        <div className="skeleton sk-text" style={{ width: 130, marginBottom: 18 }} />
        <div className="skeleton sk-h1"   style={{ width: '50%', marginBottom: 14 }} />
        <div className="skeleton sk-text" style={{ width: '40%' }} />
      </div>

      {/* Dashboard: two columns */}
      <div className="dashboard-grid">
        {/* Members card */}
        <div className="card">
          <div className="skeleton sk-title" style={{ width: 140, marginBottom: 18 }} />
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: 14, borderBottom: '1px solid #273650' }}>
              <div className="skeleton sk-text" style={{ width: '50%' }} />
              <div className="skeleton sk-text" style={{ width: 60 }} />
            </div>
          ))}
          <div className="skeleton" style={{ height: 46, borderRadius: 10, marginTop: 20 }} />
        </div>

        {/* Eligibility card */}
        <div className="card">
          <div className="skeleton sk-title" style={{ width: 160, marginBottom: 18 }} />
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBlock: 14, borderBottom: '1px solid #273650' }}>
              <div className="skeleton sk-badge" style={{ flexShrink: 0 }} />
              <div className="skeleton sk-text" style={{ flex: 1 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Skill coverage section */}
      <div className="section">
        <div className="skeleton sk-title" style={{ width: 250, marginBottom: 22 }} />
        <div className="card-grid">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="skeleton sk-text" style={{ width: '50%' }} />
                <div className="skeleton sk-text" style={{ width: 30 }} />
              </div>
              <div className="skeleton" style={{ height: 8, borderRadius: 10, margin: '12px 0' }} />
              <div className="skeleton sk-text" style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations section */}
      <div>
        <div className="skeleton sk-title" style={{ width: 220, marginBottom: 10 }} />
        <div className="skeleton sk-text" style={{ width: '70%', marginBottom: 22 }} />
        <div className="card-grid">
          {[0, 1, 2].map(i => (
            <div key={i} className="card">
              <div className="skeleton sk-title" style={{ width: '60%', marginBottom: 10 }} />
              <div className="skeleton sk-text"  style={{ width: '80%', marginBottom: 14 }} />
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <div className="skeleton sk-badge" />
                <div className="skeleton sk-badge" />
              </div>
              <div className="skeleton sk-text" style={{ width: 100 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
