export default function FinancialCard({ label, value, helper }) {
  return (
    <div className="forecast-financial-card">
      <span className="forecast-metric-label">{label}</span>
      <strong className="forecast-financial-value">{value}</strong>
      <span className="forecast-metric-helper">{helper}</span>
    </div>
  );
}
