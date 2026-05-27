export const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC", region: "Global" },
  { value: "America/New_York", label: "New York", region: "Americas" },
  { value: "America/Chicago", label: "Chicago", region: "Americas" },
  { value: "America/Denver", label: "Denver", region: "Americas" },
  { value: "America/Los_Angeles", label: "Los Angeles", region: "Americas" },
  { value: "America/Sao_Paulo", label: "São Paulo", region: "Americas" },
  { value: "Europe/London", label: "London", region: "Europe" },
  { value: "Europe/Berlin", label: "Berlin", region: "Europe" },
  { value: "Europe/Paris", label: "Paris", region: "Europe" },
  { value: "Europe/Zurich", label: "Zurich", region: "Europe" },
  { value: "Asia/Dubai", label: "Dubai", region: "Middle East" },
  { value: "Asia/Kolkata", label: "Mumbai", region: "Asia" },
  { value: "Asia/Shanghai", label: "Shanghai", region: "Asia" },
  { value: "Asia/Tokyo", label: "Tokyo", region: "Asia" },
  { value: "Asia/Seoul", label: "Seoul", region: "Asia" },
  { value: "Asia/Singapore", label: "Singapore", region: "Asia" },
  { value: "Australia/Sydney", label: "Sydney", region: "Oceania" },
];

export function groupTimezonesByRegion(timezones) {
  return timezones.reduce((acc, tz) => {
    if (!acc[tz.region]) acc[tz.region] = [];
    acc[tz.region].push(tz);
    return acc;
  }, {});
}
