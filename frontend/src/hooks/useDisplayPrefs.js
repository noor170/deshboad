import { useMemo } from "react";
import { CURRENCY_RATES } from "../constants/currency";
import { normalizeDateInput } from "../constants/utils";

export function useDisplayPrefs(baseCurrency, operationalTimezone) {
  return useMemo(() => {
    const convertMoney = (value, sourceCurrency = "USD") => {
      const numericValue = Number(value || 0);
      const sourceRate = CURRENCY_RATES[sourceCurrency] || 1;
      const targetRate = CURRENCY_RATES[baseCurrency] || 1;
      return (numericValue / sourceRate) * targetRate;
    };

    const formatMoney = (value, sourceCurrency = "USD", digits = 0) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: baseCurrency,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(convertMoney(value, sourceCurrency));

    const formatDate = (value, options = {}) => {
      const normalizedValue = normalizeDateInput(value);
      if (!normalizedValue || Number.isNaN(normalizedValue.getTime())) {
        return "Unavailable";
      }
      return new Intl.DateTimeFormat("en-US", {
        timeZone: operationalTimezone,
        month: "short",
        day: "numeric",
        year: "numeric",
        ...options,
      }).format(normalizedValue);
    };

    return {
      baseCurrency,
      operationalTimezone,
      convertMoney,
      formatMoney,
      formatDate,
    };
  }, [baseCurrency, operationalTimezone]);
}
