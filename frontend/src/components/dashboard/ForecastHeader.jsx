import { getForecastTone } from "../../constants/utils";

export default function ForecastHeader({ forecast, normalizedDateRange, displayPrefs }) {
  const tone = getForecastTone(forecast.alert_level);

  return (
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
  );
}
