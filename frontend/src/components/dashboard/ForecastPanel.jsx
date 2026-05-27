import { decimal } from "../../constants/utils";

export function SalesForecastPanel({ data, loading }) {
  if (loading && !data) {
    return (
      <div className="forecast-panel">
        <div className="forecast-panel-header">
          <div className="forecast-panel-icon forecast-panel-icon-blue">📈</div>
          <div>
            <h3>Sales Volume Forecast</h3>
            <span className="forecast-panel-model">LinearRegression · Loading...</span>
          </div>
        </div>
        <div className="forecast-skeleton-grid">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="forecast-skeleton-card">
              <div className="forecast-skeleton-line short" />
              <div className="forecast-skeleton-block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.status === "insufficient_data" || data.status === "error") {
    return (
      <div className="forecast-panel">
        <div className="forecast-panel-header">
          <div className="forecast-panel-icon forecast-panel-icon-blue">📈</div>
          <div>
            <h3>Sales Volume Forecast</h3>
            <span className="forecast-panel-model">LinearRegression · Engine</span>
          </div>
        </div>
        <div className="forecast-empty">
          <span className="forecast-empty-icon">📭</span>
          <p>{data?.message || data?.error || "Insufficient historical data for forecasting (minimum 20 orders required)."}</p>
        </div>
      </div>
    );
  }

  const daily = data.daily_forecast || [];
  const maxSales = Math.max(...daily.map((d) => d.predicted_sales), 1);

  return (
    <div className="forecast-panel">
      <div className="forecast-panel-header">
        <div className="forecast-panel-icon forecast-panel-icon-blue">📈</div>
        <div className="forecast-panel-title-block">
          <h3>Sales Volume Forecast</h3>
          <span className="forecast-panel-model">{data.model_used}</span>
        </div>
        <div className="forecast-panel-total">
          <span>Projected Revenue</span>
          <strong>${Number(data.total_predicted_revenue || 0).toLocaleString()}</strong>
        </div>
      </div>

      <div className="forecast-panel-stats">
        <div className="forecast-stat-pill">
          <span>📅 {data.forecast_days}-Day Outlook</span>
        </div>
        <div className="forecast-stat-pill">
          <span>📊 Daily Avg: ${Number(data.historical_daily_average || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="forecast-daily-grid">
        {daily.map((day) => (
          <div key={day.date} className={`forecast-day-card ${day.is_payday ? "forecast-day-payday" : ""}`}>
            <div className="forecast-day-top">
              <span className="forecast-day-date">{formatShortDate(day.date)}</span>
              {day.is_payday && <span className="forecast-day-badge">💰 PAYDAY</span>}
            </div>
            <span className="forecast-day-value">${decimal(day.predicted_sales, 0)}</span>
            <div className="forecast-day-bar">
              <div
                className="forecast-day-bar-fill"
                style={{ width: `${Math.max(5, (day.predicted_sales / maxSales) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReturnForecastPanel({ data, loading }) {
  if (loading && !data) {
    return (
      <div className="forecast-panel">
        <div className="forecast-panel-header">
          <div className="forecast-panel-icon forecast-panel-icon-orange">🔄</div>
          <div>
            <h3>Return Load Forecast</h3>
            <span className="forecast-panel-model">RandomForestClassifier · Loading...</span>
          </div>
        </div>
        <div className="forecast-skeleton-stats">
          {[0, 1, 2].map((i) => (
            <div key={i} className="forecast-skeleton-stat-card">
              <div className="forecast-skeleton-line medium" />
              <div className="forecast-skeleton-block tall" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.status === "insufficient_data" || data.status === "error") {
    return (
      <div className="forecast-panel">
        <div className="forecast-panel-header">
          <div className="forecast-panel-icon forecast-panel-icon-orange">🔄</div>
          <div>
            <h3>Return Load Forecast</h3>
            <span className="forecast-panel-model">RandomForestClassifier · Engine</span>
          </div>
        </div>
        <div className="forecast-empty">
          <span className="forecast-empty-icon">📭</span>
          <p>{data?.error || "Insufficient data for return prediction."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forecast-panel">
      <div className="forecast-panel-header">
        <div className="forecast-panel-icon forecast-panel-icon-orange">🔄</div>
        <div className="forecast-panel-title-block">
          <h3>Return Load Forecast</h3>
          <span className="forecast-panel-model">{data.model_used}</span>
        </div>
      </div>

      <div className="forecast-panel-stats">
        <div className="forecast-stat-pill">
          <span>📦 {data.total_pending_orders || 0} orders analyzed</span>
        </div>
        <div className="forecast-stat-pill">
          <span>🎯 {data.return_probability}% return probability</span>
        </div>
      </div>

      <div className="return-forecast-grid">
        <div className="return-forecast-stat">
          <span className="return-forecast-stat-label">Expected Returns</span>
          <strong className="return-forecast-stat-val return-forecast-danger">
            {data.expected_return_units}
            <small>units</small>
          </strong>
        </div>
        <div className="return-forecast-stat">
          <span className="return-forecast-stat-label">Refund Liability</span>
          <strong className="return-forecast-stat-val return-forecast-warning">
            ${Number(data.predicted_refund_liability || 0).toLocaleString()}
          </strong>
        </div>
        <div className="return-forecast-stat">
          <span className="return-forecast-stat-label">Return Rate</span>
          <strong className="return-forecast-stat-val">
            {data.return_probability}%
          </strong>
          <div className="return-forecast-bar">
            <div
              className="return-forecast-bar-fill"
              style={{ width: `${Math.min(100, data.return_probability)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SafetyStockPanel({ data, loading }) {
  if (loading && !data) {
    return (
      <div className="forecast-panel">
        <div className="forecast-panel-header">
          <div className="forecast-panel-icon forecast-panel-icon-red">⚙️</div>
          <div>
            <h3>Safety Stock Adjustment</h3>
            <span className="forecast-panel-model">Lead-Time Drift · Loading...</span>
          </div>
        </div>
        <div className="forecast-skeleton-stats">
          {[0, 1, 2].map((i) => (
            <div key={i} className="forecast-skeleton-stat-card">
              <div className="forecast-skeleton-line short" />
              <div className="forecast-skeleton-block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.status === "no_data" || data.status === "error") {
    return (
      <div className="forecast-panel">
        <div className="forecast-panel-header">
          <div className="forecast-panel-icon forecast-panel-icon-red">⚙️</div>
          <div>
            <h3>Safety Stock Adjustment</h3>
            <span className="forecast-panel-model">Lead-Time Drift · Engine</span>
          </div>
        </div>
        <div className="forecast-empty">
          <span className="forecast-empty-icon">📭</span>
          <p>{data?.message || "No purchase order data available."}</p>
        </div>
      </div>
    );
  }

  const suppliers = data.supplier_drifts || [];

  return (
    <div className="forecast-panel">
      <div className="forecast-panel-header">
        <div className="forecast-panel-icon forecast-panel-icon-red">⚙️</div>
        <div className="forecast-panel-title-block">
          <h3>Lead-Time Drift Analysis</h3>
          <span className="forecast-panel-model">Dynamic Safety Stock Adjustment</span>
        </div>
      </div>

      <div className="forecast-panel-stats">
        <div className="forecast-stat-pill">
          <span>📦 {data.total_purchase_orders} POs analyzed</span>
        </div>
        <div className="forecast-stat-pill forecast-stat-pill-danger">
          <span>⚠️ Avg drift: +{data.overall_avg_drift} days</span>
        </div>
      </div>

      <div className="safety-stock-grid">
        {suppliers.map((s) => (
          <div key={s.supplier_id} className="safety-stock-card">
            <div className="safety-stock-top">
              <span className="safety-stock-id">Supplier #{s.supplier_id}</span>
              <span className="safety-stock-orders">{s.order_count} POs</span>
            </div>
            <div className="safety-stock-metrics">
              <div className="safety-stock-metric">
                <span>Avg Drift</span>
                <strong className={s.avg_drift > 3 ? "safety-stock-danger" : "safety-stock-warn"}>
                  +{s.avg_drift}d
                </strong>
              </div>
              <div className="safety-stock-metric">
                <span>Max Drift</span>
                <strong>+{s.max_drift}d</strong>
              </div>
              <div className="safety-stock-metric safety-stock-metric-full">
                <span>Early Warning</span>
                <strong className="safety-stock-danger">{s.early_warning_days} days early</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
