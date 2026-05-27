export default function ReturnRates({ categories, totalReturned, estimated30d }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <p className="dashboard-section-kicker">Reverse Logistics</p>
          <h2>Return Rate Analysis</h2>
        </div>
        <div className="dashboard-empty-state">No return data available.</div>
      </div>
    );
  }

  const maxRate = Math.max(...categories.map((c) => c.return_rate_pct), 1);

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <div>
          <p className="dashboard-section-kicker">Reverse Logistics Forecast</p>
          <h2>Return Rate Analysis</h2>
        </div>
        <div className="dashboard-stat-pill">
          {totalReturned} total returns · ~{estimated30d}/mo est.
        </div>
      </div>
      <div className="return-rates-grid">
        {categories.map((cat) => (
          <div key={cat.category} className="return-rate-card">
            <div className="return-rate-header">
              <span className="return-rate-category">{cat.category}</span>
              <span className={`return-rate-value ${cat.return_rate_pct > 15 ? "return-rate-high" : cat.return_rate_pct > 8 ? "return-rate-med" : "return-rate-low"}`}>
                {cat.return_rate_pct}%
              </span>
            </div>
            <div className="return-rate-bar-track">
              <div
                className={`return-rate-bar-fill ${cat.return_rate_pct > 15 ? "return-rate-bar-high" : cat.return_rate_pct > 8 ? "return-rate-bar-med" : "return-rate-bar-low"}`}
                style={{ width: `${(cat.return_rate_pct / maxRate) * 100}%` }}
              />
            </div>
            <div className="return-rate-meta">
              <span>{cat.returned_orders} returned</span>
              <span>{cat.total_orders} total orders</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
