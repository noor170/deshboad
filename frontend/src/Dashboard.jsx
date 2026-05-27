import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/_/backend" : "");
const FORECAST_ENDPOINT = `${API_BASE}/api/v1/forecast/inventory`;
const DASHBOARD_ENDPOINT = `${API_BASE}/api/v1/operations/dashboard`;
const PAGE_SIZE = 5;
const SOURCE_CURRENCY = "USD";

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

function FinancialMetric({ label, value, helper }) {
  return (
    <div className="forecast-financial-card">
      <span className="forecast-metric-label">{label}</span>
      <strong className="forecast-financial-value">{value}</strong>
      <span className="forecast-metric-helper">{helper}</span>
    </div>
  );
}

export default function Dashboard({ displayPrefs }) {
  const [forecast, setForecast] = useState(null);
  const [dashboardSlice, setDashboardSlice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableError, setTableError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");
      setTableError("");

      try {
        const offset = (page - 1) * PAGE_SIZE;
        const [forecastResponse, dashboardResponse] = await Promise.all([
          fetch(FORECAST_ENDPOINT, {
            headers: { Accept: "application/json" },
          }),
          fetch(`${DASHBOARD_ENDPOINT}?limit=${PAGE_SIZE}&offset=${offset}`, {
            headers: { Accept: "application/json" },
          }),
        ]);

        if (!forecastResponse.ok) {
          throw new Error(`Forecast HTTP ${forecastResponse.status}`);
        }
        if (!dashboardResponse.ok) {
          throw new Error(`Dashboard HTTP ${dashboardResponse.status}`);
        }

        const [forecastPayload, dashboardPayload] = await Promise.all([
          parseJson(forecastResponse),
          parseJson(dashboardResponse),
        ]);

        if (active) {
          setForecast(forecastPayload.data);
          setDashboardSlice(dashboardPayload.data);
        }
      } catch (requestError) {
        if (active) {
          setForecast(fallbackForecast);
          setDashboardSlice({
            low_stock_products: [],
            pagination: {
              limit: PAGE_SIZE,
              offset: (page - 1) * PAGE_SIZE,
              low_stock_total: 0,
            },
          });
          const message = requestError instanceof Error ? requestError.message : "Unable to load data.";
          setError(message);
          setTableError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [page]);

  const depletionProgress = useMemo(() => {
    if (!forecast) return 0;
    return Math.max(8, Math.min(100, (forecast.predicted_days_left / 30) * 100));
  }, [forecast]);

  const totalPages = useMemo(() => {
    const total = dashboardSlice?.pagination?.low_stock_total || 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [dashboardSlice]);

  const normalizedDateRange = useMemo(() => {
    if (!dashboardSlice?.date_range?.start_date || !dashboardSlice?.date_range?.end_date) {
      return "Date range unavailable";
    }

    return `${displayPrefs.formatDate(dashboardSlice.date_range.start_date)} to ${displayPrefs.formatDate(
      dashboardSlice.date_range.end_date
    )}`;
  }, [dashboardSlice, displayPrefs]);

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
            <div className="forecast-normalization-meta">
              <span>{normalizedDateRange}</span>
              <span>Reporting in {displayPrefs.baseCurrency}</span>
              <span>Timezone {displayPrefs.operationalTimezone}</span>
            </div>
          </div>
          <div className={`forecast-strategy forecast-${tone}`}>
            {forecast.forecast_strategy.replaceAll("_", " ")}
          </div>
        </div>

        <div className="forecast-financial-grid">
          <FinancialMetric
            label="Gross Revenue"
            value={displayPrefs.formatMoney(dashboardSlice?.gross_revenue ?? 0, SOURCE_CURRENCY)}
            helper={`${dashboardSlice?.totals?.orders ?? 0} orders normalized from ${SOURCE_CURRENCY}`}
          />
          <FinancialMetric
            label="Net Profit"
            value={displayPrefs.formatMoney(dashboardSlice?.net_profit ?? 0, SOURCE_CURRENCY)}
            helper={`${dashboardSlice?.totals?.units_sold ?? 0} units sold in the selected window`}
          />
          <FinancialMetric
            label="Ad Spend"
            value={displayPrefs.formatMoney(dashboardSlice?.ad_spend ?? 0, SOURCE_CURRENCY)}
            helper={`LTV:CAC ${decimal(dashboardSlice?.ltv_cac_ratio ?? 0, 2)}:1`}
          />
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

        <div className="forecast-table-panel">
          <div className="forecast-table-header">
            <div>
              <p className="forecast-kicker">Low-Stock Queue</p>
              <h2>Server-side paginated inventory alerts</h2>
            </div>
            <div className="forecast-pagination-meta">
              Page {page} of {totalPages}
            </div>
          </div>

          <div className="forecast-table-wrap">
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Velocity</th>
                  <th>Days Left</th>
                </tr>
              </thead>
              <tbody>
                {dashboardSlice?.low_stock_products?.length ? (
                  dashboardSlice.low_stock_products.map((item) => (
                    <tr key={item.product_id}>
                      <td>{item.product_name}</td>
                      <td>{item.category}</td>
                      <td>{decimal(item.sales_velocity_30d)} / day</td>
                      <td>{decimal(item.days_of_inventory_left)} days</td>
                    </tr>
                  ))
                ) : (
                    <tr>
                    <td colSpan="4" className="forecast-table-empty">
                      {tableError || "No low-stock products returned for this page."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="forecast-pagination">
            <button
              type="button"
              className="forecast-page-button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="forecast-page-button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
