export function formatGlobalNumber(value: number | string | undefined | null, options: Intl.NumberFormatOptions = {}): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', options).format(value);
  }
  
  const match = value.match(/^([^0-9\.-]*)([\d,\.]+)([^0-9]*)$/);
  if (match) {
    const prefix = match[1];
    const numberPart = match[2];
    const suffix = match[3];
    const cleanNumber = parseFloat(numberPart.replace(/,/g, ''));
    if (!isNaN(cleanNumber)) {
      let fractionDigits = 0;
      if (numberPart.includes('.')) {
         fractionDigits = numberPart.split('.')[1].length;
      }
      
      const formatOptions = {
        minimumFractionDigits: options.minimumFractionDigits ?? Math.min(fractionDigits, 20),
        maximumFractionDigits: options.maximumFractionDigits ?? Math.max(10, Math.min(fractionDigits, 20)),
        ...options
      };
      
      const formatted = new Intl.NumberFormat('en-US', formatOptions).format(cleanNumber);
      return `${prefix}${formatted}${suffix}`;
    }
  }
  
  const fallbackNum = parseFloat(value.replace(/,/g, ''));
  if (!isNaN(fallbackNum)) {
     return new Intl.NumberFormat('en-US', options).format(fallbackNum);
  }
  
  return value;
}
