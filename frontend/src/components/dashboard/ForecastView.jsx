import { useState } from "react";
import SalesChart from "./SalesChart";
import ReturnRates from "./ReturnRates";
import SupplierBuffers from "./SupplierBuffers";
import { SalesForecastPanel, ReturnForecastPanel, SafetyStockPanel } from "./ForecastPanel";

const FORECAST_SECTIONS = [
  { id: "sales-forecast", label: "Sales Forecast" },
  { id: "reverse-logistics-forecast", label: "Reverse Logistics Forecast" },
  { id: "supplier-drift-buffers", label: "Supplier Drift Buffers" },
  { id: "sales-volume-forecast", label: "Sales Volume Forecast" },
  { id: "return-load-forecast", label: "Return Load Forecast" },
  { id: "lead-time-drift-analysis", label: "Lead-Time Drift Analysis" },
];

export default function ForecastView({
  timeSeries,
  projectedRevenue,
  categories,
  totalReturned,
  estimated30d,
  supplierBuffers,
  salesForecast,
  returnForecast,
  safetyStock,
  loading,
}) {
  const [activeSection, setActiveSection] = useState(FORECAST_SECTIONS[0].id);

  return (
    <div className="forecast-page forecast-page-ai">
      <div className="forecast-card forecast-card-ai-header">
        <div className="ai-header-content">
          <div className="ai-header-badge">
            <span className="ai-header-dot" />
            AI ENGINE ACTIVE
          </div>
          <h1>Predictive Analytics &amp; Forecasting</h1>
          <p className="ai-header-subtitle">
            Machine learning models analyzing sales velocity, return patterns, and supplier lead-time drift
            to generate actionable forecasts.
          </p>
        </div>
      </div>

      <div className="forecast-card">
        <nav className="forecast-section-navbar" aria-label="Forecast sections">
          {FORECAST_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`forecast-section-tab ${activeSection === section.id ? "forecast-section-tab-active" : ""}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {activeSection === "sales-forecast" && (
          <SalesChart
            timeSeries={timeSeries}
            projectedRevenue={projectedRevenue}
          />
        )}

        {activeSection === "reverse-logistics-forecast" && (
          <ReturnRates
            categories={categories}
            totalReturned={totalReturned}
            estimated30d={estimated30d}
          />
        )}

        {activeSection === "supplier-drift-buffers" && (
          <SupplierBuffers buffers={supplierBuffers} />
        )}

        {activeSection === "sales-volume-forecast" && (
          <SalesForecastPanel data={salesForecast} loading={loading} />
        )}

        {activeSection === "return-load-forecast" && (
          <ReturnForecastPanel data={returnForecast} loading={loading} />
        )}

        {activeSection === "lead-time-drift-analysis" && (
          <SafetyStockPanel data={safetyStock} loading={loading} />
        )}
      </div>
    </div>
  );
}
