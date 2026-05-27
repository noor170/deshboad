import { MetricCard } from "../ui";
import { decimal } from "../../constants/utils";

export default function InventoryMetrics({ forecast }) {
  return (
    <div className="forecast-grid">
      <MetricCard
        label="Current Stock"
        value={`${decimal(forecast.current_stock, 0)} units`}
        helper={`${forecast.category} on-hand inventory`}
      />
      <MetricCard
        label="Daily Burn Velocity"
        value={`${decimal(forecast.daily_burn_velocity)} / day`}
        helper={`Fallback avg ${decimal(forecast.historical_average_velocity)} units/day`}
      />
      <MetricCard
        label="Regression Slope"
        value={`${forecast.daily_sales_velocity_slope >= 0 ? "+" : ""}${decimal(forecast.daily_sales_velocity_slope, 2)}`}
        helper="Positive means demand is accelerating"
      />
    </div>
  );
}
