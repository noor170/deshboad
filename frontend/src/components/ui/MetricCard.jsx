export default function MetricCard({ label, value, helper, className = "" }) {
  return (
    <div className={`forecast-metric-card ${className}`}>
      <span className="forecast-metric-label">{label}</span>
      <strong className="forecast-metric-value">{value}</strong>
      <span className="forecast-metric-helper">{helper}</span>
    </div>
  );
}
