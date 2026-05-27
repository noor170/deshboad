import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

export default function SalesChart({ timeSeries, projectedRevenue }) {
  const labels = timeSeries?.labels || [];
  const grossSales = timeSeries?.gross_sales || [];
  const netProfit = timeSeries?.net_profit || [];

  const data = {
    labels,
    datasets: [
      {
        label: "Gross Sales",
        data: grossSales,
        borderColor: "var(--primary)",
        backgroundColor: "var(--primary-bg)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Net Profit",
        data: netProfit,
        borderColor: "var(--positive)",
        backgroundColor: "var(--positive-bg)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "var(--text)", usePointStyle: true, padding: 20 },
      },
      tooltip: {
        backgroundColor: "var(--bg-card)",
        titleColor: "var(--text-strong)",
        bodyColor: "var(--text)",
        borderColor: "var(--line)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "var(--muted)" },
        grid: { color: "var(--line)" },
      },
      y: {
        ticks: { color: "var(--muted)" },
        grid: { color: "var(--line)" },
      },
    },
  };

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <div>
          <p className="dashboard-section-kicker">Sales Forecast</p>
          <h2>Revenue & Profit Trend</h2>
        </div>
        {projectedRevenue != null && (
          <div className="dashboard-forecast-badge">
            <span>30d Projection</span>
            <strong>${Number(projectedRevenue || 0).toLocaleString()}</strong>
          </div>
        )}
      </div>
      <div className="dashboard-chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
