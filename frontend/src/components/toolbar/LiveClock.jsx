import { useLiveClock } from "../../../hooks";

export default function LiveClock({ timezone }) {
  const { formatted } = useLiveClock(timezone);

  return (
    <div className="app-live-bar">
      <div className="app-live-tick">
        <span className="app-live-dot" />
        <span>LIVE</span>
      </div>
      <div className="app-live-clock">{formatted}</div>
    </div>
  );
}
