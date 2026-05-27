import { useEffect, useMemo, useState } from "react";

const MOCK_FORECAST_ENDPOINT = "/api/v1/forecast/mock";

/**
 * Expected API payload shape from FastAPI.
 * {
 *   product_name: string,
 *   current_stock: number,
 *   daily_burn_velocity: number,
 *   daily_sales_velocity_slope: number,
 *   predicted_days_left: number,
 *   forecast_strategy: string,
 *   historical_average_velocity: number,
 *   alert_level: "healthy" | "watch" | "critical"
 * }
 */
const MOCK_FORECAST_RESPONSE = {
  product_name: "AeroNoise Headphones",
  current_stock: 142,
  daily_burn_velocity: 18.4,
  daily_sales_velocity_slope: 0.72,
  predicted_days_left: 7.7,
  forecast_strategy: "linear_regression",
  historical_average_velocity: 15.9,
  alert_level: "critical",
};

const currencyless = (value, digits = 1) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0);

function getAlertTheme(level) {
  switch (level) {
    case "critical":
      return {
        banner: "border-rose-500/30 bg-rose-500/10 text-rose-100",
        badge: "bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/30",
        progress: "bg-rose-400",
      };
    case "watch":
      return {
        banner: "border-amber-500/30 bg-amber-500/10 text-amber-100",
        badge: "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-400/30",
        progress: "bg-amber-400",
      };
    default:
      return {
        banner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
        badge: "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/30",
        progress: "bg-emerald-400",
      };
  }
}

async function mockForecastRequest() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    ok: true,
    json: async () => MOCK_FORECAST_RESPONSE,
  };
}

async function fetchForecastCard() {
  try {
    const response = await fetch(MOCK_FORECAST_ENDPOINT, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (_error) {
    const fallbackResponse = await mockForecastRequest();
    return fallbackResponse.json();
  }
}

function ForecastSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur xl:p-8">
          <div className="animate-pulse space-y-6">
            <div className="space-y-3">
              <div className="h-3 w-32 rounded-full bg-zinc-800" />
              <div className="h-8 w-72 rounded-xl bg-zinc-800" />
              <div className="h-4 w-96 max-w-full rounded-full bg-zinc-800" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                  <div className="h-3 w-24 rounded-full bg-zinc-800" />
                  <div className="mt-4 h-8 w-28 rounded-xl bg-zinc-800" />
                  <div className="mt-3 h-4 w-40 rounded-full bg-zinc-800" />
                </div>
              ))}
            </div>
            <div className="h-24 rounded-2xl bg-zinc-800/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
      <p className="text-sm font-medium text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{helper}</p>
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
        const payload = await fetchForecastCard();
        if (active) {
          setForecast(payload);
        }
      } catch (requestError) {
        if (active) {
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

  const runwayProgress = useMemo(() => {
    if (!forecast) return 0;
    return Math.max(6, Math.min(100, (forecast.predicted_days_left / 30) * 100));
  }, [forecast]);

  if (loading) {
    return <ForecastSkeleton />;
  }

  if (!forecast) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-rose-500/20 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
          <p className="text-lg font-semibold text-rose-200">Forecast unavailable</p>
          <p className="mt-2 text-sm text-zinc-400">{error || "The mock forecasting endpoint did not return data."}</p>
        </div>
      </div>
    );
  }

  const theme = getAlertTheme(forecast.alert_level);

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_right,_rgba(168,85,247,0.12),_transparent_25%)] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur xl:p-8">
          <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Predictive Inventory Forecast
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                {forecast.product_name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                This card combines historical sales velocity with a scikit-learn regression slope to
                estimate exactly when inventory will reach zero.
              </p>
            </div>

            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${theme.badge}`}>
              {forecast.forecast_strategy.replaceAll("_", " ")}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <MetricCard
              label="Current Stock"
              value={`${currencyless(forecast.current_stock, 0)} units`}
              helper="Live on-hand inventory available for sale."
            />
            <MetricCard
              label="Daily Burn Velocity"
              value={`${currencyless(forecast.daily_burn_velocity)} / day`}
              helper={`Fallback average ${currencyless(forecast.historical_average_velocity)} units/day`}
            />
            <MetricCard
              label="Velocity Slope"
              value={`${forecast.daily_sales_velocity_slope >= 0 ? "+" : ""}${currencyless(forecast.daily_sales_velocity_slope, 2)}`}
              helper="Positive slope means demand is accelerating over time."
            />
          </div>

          <div className={`mt-6 rounded-2xl border p-5 ${theme.banner}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] opacity-80">
                  Depletion Warning
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  Inventory will run out in {currencyless(forecast.predicted_days_left)} days.
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 opacity-80">
                  Keep campaigns and replenishment plans aligned. If this runway is too short, slow
                  paid demand or place a replenishment order immediately.
                </p>
              </div>

              <div className="min-w-[220px] rounded-2xl bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm text-zinc-100/80">
                  <span>Runway health</span>
                  <span>{currencyless(forecast.predicted_days_left)} days</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-950/60">
                  <div className={`h-full rounded-full ${theme.progress}`} style={{ width: `${runwayProgress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Mock endpoint fallback was used because the network request failed: {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
