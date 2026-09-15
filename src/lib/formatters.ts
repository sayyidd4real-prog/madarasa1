/**
 * Global reusable number formatting utility for Madarasa system.
 * Removes unnecessary leading zeros when displaying numbers, currency, counts, and IDs.
 * Preserves decimal formatting for currency (e.g., 020.00 -> 20.00, 0010.50 -> 10.50)
 * and keeps thousand separators (e.g., 001000 -> 1,000).
 */

export function stripLeadingZeros(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  if (!str) return "";

  // Strips leading zeros in numeric tokens or prefixes
  // e.g., "$020.00" -> "$20.00", "001 Student" -> "1 Student", "0005 Fee" -> "5 Fee"
  return str
    .replace(/(^|[\s$#:\-(])0+(?=\d)/g, "$1")
    .replace(/(^|[\s$#:\-(])0+(\.\d+)/g, "$10$2");
}

export function formatDisplayNumber(
  value: string | number | null | undefined,
  options?: {
    decimals?: number;
    useGrouping?: boolean;
    isCurrency?: boolean;
    currencySymbol?: string;
  }
): string {
  if (value === null || value === undefined || value === "") return "0";

  if (typeof value === "number") {
    const decimals = options?.decimals !== undefined
      ? options.decimals
      : (options?.isCurrency ? 2 : (Number.isInteger(value) ? 0 : 2));

    const formatted = value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: options?.useGrouping ?? true,
    });

    if (options?.isCurrency) {
      const symbol = options.currencySymbol ?? "$";
      return `${symbol}${formatted}`;
    }
    return formatted;
  }

  const strVal = String(value).trim();
  const rawNumStr = strVal.replace(/^\$/, "").trim();
  const parsed = parseFloat(rawNumStr);

  if (!isNaN(parsed) && /^-?\d+(\.\d+)?$/.test(rawNumStr)) {
    const isInt = Number.isInteger(parsed) && !rawNumStr.includes(".");
    const decimals = options?.decimals !== undefined
      ? options.decimals
      : (options?.isCurrency ? 2 : (isInt ? 0 : 2));

    const formatted = parsed.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: options?.useGrouping ?? true,
    });

    if (options?.isCurrency || strVal.startsWith("$")) {
      const symbol = options?.currencySymbol ?? "$";
      return `${symbol}${formatted}`;
    }
    return formatted;
  }

  let cleaned = stripLeadingZeros(strVal);
  if (options?.isCurrency && !cleaned.startsWith("$")) {
    cleaned = `${options.currencySymbol ?? "$"}${cleaned}`;
  }
  return cleaned;
}

export function formatCurrency(
  value: string | number | null | undefined,
  symbol: string = "$"
): string {
  if (value === null || value === undefined || value === "") return `${symbol}0.00`;

  let num: number;
  if (typeof value === "number") {
    num = value;
  } else {
    const strVal = String(value).trim();
    const rawNumStr = strVal.replace(/^\$/, "").trim();
    num = parseFloat(rawNumStr);
    if (isNaN(num)) {
      num = parseFloat(rawNumStr.replace(/[^0-9.-]/g, "")) || 0;
    }
  }

  if (isNaN(num)) return `${symbol}0.00`;

  return `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCount(
  count: number | string | null | undefined,
  label: string
): string {
  if (count === null || count === undefined || count === "") return `0 ${label}s`;
  const formattedNum = formatDisplayNumber(count, { useGrouping: true });
  const isOne = formattedNum === "1";
  return `${formattedNum} ${label}${isOne ? "" : "s"}`;
}
