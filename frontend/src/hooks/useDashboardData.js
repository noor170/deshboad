import { useEffect, useMemo, useState } from "react";
import {
  FORECAST_ENDPOINT,
  DASHBOARD_ENDPOINT,
  PAGE_SIZE,
  FALLBACK_FORECAST,
  FALLBACK_DASHBOARD,
} from "../constants/api";

async function parseJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const bodyPreview = (await response.text()).slice(0, 120);
    throw new Error(`Expected JSON but received ${contentType || "unknown"}: ${bodyPreview}`);
  }
  return response.json();
}

export function useDashboardData(page) {
  const [forecast, setForecast] = useState(null);
  const [dashboardSlice, setDashboardSlice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableError, setTableError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");
      setTableError("");

      try {
        const [forecastResponse, dashboardResponse] = await Promise.all([
          fetch(FORECAST_ENDPOINT, { headers: { Accept: "application/json" } }),
          fetch(`${DASHBOARD_ENDPOINT}?page=${page}&limit=${PAGE_SIZE}`, {
            headers: { Accept: "application/json" },
          }),
        ]);

        if (!forecastResponse.ok) throw new Error(`Forecast HTTP ${forecastResponse.status}`);
        if (!dashboardResponse.ok) throw new Error(`Dashboard HTTP ${dashboardResponse.status}`);

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
          setForecast(FALLBACK_FORECAST);
          setDashboardSlice(FALLBACK_DASHBOARD(page));
          const message =
            requestError instanceof Error ? requestError.message : "Unable to load data.";
          setError(message);
          setTableError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [page]);

  return { forecast, dashboardSlice, loading, error, tableError };
}

export function usePagination(dashboardSlice) {
  return useMemo(
    () => ({
      totalPages: Math.max(1, dashboardSlice?.pagination?.total_pages || 1),
      currentPage: dashboardSlice?.pagination?.page || 1,
      hasNext: dashboardSlice?.pagination?.has_next || false,
      hasPrevious: dashboardSlice?.pagination?.has_previous || false,
    }),
    [dashboardSlice]
  );
}

export function useDepletionProgress(forecast) {
  return useMemo(
    () => (forecast ? Math.max(8, Math.min(100, (forecast.predicted_days_left / 30) * 100)) : 0),
    [forecast]
  );
}
