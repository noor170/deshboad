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

const FALLBACK_PRODUCTS = [
  { product_id: 1, product_name: "AeroNoise Headphones", category: "Electronics", stock_level: 142, sales_velocity_30d: 18.4, days_of_inventory_left: 7.7, critical_reorder_alert: true },
  { product_id: 2, product_name: "PulseFit Smartwatch", category: "Electronics", stock_level: 89, sales_velocity_30d: 12.1, days_of_inventory_left: 14.2, critical_reorder_alert: true },
  { product_id: 3, product_name: "LumaBeam Desk Lamp", category: "Home Goods", stock_level: 96, sales_velocity_30d: 5.3, days_of_inventory_left: 22.8, critical_reorder_alert: false },
  { product_id: 4, product_name: "CloudWeave Throw", category: "Home Goods", stock_level: 54, sales_velocity_30d: 1.2, days_of_inventory_left: 45.0, critical_reorder_alert: false },
  { product_id: 5, product_name: "Northline Running Jacket", category: "Apparel", stock_level: 44, sales_velocity_30d: 1.4, days_of_inventory_left: 31.4, critical_reorder_alert: false },
  { product_id: 6, product_name: "Everyday Essential Tee", category: "Apparel", stock_level: 140, sales_velocity_30d: 3.8, days_of_inventory_left: 36.8, critical_reorder_alert: false },
  { product_id: 7, product_name: "TerraBrew Kettle", category: "Home Goods", stock_level: 37, sales_velocity_30d: 1.0, days_of_inventory_left: 37.0, critical_reorder_alert: false },
  { product_id: 8, product_name: "Summit Trail Pack", category: "Apparel", stock_level: 22, sales_velocity_30d: 0.9, days_of_inventory_left: 24.4, critical_reorder_alert: false },
  { product_id: 9, product_name: "ArcCharge Power Bank", category: "Electronics", stock_level: 62, sales_velocity_30d: 2.7, days_of_inventory_left: 23.0, critical_reorder_alert: false },
  { product_id: 10, product_name: "StudioGrip Phone Stand", category: "Electronics", stock_level: 116, sales_velocity_30d: 4.5, days_of_inventory_left: 25.8, critical_reorder_alert: false },
  { product_id: 11, product_name: "Haven Ceramic Set", category: "Home Goods", stock_level: 18, sales_velocity_30d: 0.7, days_of_inventory_left: 25.7, critical_reorder_alert: false },
  { product_id: 12, product_name: "Coastline Linen Shirt", category: "Apparel", stock_level: 26, sales_velocity_30d: 1.1, days_of_inventory_left: 23.6, critical_reorder_alert: false },
  { product_id: 13, product_name: "SwiftCharge Power Bank", category: "Electronics", stock_level: 35, sales_velocity_30d: 2.1, days_of_inventory_left: 16.7, critical_reorder_alert: true },
  { product_id: 14, product_name: "NightOwl Desk Lamp", category: "Home Goods", stock_level: 48, sales_velocity_30d: 1.5, days_of_inventory_left: 32.0, critical_reorder_alert: false },
  { product_id: 15, product_name: "BrewMaster Coffee Maker", category: "Home Goods", stock_level: 29, sales_velocity_30d: 0.8, days_of_inventory_left: 36.3, critical_reorder_alert: false },
];

const FALLBACK_CATEGORIES = [
  { category: "Electronics", total_orders: 420, returned_orders: 25, return_rate_pct: 5.95 },
  { category: "Apparel", total_orders: 380, returned_orders: 68, return_rate_pct: 17.89 },
  { category: "Home Goods", total_orders: 447, returned_orders: 49, return_rate_pct: 10.96 },
];

const FALLBACK_SUPPLIER_BUFFERS = [
  { category: "Electronics", avg_daily_demand: 6.8, demand_std: 2.4, lead_time_weeks: 3, safety_stock_units: 12 },
  { category: "Apparel", avg_daily_demand: 5.2, demand_std: 1.9, lead_time_weeks: 4, safety_stock_units: 14 },
  { category: "Home Goods", avg_daily_demand: 4.1, demand_std: 1.5, lead_time_weeks: 2, safety_stock_units: 7 },
];

const FALLBACK_TIME_SERIES = {
  labels: ["Apr 27", "May 04", "May 11", "May 18", "May 27"],
  gross_sales: [18200, 24500, 21800, 29400, 31200],
  net_profit: [5400, 8200, 6100, 9800, 11200],
};

const TOTAL_PRODUCTS = FALLBACK_PRODUCTS.length;

export const FALLBACK_DASHBOARD = (_page, pageSize = PAGE_SIZE) => {
  const totalPages = Math.ceil(TOTAL_PRODUCTS / pageSize);
  const safePage = Math.max(1, Math.min(_page, totalPages));
  const offset = (safePage - 1) * pageSize;

  const low_stock_products = FALLBACK_PRODUCTS.filter((p) => p.critical_reorder_alert);
  const lowStockTotal = low_stock_products.length;
  const atRisk = lowStockTotal;
  const healthy = TOTAL_PRODUCTS - atRisk;
  const paginatedLowStock = low_stock_products.slice(offset, offset + pageSize);

  return {
    date_range: { start_date: "2026-04-27", end_date: "2026-05-27" },
    kpi_summary: {
      gross_revenue: 284560.0,
      net_profit: 89320.0,
      recognized_revenue: 268420.0,
      ad_spend: 42180.0,
      ltv_cac_ratio: 3.82,
      ltv_cac_status: "healthy",
      warning_count: atRisk,
      average_order_value: 215.4,
    },
    gross_revenue: 284560.0,
    net_profit: 89320.0,
    recognized_revenue: 268420.0,
    ad_spend: 42180.0,
    warning_count: atRisk,
    ltv_cac_ratio: 3.82,
    ltv_cac_status: "healthy",
    sales_forecast: {
      time_series: FALLBACK_TIME_SERIES,
      forecast_period: "next_30_days",
      projected_revenue: 134160.0,
      projected_profit: 48160.0,
    },
    time_series: FALLBACK_TIME_SERIES,
    inventory_risk: {
      at_risk_count: atRisk,
      healthy_count: healthy,
      total_skus: TOTAL_PRODUCTS,
      low_stock_products: paginatedLowStock,
    },
    low_stock_products: paginatedLowStock,
    inventory_overview: FALLBACK_PRODUCTS.slice(offset, offset + pageSize),
    reverse_logistics_forecast: {
      total_returned_orders: 142,
      category_return_rates: FALLBACK_CATEGORIES,
      estimated_return_volume_30d: 58.4,
    },
    category_return_rates: FALLBACK_CATEGORIES,
    supplier_drift_buffers: FALLBACK_SUPPLIER_BUFFERS,
    totals: { orders: 1247, units_sold: 3891, returned_orders: 142 },
    low_stock_products_all: paginatedLowStock,
    pagination: {
      page: safePage,
      limit: pageSize,
      offset,
      total_pages: totalPages,
      has_next: safePage < totalPages,
      has_previous: safePage > 1,
      next_page: safePage < totalPages ? safePage + 1 : null,
      previous_page: safePage > 1 ? safePage - 1 : null,
      low_stock_total: lowStockTotal,
      inventory_total: TOTAL_PRODUCTS,
      category_total: FALLBACK_CATEGORIES.length,
    },
  };
};
