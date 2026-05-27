import { decimal } from "../../constants/utils";
import { getForecastTone } from "../../constants/utils";
import { ProgressBar } from "../ui";

export default function DepletionBanner({ forecast, depletionProgress }) {
  const tone = getForecastTone(forecast.alert_level);

  return (
    <div className={`forecast-banner forecast-banner-${tone}`}>
      <div>
        <p className="forecast-banner-label">Depletion Prediction</p>
        <h2>{decimal(forecast.predicted_days_left)} days until inventory reaches zero</h2>
        <p>
          This estimate combines historical daily sales with regression-derived burn-rate trend
          logic. Use it to decide whether to accelerate replenishment or reduce demand pressure.
        </p>
      </div>
      <div className="forecast-runway">
        <div className="forecast-runway-header">
          <span>Runway Health</span>
          <strong>{decimal(forecast.predicted_days_left)} days</strong>
        </div>
        <ProgressBar value={depletionProgress} tone={tone} />
      </div>
    </div>
  );
}
