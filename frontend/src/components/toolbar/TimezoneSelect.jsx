import { useMemo } from "react";
import { TIMEZONE_OPTIONS, groupTimezonesByRegion } from "../../../constants/timezone";

export default function TimezoneSelect({ value, onChange }) {
  const grouped = useMemo(() => groupTimezonesByRegion(TIMEZONE_OPTIONS), []);

  return (
    <label className="app-control">
      <span>Timezone</span>
      <select
        className="app-control-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {Object.entries(grouped).map(([region, zones]) => (
          <optgroup key={region} label={region}>
            {zones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
