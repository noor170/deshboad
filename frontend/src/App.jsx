import { useMemo, useState } from "react";
import Dashboard from "./Dashboard";
import "./index.css";

const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York" },
  { value: "Europe/London", label: "London" },
];

function normalizeDateInput(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return new Date(`${value}T00:00:00Z`);
  }
  return new Date(value);
}

export default function App() {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [operationalTimezone, setOperationalTimezone] = useState("UTC");

  const displayPrefs = useMemo(() => {
    const convertMoney = (value, sourceCurrency = "USD") => {
      const numericValue = Number(value || 0);
      const sourceRate = CURRENCY_RATES[sourceCurrency] || 1;
      const targetRate = CURRENCY_RATES[baseCurrency] || 1;
      return (numericValue / sourceRate) * targetRate;
    };

    const formatMoney = (value, sourceCurrency = "USD", digits = 0) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: baseCurrency,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(convertMoney(value, sourceCurrency));

    const formatDate = (value, options = {}) => {
      const normalizedValue = normalizeDateInput(value);
      if (!normalizedValue || Number.isNaN(normalizedValue.getTime())) {
        return "Unavailable";
      }

      return new Intl.DateTimeFormat("en-US", {
        timeZone: operationalTimezone,
        month: "short",
        day: "numeric",
        year: "numeric",
        ...options,
      }).format(normalizedValue);
    };

    return {
      baseCurrency,
      operationalTimezone,
      convertMoney,
      formatMoney,
      formatDate,
    };
  }, [baseCurrency, operationalTimezone]);

  return (
    <div className="app">
      <div className="app-toolbar-shell">
        <div className="app-toolbar">
          <div>
            <p className="app-toolbar-kicker">Global Operations Console</p>
            <h1>Normalized finance and timezone controls</h1>
            <p className="app-toolbar-copy">
              All revenue, profit, ad spend, and operational dates are rendered against one base
              currency and one reporting timezone.
            </p>
          </div>

          <div className="app-toolbar-controls">
            <label className="app-control">
              <span>Base Currency</span>
              <select value={baseCurrency} onChange={(event) => setBaseCurrency(event.target.value)}>
                {Object.keys(CURRENCY_RATES).map((currencyCode) => (
                  <option key={currencyCode} value={currencyCode}>
                    {currencyCode}
                  </option>
                ))}
              </select>
            </label>

            <label className="app-control">
              <span>Operational Timezone</span>
              <select
                value={operationalTimezone}
                onChange={(event) => setOperationalTimezone(event.target.value)}
              >
                {TIMEZONE_OPTIONS.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <Dashboard displayPrefs={displayPrefs} />
    </div>
  );
}
