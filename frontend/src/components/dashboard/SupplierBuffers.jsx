export default function SupplierBuffers({ buffers }) {
  if (!buffers || buffers.length === 0) {
    return (
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <p className="dashboard-section-kicker">Supplier Drift</p>
          <h2>Dynamic Safety Stock Buffers</h2>
        </div>
        <div className="dashboard-empty-state">No supplier data available.</div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <p className="dashboard-section-kicker">Supplier Drift Buffers</p>
        <h2>Dynamic Safety Stock Adjustment</h2>
      </div>
      <div className={buffers.length === 1 ? "supplier-buffers-single" : "supplier-buffers-grid"}>
        {buffers.map((buf) => (
          <div key={buf.category} className="supplier-buffer-card">
            <span className="supplier-buffer-category">{buf.category}</span>
            <div className="supplier-buffer-metrics">
              <div className="supplier-buffer-metric">
                <span>Daily Demand</span>
                <strong>{buf.avg_daily_demand}</strong>
              </div>
              <div className="supplier-buffer-metric">
                <span>σ (Std Dev)</span>
                <strong>{buf.demand_std}</strong>
              </div>
              <div className="supplier-buffer-metric">
                <span>Lead Time</span>
                <strong>{buf.lead_time_weeks}w</strong>
              </div>
              <div className="supplier-buffer-metric supplier-buffer-highlight">
                <span>Safety Stock</span>
                <strong>{buf.safety_stock_units} units</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
