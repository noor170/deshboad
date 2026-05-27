import { useEffect, useState } from "react";

export function useLiveClock(timezone, intervalMs = 1000) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  return { now, formatted };
}
