interface ParsedTitle {
  hasNumber: boolean;
  prefix?: string;
  number?: string;
  suffix?: string;
  text?: string;
}

export function parseFeatureTitle(title: string): ParsedTitle {
  // Pattern: "40x", "100%", "365"
  const numberSuffixMatch = title.match(/^(\d+)([x%]?)$/i);
  if (numberSuffixMatch) {
    return {
      hasNumber: true,
      number: numberSuffixMatch[1],
      suffix: numberSuffixMatch[2] || undefined,
    };
  }

  // Pattern: "Km 0", "Anno 1"
  const prefixNumberMatch = title.match(/^([A-Za-z]+)\s+(\d+)$/);
  if (prefixNumberMatch) {
    return {
      hasNumber: true,
      prefix: prefixNumberMatch[1],
      number: prefixNumberMatch[2],
    };
  }

  // Pattern: "365 Giorni"
  const numberTextMatch = title.match(/^(\d+)\s+(.+)$/);
  if (numberTextMatch) {
    return {
      hasNumber: true,
      number: numberTextMatch[1],
      text: numberTextMatch[2],
    };
  }

  // No number found - return plain text
  return { hasNumber: false, text: title };
}
