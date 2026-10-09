import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor() {}

  async writeToClipboard(text: string): Promise<void> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch (e) {
      // fallback handled below
    }

    // fallback using temporary textarea
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  downloadCsv(rows: string[][], filename = 'export.csv'): void {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(v => String(v)).join(',')).join('\n');
    const uri = encodeURI(csvContent);
    this.downloadUri(uri, filename);
  }

  downloadJson(data: unknown, filename = 'export.json'): void {
    const uri = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    this.downloadUri(uri, filename);
  }

  private downloadUri(uri: string, filename: string): void {
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
