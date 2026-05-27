import { useState } from "react";
import Dashboard from "./Dashboard";
import { AppToolbar } from "./components/toolbar";
import { useDisplayPrefs } from "./hooks";
import "./index.css";

export default function App() {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [operationalTimezone, setOperationalTimezone] = useState("UTC");
  const displayPrefs = useDisplayPrefs(baseCurrency, operationalTimezone);

  return (
    <div className="app">
      <AppToolbar
        baseCurrency={baseCurrency}
        operationalTimezone={operationalTimezone}
        onCurrencyChange={setBaseCurrency}
        onTimezoneChange={setOperationalTimezone}
      />
      <Dashboard displayPrefs={displayPrefs} />
    </div>
  );
}
