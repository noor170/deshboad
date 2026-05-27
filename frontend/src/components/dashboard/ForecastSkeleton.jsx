export default function ForecastSkeleton() {
  return (
    <div className="forecast-page">
      <div className="forecast-card">
        <div className="forecast-skeleton">
          <div className="forecast-skeleton-line short" />
          <div className="forecast-skeleton-line medium" />
          <div className="forecast-skeleton-line long" />
        </div>
        <div className="forecast-grid">
          {[0, 1, 2].map((item) => (
            <div key={item} className="forecast-metric-card skeleton-card">
              <div className="forecast-skeleton-line short" />
              <div className="forecast-skeleton-block" />
              <div className="forecast-skeleton-line medium" />
            </div>
          ))}
        </div>
        <div className="forecast-skeleton-banner" />
      </div>
    </div>
  );
}
