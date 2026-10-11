const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function isBooleanValue(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isDateValue(value: unknown): value is Date | string {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  return typeof value === 'string' && ISO_DATE_PATTERN.test(value.trim());
}

export function formatDateValue(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (isBooleanValue(value)) {
    return value ? 'Sí' : 'No';
  }

  if (isDateValue(value)) {
    return formatDateValue(value);
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
