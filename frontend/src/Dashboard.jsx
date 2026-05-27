import { useMemo, useState } from "react";
import {
  HomeWorkspace,
  GlobalControls,
  ForecastSkeleton,
  ForecastHeader,
  ForecastView,
  FinancialGrid,
  InventoryMetrics,
  DepletionBanner,
  LowStockTable,
} from "./components/dashboard";
import { ErrorBanner } from "./components/ui";
import { useDashboardData, usePagination, useDepletionProgress, useDisplayPrefs, useForecastData } from "./hooks";

const VIEW_TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "operations", label: "Operations Dashboard", icon: "📊" },
  { id: "forecast", label: "AI Forecasting", icon: "🤖" },
];

export default function Dashboard() {
  const [theme, setTheme] = useState("dark");
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [operationalTimezone, setOperationalTimezone] = useState("UTC");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("home");

  const displayPrefs = useDisplayPrefs(baseCurrency, operationalTimezone);
  const { forecast, dashboardSlice, loading, error, tableError } = useDashboardData(page);
  const { salesForecast, returnForecast, safetyStock, loading: forecastLoading } = useForecastData(view === "forecast");
  const pagination = usePagination(dashboardSlice);
  const depletionProgress = useDepletionProgress(forecast);

  const normalizedDateRange = useMemo(() => {
    if (!dashboardSlice?.date_range?.start_date || !dashboardSlice?.date_range?.end_date) {
      return "Date range unavailable";
    }
    return `${displayPrefs.formatDate(dashboardSlice.date_range.start_date)} to ${displayPrefs.formatDate(
      dashboardSlice.date_range.end_date
    )}`;
  }, [dashboardSlice, displayPrefs]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /* ---------- loading state ---------- */
  if (loading) return <ForecastSkeleton />;

  /* ---------- error state ---------- */
  if (!forecast) {
    return (
      <div data-theme={theme}>
        <DashboardHeader theme={theme} view={view} onViewChange={setView} />
        <div className="forecast-page">
          <div className="forecast-card">
            <div className="forecast-banner forecast-banner-critical">
              <strong>Forecast unavailable</strong>
              <span>{error || "No forecasting payload was returned from the backend."}</span>
            </div>
          </div>
        </div>
        <GlobalControls
          baseCurrency={baseCurrency}
          operationalTimezone={operationalTimezone}
          onCurrencyChange={setBaseCurrency}
          onTimezoneChange={setOperationalTimezone}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />
      </div>
    );
  }

  const salesFc = dashboardSlice?.sales_forecast || {};
  const reverseLogistics = dashboardSlice?.reverse_logistics_forecast || {};
  const supplierBuffers = dashboardSlice?.supplier_drift_buffers || [];
  const timeSeries = dashboardSlice?.time_series || salesFc?.time_series || {};

  return (
    <div data-theme={theme}>
      <DashboardHeader theme={theme} view={view} onViewChange={setView} />

      {view === "home" && (
        <HomeWorkspace dashboardSlice={dashboardSlice} forecast={forecast} />
      )}

      {/* ==================== OPERATIONS VIEW ==================== */}
      {view === "operations" && (
        <div className="forecast-page">
          <div className="forecast-card">
            <ForecastHeader
              forecast={forecast}
              normalizedDateRange={normalizedDateRange}
              displayPrefs={displayPrefs}
            />
            <FinancialGrid dashboardSlice={dashboardSlice} displayPrefs={displayPrefs} />
            <InventoryMetrics forecast={forecast} />
            <DepletionBanner forecast={forecast} depletionProgress={depletionProgress} />
            {error && (
              <ErrorBanner>
                Using fallback forecast data because the live request failed: {error}
              </ErrorBanner>
            )}
            <LowStockTable
              products={dashboardSlice?.low_stock_products}
              pagination={dashboardSlice?.pagination}
              currentPage={page}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              onPageChange={setPage}
              tableError={tableError}
            />
          </div>

        </div>
      )}

      {/* ==================== AI FORECAST VIEW ==================== */}
      {view === "forecast" && (
        <ForecastView
          timeSeries={timeSeries}
          projectedRevenue={salesFc?.projected_revenue}
          categories={reverseLogistics?.category_return_rates || dashboardSlice?.category_return_rates}
          totalReturned={reverseLogistics?.total_returned_orders}
          estimated30d={reverseLogistics?.estimated_return_volume_30d}
          supplierBuffers={supplierBuffers}
          salesForecast={salesForecast}
          returnForecast={returnForecast}
          safetyStock={safetyStock}
          loading={forecastLoading}
        />
      )}

      <GlobalControls
        baseCurrency={baseCurrency}
        operationalTimezone={operationalTimezone}
        onCurrencyChange={setBaseCurrency}
        onTimezoneChange={setOperationalTimezone}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
    </div>
  );
}

/* ===================== INLINE HEADER COMPONENT ===================== */

function DashboardHeader({ theme, view, onViewChange }) {
  return (
    <header className="dashboard-top-header">
      <div className="dashboard-top-header-inner">
        <div className="dashboard-top-brand">
          <span className="dashboard-top-logo">⚡</span>
          <span className="dashboard-top-title">RetailOps</span>
        </div>

        <nav className="dashboard-top-tabs">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dashboard-top-tab ${view === tab.id ? "dashboard-top-tab-active" : ""}`}
              onClick={() => onViewChange(tab.id)}
            >
              <span className="dashboard-top-tab-icon">{tab.icon}</span>
              <span className="dashboard-top-tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="dashboard-top-meta">
          <span className={`dashboard-top-status ${theme === "dark" ? "dashboard-status-dark" : "dashboard-status-light"}`}>
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </span>
        </div>
      </div>
    </header>
  );
}
