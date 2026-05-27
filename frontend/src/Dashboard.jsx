import { useMemo, useState } from "react";
import {
  ForecastSkeleton,
  ForecastHeader,
  FinancialGrid,
  InventoryMetrics,
  DepletionBanner,
  LowStockTable,
} from "./components/dashboard";
import { ErrorBanner } from "./components/ui";
import { useDashboardData, usePagination, useDepletionProgress } from "./hooks";
import { SOURCE_CURRENCY } from "./constants/api";

export default function Dashboard({ displayPrefs }) {
  const [page, setPage] = useState(1);
  const { forecast, dashboardSlice, loading, error, tableError } = useDashboardData(page);
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

  if (loading) return <ForecastSkeleton />;

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

  return (
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

        {error ? (
          <ErrorBanner>
            Using fallback forecast data because the live request failed: {error}
          </ErrorBanner>
        ) : null}

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
  );
}
