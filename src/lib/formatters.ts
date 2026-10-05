export function toArabicNumerals(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let result = str.replace(/\d/g, (d) => arabicDigits[parseInt(d, 10)]).replace(/%/g, "٪");
  // Replace decimal point between digits with Arabic decimal separator '٫'
  result = result.replace(/([\u0660-\u0669])\.([\u0660-\u0669])/g, "$1٫$2");
  return result;
}

export function formatLangNumber(value: string | number | null | undefined, language?: string): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (language === "ar") {
    return toArabicNumerals(str);
  }
  return str;
}

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
    language?: string;
  }
): string {
  if (value === null || value === undefined || value === "") return options?.language === "ar" ? "٠" : "0";

  let formatted = "";
  if (typeof value === "number") {
    const decimals = options?.decimals !== undefined
      ? options.decimals
      : (options?.isCurrency ? 2 : (Number.isInteger(value) ? 0 : 2));

    formatted = value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: options?.useGrouping ?? true,
    });

    if (options?.isCurrency) {
      const symbol = options.currencySymbol ?? "$";
      formatted = `${symbol}${formatted}`;
    }
  } else {
    const strVal = String(value).trim();
    const rawNumStr = strVal.replace(/^\$/, "").trim();
    const parsed = parseFloat(rawNumStr);

    if (!isNaN(parsed) && /^-?\d+(\.\d+)?$/.test(rawNumStr)) {
      const isInt = Number.isInteger(parsed) && !rawNumStr.includes(".");
      const decimals = options?.decimals !== undefined
        ? options.decimals
        : (options?.isCurrency ? 2 : (isInt ? 0 : 2));

      formatted = parsed.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: options?.useGrouping ?? true,
      });

      if (options?.isCurrency || strVal.startsWith("$")) {
        const symbol = options?.currencySymbol ?? "$";
        formatted = `${symbol}${formatted}`;
      }
    } else {
      let cleaned = stripLeadingZeros(strVal);
      if (options?.isCurrency && !cleaned.startsWith("$")) {
        cleaned = `${options.currencySymbol ?? "$"}${cleaned}`;
      }
      formatted = cleaned;
    }
  }

  if (options?.language === "ar") {
    return toArabicNumerals(formatted);
  }
  return formatted;
}

export function formatCurrency(
  value: string | number | null | undefined,
  symbol: string = "$",
  language?: string
): string {
  if (value === null || value === undefined || value === "") {
    const res = `${symbol}0.00`;
    return language === "ar" ? toArabicNumerals(res) : res;
  }

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

  if (isNaN(num)) {
    const res = `${symbol}0.00`;
    return language === "ar" ? toArabicNumerals(res) : res;
  }

  const res = `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return language === "ar" ? toArabicNumerals(res) : res;
}

export function formatCount(
  count: number | string | null | undefined,
  label: string,
  language?: string
): string {
  if (count === null || count === undefined || count === "") return language === "ar" ? `٠ ${label}` : `0 ${label}s`;
  const formattedNum = formatDisplayNumber(count, { useGrouping: true, language });
  const isOne = String(count) === "1";
  return `${formattedNum} ${label}${isOne ? "" : "s"}`;
}
