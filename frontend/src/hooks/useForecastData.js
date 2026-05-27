import { useEffect, useState } from "react";
import {
  SALES_FORECAST_ENDPOINT,
  RETURN_FORECAST_ENDPOINT,
  SAFETY_STOCK_ENDPOINT,
  FALLBACK_SALES_FORECAST,
  FALLBACK_RETURN_FORECAST,
  FALLBACK_SAFETY_STOCK,
} from "../constants/api";

export function useForecastData(enabled) {
  const [salesForecast, setSalesForecast] = useState(null);
  const [returnForecast, setReturnForecast] = useState(null);
  const [safetyStock, setSafetyStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setSalesForecast(null);
      setReturnForecast(null);
      setSafetyStock(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    async function loadForecasts() {
      try {
        const [salesRes, returnsRes, safetyRes] = await Promise.all([
          fetch(SALES_FORECAST_ENDPOINT, { headers: { Accept: "application/json" } }),
          fetch(RETURN_FORECAST_ENDPOINT, { headers: { Accept: "application/json" } }),
          fetch(SAFETY_STOCK_ENDPOINT, { headers: { Accept: "application/json" } }),
        ]);

        if (active) {
          if (salesRes.ok) {
            const payload = await salesRes.json();
            setSalesForecast(payload.data || FALLBACK_SALES_FORECAST);
          } else {
            setSalesForecast(FALLBACK_SALES_FORECAST);
          }

          if (returnsRes.ok) {
            const payload = await returnsRes.json();
            setReturnForecast(payload.data || FALLBACK_RETURN_FORECAST);
          } else {
            setReturnForecast(FALLBACK_RETURN_FORECAST);
          }

          if (safetyRes.ok) {
            const payload = await safetyRes.json();
            setSafetyStock(payload.data || FALLBACK_SAFETY_STOCK);
          } else {
            setSafetyStock(FALLBACK_SAFETY_STOCK);
          }
        }
      } catch (err) {
        if (active) {
          setSalesForecast(FALLBACK_SALES_FORECAST);
          setReturnForecast(FALLBACK_RETURN_FORECAST);
          setSafetyStock(FALLBACK_SAFETY_STOCK);
          setError(err instanceof Error ? err.message : "Forecast data unavailable");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadForecasts();
    return () => {
      active = false;
    };
  }, [enabled]);

  return { salesForecast, returnForecast, safetyStock, loading, error };
}
