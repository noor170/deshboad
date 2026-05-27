export default function ProgressBar({ value, tone, className = "" }) {
  return (
    <div className={`forecast-progress-track ${className}`}>
      <div
        className={`forecast-progress-bar forecast-progress-${tone}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
