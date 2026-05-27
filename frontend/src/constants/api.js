export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/_/backend" : "");
export const FORECAST_ENDPOINT = `${API_BASE}/api/v1/forecast/inventory`;
export const DASHBOARD_ENDPOINT = `${API_BASE}/api/v1/operations/dashboard`;
export const PAGE_SIZE = 5;
export const SOURCE_CURRENCY = "USD";

export const FALLBACK_FORECAST = {
  product_id: 101,
  product_name: "AeroNoise Headphones",
  category: "Electronics",
  current_stock: 142,
  daily_burn_velocity: 18.4,
  daily_sales_velocity_slope: 0.72,
  historical_average_velocity: 15.9,
  predicted_days_left: 7.7,
  forecast_strategy: "linear_regression",
  alert_level: "critical",
};

export const FALLBACK_DASHBOARD = (page) => ({
  low_stock_products: [],
  pagination: {
    page,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    total_pages: 1,
    has_next: false,
    has_previous: page > 1,
    next_page: null,
    previous_page: page > 1 ? page - 1 : null,
    next_cursor: null,
    previous_cursor: page > 1 ? String((page - 2) * PAGE_SIZE) : null,
    low_stock_total: 0,
  },
});
