import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FALLBACK_DATA = {
  gross_revenue: 432000.0,
  anomaly_count: 12,
  mean_order_value: 1800.0,
  monthly_labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  monthly_values: [32000,28500,41000,37500,44200,39800,47000,43500,38200,41700,46300,52300],
  top_categories: {
    Electronics: 145000,
    Apparel: 98000,
    "Home & Garden": 76000,
    Sports: 65000,
    Books: 48000,
  },
  total_orders: 240,
};

const API_BASE = import.meta.env.VITE_API_URL || "";

function MetricCard({ title, value, subtitle, accent, icon }) {
  return (
    <div className="metric-card" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="metric-card-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value" style={{ color: accent }}>
        {value}
      </div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );
}

function CategoryBar({ name, value, max }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="category-row">
      <span className="category-name">{name}</span>
      <div className="category-bar-wrap">
        <div className="category-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="category-value">${value.toLocaleString()}</span>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("live");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/operations/dashboard`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          setMetrics(json.data);
          setDataSource("live");
        } else {
          throw new Error("Unexpected response shape");
        }
      } catch (err) {
        console.warn("API unavailable, using fallback data:", err.message);
        setMetrics(FALLBACK_DATA);
        setDataSource("mock");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading operational data…</p>
      </div>
    );
  }

  const chartData = {
    labels: metrics.monthly_labels,
    datasets: [
      {
        label: "Monthly Gross Revenue ($)",
        data: metrics.monthly_values,
        borderColor: "#e94560",
        backgroundColor: "rgba(233,69,96,0.15)",
        pointBackgroundColor: "#e94560",
        pointBorderColor: "#fff",
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#ccc", font: { size: 13 } },
      },
      title: {
        display: true,
        text: "Monthly Gross Operational Scaling",
        color: "#fff",
        font: { size: 16, weight: "bold" },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: "#0f3460",
        titleColor: "#e94560",
        bodyColor: "#ccc",
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: {
          color: "#aaa",
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
        },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  };

  const maxCatValue = Math.max(...Object.values(metrics.top_categories));

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Operations Dashboard</h1>
          <p className="dash-subtitle">E-commerce Business Analytics</p>
        </div>
        <div className="dash-badge" data-source={dataSource}>
          {dataSource === "live" ? "● Live Data" : "⚠ Mock Data"}
        </div>
      </header>

      {error && (
        <div className="alert-banner">
          Backend unreachable ({error}) — displaying demo metrics.
        </div>
      )}

      <section className="metrics-row">
        <MetricCard
          title="Gross Revenue"
          value={`$${metrics.gross_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle={`${metrics.total_orders} total orders`}
          accent="#4ecca3"
          icon="💰"
        />
        <MetricCard
          title="Operational Anomalies"
          value={metrics.anomaly_count}
          subtitle="Orders > ±2σ from mean"
          accent="#e94560"
          icon="⚠️"
        />
        <MetricCard
          title="Mean Order Ticket"
          value={`$${metrics.mean_order_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Average per transaction"
          accent="#f5a623"
          icon="🧾"
        />
      </section>

      <section className="chart-section">
        <div className="chart-wrap">
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>

      <section className="bottom-row">
        <div className="category-panel">
          <h2 className="panel-title">Top Revenue Categories</h2>
          {Object.entries(metrics.top_categories).map(([name, value]) => (
            <CategoryBar key={name} name={name} value={value} max={maxCatValue} />
          ))}
        </div>

        <div className="chart-image-panel">
          <h2 className="panel-title">Distribution Profile</h2>
          <img
            src={`${API_BASE}/api/v1/operations/chart`}
            alt="Sales distribution chart"
            className="dist-chart-img"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="dist-chart-fallback" style={{ display: "none" }}>
            <span>Chart renders when backend is running</span>
          </div>
        </div>
      </section>
    </div>
  );
}
