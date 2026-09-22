/** Shown instantly when navigating to /people/[userId] while the public profile loads. */
export default function PersonLoading() {
  return (
    <div className="container public-profile">
      <div className="page-header" style={{ paddingBottom: 24 }}>
        <div className="skeleton sk-text" style={{ width: 100, marginBottom: 18 }} />
        {/* Name */}
        <div className="skeleton sk-h1" style={{ width: '45%', marginBottom: 14 }} />
        {/* Badge row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div className="skeleton sk-badge" />
          <div className="skeleton sk-badge" />
          <div className="skeleton sk-badge" />
        </div>
        {/* Bio lines */}
        <div className="skeleton sk-text" style={{ width: '80%', marginBottom: 8 }} />
        <div className="skeleton sk-text" style={{ width: '65%' }} />
      </div>

      <div className="dashboard-grid">
        {/* Skills card */}
        <div className="card">
          <div className="skeleton sk-title" style={{ width: 80, marginBottom: 18 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[90, 70, 110, 80, 95, 75].map((w, i) => (
              <div key={i} className="skeleton sk-badge" style={{ width: w }} />
            ))}
          </div>
        </div>

        {/* Work links card */}
        <div className="card">
          <div className="skeleton sk-title" style={{ width: 110, marginBottom: 18 }} />
          {[0, 1, 2].map(i => (
            <div key={i} style={{ paddingBlock: 14, borderBottom: '1px solid #273650' }}>
              <div className="skeleton sk-text" style={{ width: '70%', marginBottom: 8 }} />
              <div className="skeleton sk-text" style={{ width: '45%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
