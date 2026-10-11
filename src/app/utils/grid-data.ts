import type { GridData, GridRow } from '../interfaces/gridTableInterface';

export function toGridData(records: Record<string, unknown>[]): GridData {
  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers: string[] = [];

  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!headers.includes(key)) {
        headers.push(key);
      }
    }
  }

  const rows: GridRow[] = records.map((record) => headers.map((header) => record[header]));

  return { headers, rows };
}
