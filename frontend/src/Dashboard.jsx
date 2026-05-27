import { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/_/backend" : "");

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const bodyPreview = (await response.text()).slice(0, 120);
    throw new Error(`Expected JSON but received ${contentType || "unknown content type"}: ${bodyPreview}`);
  }

  return response.json();
}
const thresholdLinePlugin = {
  id: "thresholdLine",
  afterDatasetsDraw(chart, _args, pluginOptions) {
    if (!pluginOptions?.xValue) return;
    const { ctx, chartArea, scales } = chart;
    const x = scales.x.getPixelForValue(pluginOptions.xValue);
    ctx.save();
    ctx.strokeStyle = pluginOptions.color || "#ff8a65";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  },
};
ChartJS.register(thresholdLinePlugin);

const defaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 89);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const currency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

function KPI({ title, value, subtitle, tone = "neutral", badge }) {
  return (
    <div className={`kpi-card kpi-${tone}`}>
      <div className="kpi-title-row">
        <span className="kpi-title">{title}</span>
        {badge ? <span className={`kpi-badge kpi-badge-${tone}`}>{badge}</span> : null}
      </div>
      <div className="kpi-value">{value}</div>
      {subtitle ? <div className="kpi-subtitle">{subtitle}</div> : null}
    </div>
  );
}

function LowStockRow({ item }) {
  return (
    <tr>
      <td>
        <div className="table-product">{item.product_name}</div>
        <div className="table-meta">{item.category}</div>
      </td>
      <td>{item.stock_level}</td>
      <td>{item.sales_velocity_30d.toFixed(2)}/day</td>
      <td>
        <span className="days-badge">
          {Math.round(item.days_of_inventory_left)} Days Left
        </span>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [netProfitMode, setNetProfitMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState(defaultDateRange);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set("start_date", filters.startDate);
    if (filters.endDate) params.set("end_date", filters.endDate);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/api/v1/operations/dashboard?${queryString}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await parseJsonResponse(response);
        setMetrics(json.data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [queryString]);

  async function exportReport() {
    setExporting(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/operations/export?${queryString}&file_format=csv`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `operations-summary-${filters.startDate}-to-${filters.endDate}.csv`;
      anchor.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (exportError) {
      setError(exportError.message);
    } finally {
      setExporting(false);
    }
  }

  const lineData = useMemo(() => {
    if (!metrics) return null;
    return {
      labels: metrics.time_series.labels,
      datasets: [
        {
          label: netProfitMode ? "Net Profit" : "Gross Sales",
          data: netProfitMode ? metrics.time_series.net_profit : metrics.time_series.gross_sales,
          borderColor: netProfitMode ? "#58c4a8" : "#5b8cff",
          backgroundColor: netProfitMode
            ? "rgba(88,196,168,0.15)"
            : "rgba(91,140,255,0.14)",
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2.5,
        },
      ],
    };
  }, [metrics, netProfitMode]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 450,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        labels: { color: "#94a3b8" },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "rgba(148,163,184,0.2)",
        borderWidth: 1,
        callbacks: {
          label: (context) => currency(context.parsed.y),
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        grid: { color: "rgba(148,163,184,0.08)" },
      },
      y: {
        ticks: {
          color: "#94a3b8",
          callback: (value) => currency(value),
        },
        grid: { color: "rgba(148,163,184,0.08)" },
      },
    },
  };

  const returnChartData = useMemo(() => {
    if (!metrics) return null;
    return {
      labels: metrics.category_return_rates.map((item) => item.category),
      datasets: [
        {
          label: "Return Rate %",
          data: metrics.category_return_rates.map((item) => item.return_rate_pct),
          backgroundColor: metrics.category_return_rates.map((item) =>
            item.return_rate_pct >= 10 ? "#ff7b72" : "#f4b860"
          ),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [metrics]);

  const returnChartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: { display: false },
      thresholdLine: {
        xValue: 10,
        color: "#e85d75",
      },
      tooltip: {
        backgroundColor: "#0f172a",
        callbacks: {
          label: (context) => `${context.parsed.x.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "#94a3b8",
          callback: (value) => `${value}%`,
        },
        grid: { color: "rgba(148,163,184,0.08)" },
      },
      y: {
        ticks: { color: "#cbd5e1" },
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="spinner" />
        <p>Loading retail operations dashboard...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="loading-shell">
        <p>Dashboard data unavailable.</p>
        {error ? <p className="error-copy">{error}</p> : null}
      </div>
    );
  }

  const headlineValue = netProfitMode ? metrics.net_profit : metrics.gross_revenue;
  const headlineTitle = netProfitMode ? "Net Profit" : "Gross Revenue";

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
          <div className="sidebar-label">Date Range</div>
          <label>
            <span>Start</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                setFilters((current) => ({ ...current, startDate: event.target.value }))
              }
            />
          </label>
          <label>
            <span>End</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                setFilters((current) => ({ ...current, endDate: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="sidebar-panel">
          <div className="sidebar-label">Controls</div>
          <div className="mode-card">
            <div>
              <strong>Dynamic Net Profit Mode</strong>
              <p>Subtracts product cost, shipping buffers, and ad spend.</p>
            </div>
            <button
              type="button"
              className={`mode-switch ${netProfitMode ? "on" : ""}`}
              aria-pressed={netProfitMode}
              onClick={() => setNetProfitMode((current) => !current)}
            >
              <span />
            </button>
          </div>
          <button className="export-button" type="button" onClick={exportReport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Store performance</p>
            <h2>E-Commerce & Retail Operations Dashboard</h2>
            <p className="header-copy">
              Balance ad efficiency against inventory velocity and margin pressure in one view.
            </p>
          </div>
          <div className={`status-pill ${metrics.ltv_cac_status}`}>
            LTV:CAC {metrics.ltv_cac_ratio.toFixed(2)}:1
          </div>
        </header>

        {error ? <div className="error-banner">Backend request failed: {error}</div> : null}

        <section className="kpi-grid">
          <KPI
            title={headlineTitle}
            value={currency(headlineValue)}
            subtitle={`${metrics.totals.orders} orders in selected range`}
            tone={netProfitMode ? "positive" : "primary"}
          />
          <KPI
            title="Operational Warnings"
            value={metrics.warning_count}
            subtitle="Products under 15 days of inventory"
            tone={metrics.warning_count > 0 ? "danger" : "positive"}
          />
          <KPI
            title="LTV to CAC Ratio"
            value={`${metrics.ltv_cac_ratio.toFixed(2)}:1`}
            subtitle={`Ad spend ${currency(metrics.ad_spend)}`}
            tone={metrics.ltv_cac_status === "warning" ? "warning" : "positive"}
            badge={metrics.ltv_cac_status === "warning" ? "Needs attention" : "Healthy"}
          />
        </section>

        <section className="content-grid">
          <div className="panel panel-large">
            <div className="panel-header">
              <div>
                <h3>{netProfitMode ? "Net Profit Trend" : "Gross Sales Trend"}</h3>
                <p>
                  {netProfitMode
                    ? "Net view includes product cost, shipping buffers, and full ad spend."
                    : "Gross view shows top-line sales before operating deductions."}
                </p>
              </div>
              <div className="panel-metric">
                {currency(netProfitMode ? metrics.net_profit : metrics.gross_revenue)}
              </div>
            </div>
            <div className="chart-panel">
              {lineData ? <Line data={lineData} options={lineOptions} /> : null}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Return Frequency</h3>
                <p>Threshold line marks 10% return rate.</p>
              </div>
            </div>
            <div className="bar-chart-panel">
              {returnChartData ? <Bar data={returnChartData} options={returnChartOptions} /> : null}
            </div>
          </div>
        </section>

        <section className="table-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Critical Reorder Alerts</h3>
                <p>Products at less than 15 days of inventory cover.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Velocity</th>
                    <th>Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.low_stock_products.length ? (
                    metrics.low_stock_products.map((item) => (
                      <LowStockRow key={item.product_id} item={item} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-cell">
                        No products are currently below the reorder threshold.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Operating Snapshot</h3>
                <p>Selected period summary across sales, returns, and volume.</p>
              </div>
            </div>
            <div className="snapshot-list">
              <div className="snapshot-row">
                <span>Recognized Revenue</span>
                <strong>{currency(metrics.recognized_revenue)}</strong>
              </div>
              <div className="snapshot-row">
                <span>Returned Orders</span>
                <strong>{metrics.totals.returned_orders}</strong>
              </div>
              <div className="snapshot-row">
                <span>Units Sold</span>
                <strong>{metrics.totals.units_sold}</strong>
              </div>
              <div className="snapshot-row">
                <span>Coverage Window</span>
                <strong>
                  {metrics.date_range.start_date} to {metrics.date_range.end_date}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
