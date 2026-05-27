import { useEffect, useMemo, useState } from "react";
import Dashboard from "./Dashboard";
import "./index.css";

const CURRENCY_CONFIG = [
  { code: "USD", label: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", label: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", label: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", label: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "KRW", label: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
];

const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CNY: 7.24,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  KRW: 1320,
  BRL: 4.97,
  SGD: 1.34,
};

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC", region: "Global" },
  { value: "America/New_York", label: "New York", region: "Americas" },
  { value: "America/Chicago", label: "Chicago", region: "Americas" },
  { value: "America/Denver", label: "Denver", region: "Americas" },
  { value: "America/Los_Angeles", label: "Los Angeles", region: "Americas" },
  { value: "America/Sao_Paulo", label: "São Paulo", region: "Americas" },
  { value: "Europe/London", label: "London", region: "Europe" },
  { value: "Europe/Berlin", label: "Berlin", region: "Europe" },
  { value: "Europe/Paris", label: "Paris", region: "Europe" },
  { value: "Europe/Zurich", label: "Zurich", region: "Europe" },
  { value: "Asia/Dubai", label: "Dubai", region: "Middle East" },
  { value: "Asia/Kolkata", label: "Mumbai", region: "Asia" },
  { value: "Asia/Shanghai", label: "Shanghai", region: "Asia" },
  { value: "Asia/Tokyo", label: "Tokyo", region: "Asia" },
  { value: "Asia/Seoul", label: "Seoul", region: "Asia" },
  { value: "Asia/Singapore", label: "Singapore", region: "Asia" },
  { value: "Australia/Sydney", label: "Sydney", region: "Oceania" },
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const selectedCurrencyConfig = CURRENCY_CONFIG.find((c) => c.code === baseCurrency);
  const selectedTimezoneConfig = TIMEZONE_OPTIONS.find((t) => t.value === operationalTimezone);

  const liveTimeFormatted = new Intl.DateTimeFormat("en-US", {
    timeZone: operationalTimezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(currentTime);

  const groupedTimezones = TIMEZONE_OPTIONS.reduce((acc, tz) => {
    if (!acc[tz.region]) acc[tz.region] = [];
    acc[tz.region].push(tz);
    return acc;
  }, {});

  return (
    <div className="app">
      <div className="app-toolbar-shell">
        <div className="app-toolbar">
          <div className="app-toolbar-left">
            <p className="app-toolbar-kicker">Global Operations Console</p>
            <h1>E-Commerce Analytics</h1>
            <p className="app-toolbar-copy">
              All revenue, profit, ad spend, and dates normalize instantly to your selected currency and timezone.
            </p>
          </div>

          <div className="app-toolbar-right">
            <div className="app-toolbar-controls">
              <label className="app-control">
                <span>Currency</span>
                <select
                  className="app-control-select"
                  value={baseCurrency}
                  onChange={(event) => setBaseCurrency(event.target.value)}
                >
                  {CURRENCY_CONFIG.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} — {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="app-control">
                <span>Timezone</span>
                <select
                  className="app-control-select"
                  value={operationalTimezone}
                  onChange={(event) => setOperationalTimezone(event.target.value)}
                >
                  {Object.entries(groupedTimezones).map(([region, zones]) => (
                    <optgroup key={region} label={region}>
                      {zones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            </div>

            <div className="app-live-bar">
              <div className="app-live-tick">
                <span className="app-live-dot" />
                <span>LIVE</span>
              </div>
              <div className="app-live-info">
                <span className="app-live-currency">
                  {selectedCurrencyConfig?.flag} {selectedCurrencyConfig?.code} ({selectedCurrencyConfig?.symbol})
                </span>
                <span className="app-live-tz">
                  🕐 {selectedTimezoneConfig?.label}
                </span>
              </div>
              <div className="app-live-clock">{liveTimeFormatted}</div>
            </div>
          </div>
        </div>
      </div>

      <Dashboard displayPrefs={displayPrefs} />
    </div>
  );
}
