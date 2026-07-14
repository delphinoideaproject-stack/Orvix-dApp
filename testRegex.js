function formatGlobalNumber(value, maximumFractionDigits = 10) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
  }
  const match = value.match(/^([^0-9\.-]*)([\d,\.]+)([^0-9]*)$/);
  if (match) {
    const prefix = match[1];
    const numberPart = match[2];
    const suffix = match[3];
    const cleanNumber = parseFloat(numberPart.replace(/,/g, ''));
    if (!isNaN(cleanNumber)) {
      // If the numberPart is just an integer or has decimals, we should preserve them correctly.
      // But actually, we don't know how many fraction digits to use.
      // If we use maximumFractionDigits: 10, 0.004200 might become 0.0042.
      // Let's count decimals in the original string to preserve them if needed.
      let fractionDigits = 0;
      if (numberPart.includes('.')) {
         fractionDigits = numberPart.split('.')[1].length;
      }
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits > 10 ? 10 : fractionDigits,
        maximumFractionDigits: Math.max(maximumFractionDigits, fractionDigits)
      }).format(cleanNumber);
      return `${prefix}${formatted}${suffix}`;
    }
  }
  return value;
}

console.log(formatGlobalNumber("1000000"));
console.log(formatGlobalNumber("1,000,000"));
console.log(formatGlobalNumber("$50,000.50"));
console.log(formatGlobalNumber("0.004200"));
console.log(formatGlobalNumber("700M"));
console.log(formatGlobalNumber(1000000));
console.log(formatGlobalNumber("12.4%"));
