export function normalizeDateInput(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return new Date(`${value}T00:00:00Z`);
  }
  return new Date(value);
}

export function getForecastTone(level) {
  if (level === "critical") return "critical";
  if (level === "watch") return "watch";
  return "healthy";
}

export function decimal(value, digits = 1) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0);
}
