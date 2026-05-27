import CurrencySelect from "./CurrencySelect";
import TimezoneSelect from "./TimezoneSelect";
import LiveClock from "./LiveClock";
import { CURRENCY_CONFIG } from "../../../constants/currency";
import { TIMEZONE_OPTIONS } from "../../../constants/timezone";

export default function AppToolbar({
  baseCurrency,
  operationalTimezone,
  onCurrencyChange,
  onTimezoneChange,
}) {
  const selectedCurrency = CURRENCY_CONFIG.find((c) => c.code === baseCurrency);
  const selectedTimezone = TIMEZONE_OPTIONS.find((t) => t.value === operationalTimezone);

  return (
    <div className="app-toolbar-shell">
      <div className="app-toolbar">
        <div className="app-toolbar-left">
          <p className="app-toolbar-kicker">Global Operations Console</p>
          <h1>E-Commerce Analytics</h1>
          <p className="app-toolbar-copy">
            All revenue, profit, ad spend, and dates normalize instantly to your selected currency
            and timezone.
          </p>
        </div>

        <div className="app-toolbar-right">
          <div className="app-toolbar-controls">
            <CurrencySelect value={baseCurrency} onChange={onCurrencyChange} />
            <TimezoneSelect value={operationalTimezone} onChange={onTimezoneChange} />
          </div>

          <div className="app-live-bar">
            <div className="app-live-tick">
              <span className="app-live-dot" />
              <span>LIVE</span>
            </div>
            <div className="app-live-info">
              <span className="app-live-currency">
                {selectedCurrency?.flag} {selectedCurrency?.code} ({selectedCurrency?.symbol})
              </span>
              <span className="app-live-tz">🕐 {selectedTimezone?.label}</span>
            </div>
            <LiveClock timezone={operationalTimezone} />
          </div>
        </div>
      </div>
    </div>
  );
}
