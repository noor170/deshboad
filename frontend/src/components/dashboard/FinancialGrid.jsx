import { FinancialCard } from "../ui";
import { decimal } from "../../constants/utils";
import { SOURCE_CURRENCY } from "../../constants/api";

export default function FinancialGrid({ dashboardSlice, displayPrefs }) {
  return (
    <div className="forecast-financial-grid">
      <FinancialCard
        label="Gross Revenue"
        value={displayPrefs.formatMoney(dashboardSlice?.gross_revenue ?? 0, SOURCE_CURRENCY)}
        helper={`${dashboardSlice?.totals?.orders ?? 0} orders normalized from ${SOURCE_CURRENCY}`}
      />
      <FinancialCard
        label="Net Profit"
        value={displayPrefs.formatMoney(dashboardSlice?.net_profit ?? 0, SOURCE_CURRENCY)}
        helper={`${dashboardSlice?.totals?.units_sold ?? 0} units sold in the selected window`}
      />
      <FinancialCard
        label="Ad Spend"
        value={displayPrefs.formatMoney(dashboardSlice?.ad_spend ?? 0, SOURCE_CURRENCY)}
        helper={`LTV:CAC ${decimal(dashboardSlice?.ltv_cac_ratio ?? 0, 2)}:1`}
      />
    </div>
  );
}
