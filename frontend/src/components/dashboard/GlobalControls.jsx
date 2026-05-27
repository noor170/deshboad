import { useMemo } from "react";
import { CURRENCY_CONFIG } from "../../constants/currency";
import { TIMEZONE_OPTIONS, groupTimezonesByRegion } from "../../constants/timezone";
import { useLiveClock } from "../../hooks";

export default function GlobalControls({
  baseCurrency,
  operationalTimezone,
  onCurrencyChange,
  onTimezoneChange,
}) {
  const selectedCurrency = CURRENCY_CONFIG.find((c) => c.code === baseCurrency);
  const selectedTimezone = TIMEZONE_OPTIONS.find((t) => t.value === operationalTimezone);
  const { formatted: liveTime } = useLiveClock(operationalTimezone);
  const groupedTimezones = useMemo(() => groupTimezonesByRegion(TIMEZONE_OPTIONS), []);

  return (
    <footer className="global-footer">
      <div className="global-footer-container">
        <div className="global-footer-status">
          <span className="global-footer-live-badge">
            <span className="global-footer-live-dot" />
            LIVE
          </span>
          <span className="global-footer-currency-pill">
            {selectedCurrency?.flag} {selectedCurrency?.code} ({selectedCurrency?.symbol})
          </span>
          <span className="global-footer-tz-pill">
            🕐 {selectedTimezone?.label} · {liveTime}
          </span>
        </div>

        <div className="global-footer-controls">
          <div className="global-footer-field">
            <label htmlFor="global-currency-select">Currency</label>
            <select
              id="global-currency-select"
              className="global-footer-select"
              value={baseCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
            >
              {CURRENCY_CONFIG.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="global-footer-field">
            <label htmlFor="global-timezone-select">Timezone</label>
            <select
              id="global-timezone-select"
              className="global-footer-select"
              value={operationalTimezone}
              onChange={(e) => onTimezoneChange(e.target.value)}
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
          </div>
        </div>
      </div>
    </footer>
  );
}
