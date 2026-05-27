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
  { product_id: 1, product_name: "AeroNoise Headphones", category: "Electronics", sales_velocity_30d: 18.4, days_of_inventory_left: 7.7 },
  { product_id: 2, product_name: "SwiftCharge Power Bank", category: "Electronics", sales_velocity_30d: 12.1, days_of_inventory_left: 14.2 },
  { product_id: 3, product_name: "ErgoLift Standing Desk", category: "Furniture", sales_velocity_30d: 5.3, days_of_inventory_left: 22.8 },
  { product_id: 4, product_name: "CloudFoam Running Shoes", category: "Apparel", sales_velocity_30d: 24.7, days_of_inventory_left: 5.1 },
  { product_id: 5, product_name: "AquaPure Water Bottle", category: "Lifestyle", sales_velocity_30d: 31.2, days_of_inventory_left: 3.9 },
  { product_id: 6, product_name: "PixelGlow LED Strip", category: "Electronics", sales_velocity_30d: 8.6, days_of_inventory_left: 18.4 },
  { product_id: 7, product_name: "ThermoFlex Jacket", category: "Apparel", sales_velocity_30d: 15.9, days_of_inventory_left: 11.3 },
  { product_id: 8, product_name: "SoundWave Earbuds Pro", category: "Electronics", sales_velocity_30d: 42.3, days_of_inventory_left: 2.8 },
  { product_id: 9, product_name: "ZenGarden Plant Pot Set", category: "Home", sales_velocity_30d: 6.4, days_of_inventory_left: 28.5 },
  { product_id: 10, product_name: "Flexi Yoga Mat Premium", category: "Fitness", sales_velocity_30d: 11.8, days_of_inventory_left: 15.6 },
  { product_id: 11, product_name: "NightOwl Desk Lamp", category: "Furniture", sales_velocity_30d: 9.2, days_of_inventory_left: 19.1 },
  { product_id: 12, product_name: "TrailBlazer Hiking Boots", category: "Apparel", sales_velocity_30d: 7.1, days_of_inventory_left: 25.3 },
  { product_id: 13, product_name: "PureAir Humidifier", category: "Home", sales_velocity_30d: 13.5, days_of_inventory_left: 13.7 },
  { product_id: 14, product_name: "SonicSweep Robot Vacuum", category: "Electronics", sales_velocity_30d: 4.8, days_of_inventory_left: 30.2 },
  { product_id: 15, product_name: "BrewMaster Coffee Maker", category: "Kitchen", sales_velocity_30d: 19.6, days_of_inventory_left: 8.4 },
];

export const FALLBACK_DASHBOARD = (page, pageSize = PAGE_SIZE) => {
  const totalProducts = FALLBACK_PRODUCTS.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages));
  const offset = (safePage - 1) * pageSize;
  const low_stock_products = FALLBACK_PRODUCTS.slice(offset, offset + pageSize);

  return {
    low_stock_products,
    gross_revenue: 284560,
    net_profit: 89320,
    ad_spend: 42180,
    ltv_cac_ratio: 3.2,
    totals: {
      orders: 1247,
      units_sold: 3891,
    },
    date_range: {
      start_date: "2026-04-27",
      end_date: "2026-05-27",
    },
    pagination: {
      page: safePage,
      limit: pageSize,
      offset,
      total_pages: totalPages,
      has_next: safePage < totalPages,
      has_previous: safePage > 1,
      next_page: safePage < totalPages ? safePage + 1 : null,
      previous_page: safePage > 1 ? safePage - 1 : null,
      low_stock_total: totalProducts,
    },
  };
};
