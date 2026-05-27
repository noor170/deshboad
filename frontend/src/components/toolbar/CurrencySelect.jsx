import { CURRENCY_CONFIG } from "../../../constants/currency";

export default function CurrencySelect({ value, onChange }) {
  return (
    <label className="app-control">
      <span>Currency</span>
      <select
        className="app-control-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {CURRENCY_CONFIG.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}
