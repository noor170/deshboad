import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/_/backend" : "");
const FORECAST_ENDPOINT = `${API_BASE}/api/v1/forecast/inventory`;

const fallbackForecast = {
  product_id: 101,
  product_name: "AeroNoise Headphones",
  category: "Electronics",
  current_stock: 142,
  daily_burn_velocity: 18.4,
  daily_sales_velocity_slope: 0.72,
  historical_average_velocity: 15.9,
  predicted_days_left: 7.7,
  forecast_strategy: "linear_regression",
  alert_level: "critical",
};

const decimal = (value, digits = 1) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0);

function getForecastTone(level) {
  if (level === "critical") return "critical";
  if (level === "watch") return "watch";
  return "healthy";
}

async function parseJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const bodyPreview = (await response.text()).slice(0, 120);
    throw new Error(`Expected JSON but received ${contentType || "unknown"}: ${bodyPreview}`);
  }
  return response.json();
}

function ForecastSkeleton() {
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

function ForecastMetric({ label, value, helper }) {
  return (
    <div className="forecast-metric-card">
      <span className="forecast-metric-label">{label}</span>
      <strong className="forecast-metric-value">{value}</strong>
      <span className="forecast-metric-helper">{helper}</span>
    </div>
  );
}

export default function Dashboard() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadForecast() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(FORECAST_ENDPOINT, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await parseJson(response);
        if (active) {
          setForecast(payload.data);
        }
      } catch (requestError) {
        if (active) {
          setForecast(fallbackForecast);
          setError(requestError instanceof Error ? requestError.message : "Unable to load forecast.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadForecast();
    return () => {
      active = false;
    };
  }, []);

  const depletionProgress = useMemo(() => {
    if (!forecast) return 0;
    return Math.max(8, Math.min(100, (forecast.predicted_days_left / 30) * 100));
  }, [forecast]);

  if (loading) {
    return <ForecastSkeleton />;
  }

  if (!forecast) {
    return (
      <div className="forecast-page">
        <div className="forecast-card">
          <div className="forecast-banner forecast-banner-critical">
            <strong>Forecast unavailable</strong>
            <span>{error || "No forecasting payload was returned from the backend."}</span>
          </div>
        </div>
      </div>
    );
  }

  const tone = getForecastTone(forecast.alert_level);

  return (
    <div className="forecast-page">
      <div className="forecast-card">
        <div className="forecast-header">
          <div>
            <p className="forecast-kicker">Predictive Inventory Forecast</p>
            <h1>{forecast.product_name}</h1>
            <p className="forecast-copy">
              Real-time inventory depletion estimate powered by historical order data and a
              scikit-learn linear regression slope.
            </p>
          </div>
          <div className={`forecast-strategy forecast-${tone}`}>
            {forecast.forecast_strategy.replaceAll("_", " ")}
          </div>
        </div>

        <div className="forecast-grid">
          <ForecastMetric
            label="Current Stock"
            value={`${decimal(forecast.current_stock, 0)} units`}
            helper={`${forecast.category} on-hand inventory`}
          />
          <ForecastMetric
            label="Daily Burn Velocity"
            value={`${decimal(forecast.daily_burn_velocity)} / day`}
            helper={`Fallback avg ${decimal(forecast.historical_average_velocity)} units/day`}
          />
          <ForecastMetric
            label="Regression Slope"
            value={`${forecast.daily_sales_velocity_slope >= 0 ? "+" : ""}${decimal(forecast.daily_sales_velocity_slope, 2)}`}
            helper="Positive means demand is accelerating"
          />
        </div>

        <div className={`forecast-banner forecast-banner-${tone}`}>
          <div>
            <p className="forecast-banner-label">Depletion Prediction</p>
            <h2>{decimal(forecast.predicted_days_left)} days until inventory reaches zero</h2>
            <p>
              This estimate combines historical daily sales with regression-derived burn-rate trend
              logic. Use it to decide whether to accelerate replenishment or reduce demand pressure.
            </p>
          </div>

          <div className="forecast-runway">
            <div className="forecast-runway-header">
              <span>Runway Health</span>
              <strong>{decimal(forecast.predicted_days_left)} days</strong>
            </div>
            <div className="forecast-progress-track">
              <div className={`forecast-progress-bar forecast-progress-${tone}`} style={{ width: `${depletionProgress}%` }} />
            </div>
          </div>
        </div>

        {error ? (
          <div className="forecast-error">
            Using fallback forecast data because the live request failed: {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
