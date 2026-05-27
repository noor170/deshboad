import { useMemo, useState } from "react";
import { decimal } from "../../constants/utils";

function formatDateForInput(dateValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function formatDateSlash(dateValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
}

export default function HomeWorkspace({ dashboardSlice, forecast }) {
  const [adSpendShift, setAdSpendShift] = useState(0);
  const [cogsShift, setCogsShift] = useState(0);
  const [priceShift, setPriceShift] = useState(0);

  const lowStockProducts = useMemo(
    () => dashboardSlice?.low_stock_products || [],
    [dashboardSlice?.low_stock_products]
  );
  const inventoryRows = useMemo(
    () => dashboardSlice?.inventory_overview || lowStockProducts,
    [dashboardSlice?.inventory_overview, lowStockProducts]
  );
  const categories = useMemo(
    () => dashboardSlice?.category_return_rates || [],
    [dashboardSlice?.category_return_rates]
  );
  const apparelRate = categories.find((c) => c.category === "Apparel")?.return_rate_pct || 0;
  const baseRunway = forecast?.predicted_days_left || 0;
  const scenarioRunway = Math.max(0, baseRunway + (priceShift * 0.5 - cogsShift * 0.25 - adSpendShift * 0.15));
  const runwayDelta = scenarioRunway - baseRunway;

  const startDate = formatDateForInput(dashboardSlice?.date_range?.start_date);
  const endDate = formatDateForInput(dashboardSlice?.date_range?.end_date);
  const coverageWindow = `${dashboardSlice?.date_range?.start_date || "-"} to ${dashboardSlice?.date_range?.end_date || "-"}`;

  const warningCount = dashboardSlice?.warning_count || lowStockProducts.length;
  const ltvCac = decimal(dashboardSlice?.ltv_cac_ratio || 0, 2);
  const grossRevenue = Number(dashboardSlice?.gross_revenue || 0).toLocaleString();
  const recognizedRevenue = Number(dashboardSlice?.recognized_revenue || 0).toLocaleString();
  const adSpend = Number(dashboardSlice?.ad_spend || 0).toLocaleString();
  const orders = Number(dashboardSlice?.totals?.orders || 0).toLocaleString();
  const unitsSold = Number(dashboardSlice?.totals?.units_sold || 0).toLocaleString();
  const returnedOrders = Number(dashboardSlice?.totals?.returned_orders || 0).toLocaleString();

  const flaggedPreview = useMemo(() => lowStockProducts.slice(0, 5), [lowStockProducts]);

  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">RO</div>
          <div>
            <h1>Retail Ops</h1>
            <p>Unified commerce workspace</p>
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="sidebar-label">Workspace Summary</div>
          <div className="sidebar-stat-list">
            <div className="sidebar-stat">
              <span>View Mode</span>
              <strong>Gross Revenue</strong>
            </div>
            <div className="sidebar-stat">
              <span>Coverage Window</span>
              <strong>{coverageWindow}</strong>
            </div>
            <div className="sidebar-stat">
              <span>Average Runway</span>
              <strong>{decimal(baseRunway)} days</strong>
            </div>
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="sidebar-label">Live Signals</div>
          <div className="sidebar-signal-list">
            <div className="sidebar-signal">
              <span>At-Risk SKUs</span>
              <strong>{warningCount}</strong>
            </div>
            <div className="sidebar-signal">
              <span>LTV:CAC</span>
              <strong>{ltvCac}:1</strong>
            </div>
            <div className="sidebar-signal">
              <span>Ad Spend</span>
              <strong>${adSpend}</strong>
            </div>
          </div>
        </div>

        <div className="sidebar-panel sidebar-note-panel">
          <div className="sidebar-label">Operator Focus</div>
          <p>
            Use the operating snapshot panel. Adjust the date range, simulate margin shifts, and draft
            replenishment from the main workspace.
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Store performance</p>
            <h2>E-Commerce &amp; Retail Operations Dashboard</h2>
            <p className="header-copy">
              Balance ad efficiency against inventory velocity and margin pressure in one view.
            </p>
          </div>
          <div className="status-pill healthy">LTV:CAC {ltvCac}:1</div>
        </header>

        <div className="operating-kpi-grid">
          <div className="kpi-card kpi-primary">
            <div className="kpi-title-row">
              <span className="kpi-title">Gross Revenue</span>
            </div>
            <div className="kpi-value">${grossRevenue}</div>
            <div className="kpi-subtitle">{orders} orders in selected range</div>
          </div>
          <div className="kpi-card kpi-warning">
            <div className="kpi-title-row">
              <span className="kpi-title">Operational Warnings</span>
            </div>
            <div className="kpi-value">{warningCount}</div>
            <div className="kpi-subtitle">Products under 15 days of inventory</div>
          </div>
          <div className="kpi-card kpi-positive">
            <div className="kpi-title-row">
              <span className="kpi-title">LTV to CAC Ratio</span>
            </div>
            <div className="kpi-value">{ltvCac}:1</div>
            <div className="kpi-subtitle">Ad spend ${adSpend}</div>
          </div>
        </div>

        <section className="panel operating-snapshot-panel">
          <div className="operating-header">
            <p className="eyebrow">Operating Snapshot</p>
            <h3>Bridge demand, margin, and replenishment risk in one operating panel.</h3>
          </div>

          <div className="snapshot-controls">
            <div className="control-group">
              <button type="button" className="export-button header-export">Export Report</button>
              <button type="button" className="mode-control on">
                <span className="mode-copy">
                  <strong>Dynamic Net Profit Mode</strong>
                  <span>Gross revenue minus COGS, shipping buffers, and ad spend.</span>
                </span>
              </button>
            </div>

            <div className="control-dates">
              <label>
                <span>Start</span>
                <input type="date" value={startDate} readOnly />
              </label>
              <label>
                <span>End</span>
                <input type="date" value={endDate} readOnly />
              </label>
            </div>
          </div>

          <div className="operating-grid">
            <div className="panel">
              <div className="subpanel-header">
                <div>
                  <h4>Critical Reorder Alert Feed</h4>
                  <p>Under 15 days of inventory remaining.</p>
                </div>
                <div className="feed-count">{flaggedPreview.length} flagged</div>
              </div>

              <div className="alert-feed">
                {flaggedPreview.map((item) => (
                  <div key={item.product_id} className="alert-item">
                    <div className="alert-item-main">
                      <div className="alert-product">
                        <strong>{item.product_name}</strong>
                        <span>{item.category}</span>
                      </div>
                      <div className="alert-metrics">
                        <div>
                          <span>Velocity</span>
                          <strong>{decimal(item.sales_velocity_30d, 2)} units / day</strong>
                        </div>
                        <div>
                          <span>Runway</span>
                          <strong>{Math.ceil(item.days_of_inventory_left)} Days Left</strong>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="draft-po-button">Draft PO</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel simulation-panel">
              <div className="subpanel-header">
                <div>
                  <h4>What-If Simulation</h4>
                  <p>Model runway impact using margin and spend levers.</p>
                </div>
              </div>
              <div className="simulation-body">
                <div className="simulation-slider-group">
                  <label><span>Ad Spend Adjustment</span><strong>{adSpendShift}%</strong></label>
                  <input type="range" min="-20" max="20" value={adSpendShift} onChange={(e) => setAdSpendShift(Number(e.target.value))} />
                </div>
                <div className="simulation-slider-group">
                  <label><span>Supplier COGS Shift</span><strong>{cogsShift}%</strong></label>
                  <input type="range" min="-20" max="20" value={cogsShift} onChange={(e) => setCogsShift(Number(e.target.value))} />
                </div>
                <div className="simulation-slider-group">
                  <label><span>Price Per Unit Change</span><strong>${priceShift}</strong></label>
                  <input type="range" min="-10" max="10" value={priceShift} onChange={(e) => setPriceShift(Number(e.target.value))} />
                </div>

                <div className="runway-compare">
                  <div className="runway-label-row">
                    <span>Average inventory runway</span>
                    <strong>{decimal(scenarioRunway)} days</strong>
                  </div>
                  <div className="progress-stack">
                    <div className="progress-row">
                      <span>Base</span>
                      <div className="progress-track"><div className="progress-bar base" style={{ width: `${Math.min(100, baseRunway * 5)}%` }} /></div>
                      <strong>{decimal(baseRunway)}d</strong>
                    </div>
                    <div className="progress-row">
                      <span>Scenario</span>
                      <div className="progress-track"><div className="progress-bar scenario" style={{ width: `${Math.min(100, scenarioRunway * 5)}%` }} /></div>
                      <strong>{decimal(scenarioRunway)}d</strong>
                    </div>
                  </div>
                  <div className={`simulation-impact ${runwayDelta >= 0 ? "positive" : "danger"}`}>
                    {runwayDelta >= 0 ? "Extends" : "Reduces"} average runway by {decimal(Math.abs(runwayDelta))} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="subpanel-header">
            <div>
              <h4>Inventory Coverage</h4>
              <p>Current stock, sales velocity, and runway by product.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Velocity</th>
                  <th>Runway</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map((item) => (
                  <tr key={item.product_id}>
                    <td>
                      <div className="table-product">{item.product_name}</div>
                      <div className="table-meta">{item.category}</div>
                    </td>
                    <td>{item.stock_level}</td>
                    <td>{decimal(item.sales_velocity_30d, 2)}/day</td>
                    <td>{Math.ceil(item.days_of_inventory_left)} Days Left</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="subpanel-header">
            <div>
              <h4>Commerce Coverage Summary</h4>
              <p>High-level throughput and margin context for the selected period.</p>
            </div>
          </div>
          <div className="operating-kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">Recognized Revenue</span>
              <div className="kpi-value">${recognizedRevenue}</div>
            </div>
            <div className="kpi-card">
              <span className="kpi-title">Returned Orders</span>
              <div className="kpi-value">{returnedOrders}</div>
            </div>
            <div className="kpi-card">
              <span className="kpi-title">Units Sold</span>
              <div className="kpi-value">{unitsSold}</div>
            </div>
            <div className="kpi-card">
              <span className="kpi-title">Flagged Reorders</span>
              <div className="kpi-value">{warningCount}</div>
            </div>
            <div className="kpi-card">
              <span className="kpi-title">Return Frequency Tracker</span>
              <div className="kpi-value">{decimal(apparelRate, 2)}%</div>
              <div className="kpi-subtitle">Apparel vs 10% safety threshold</div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="subpanel-header">
            <div>
              <h4>Date Window</h4>
              <p>{formatDateSlash(dashboardSlice?.date_range?.start_date)} to {formatDateSlash(dashboardSlice?.date_range?.end_date)}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
