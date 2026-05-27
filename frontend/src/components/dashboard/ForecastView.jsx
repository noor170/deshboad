import { SalesForecastPanel, ReturnForecastPanel, SafetyStockPanel } from "./ForecastPanel";

export default function ForecastView({
  salesForecast,
  returnForecast,
  safetyStock,
  loading,
}) {
  return (
    <div className="forecast-page forecast-page-ai">
      <div className="forecast-card forecast-card-ai-header">
        <div className="ai-header-content">
          <div className="ai-header-badge">
            <span className="ai-header-dot" />
            AI ENGINE ACTIVE
          </div>
          <h1>Predictive Analytics &amp; Forecasting</h1>
          <p className="ai-header-subtitle">
            Machine learning models analyzing sales velocity, return patterns, and supplier lead-time drift
            to generate actionable forecasts.
          </p>
        </div>
      </div>

      <div className="forecast-card">
        <SalesForecastPanel data={salesForecast} loading={loading} />
      </div>

      <div className="forecast-ai-grid">
        <div className="forecast-card">
          <ReturnForecastPanel data={returnForecast} loading={loading} />
        </div>
        <div className="forecast-card">
          <SafetyStockPanel data={safetyStock} loading={loading} />
        </div>
      </div>
    </div>
  );
}
