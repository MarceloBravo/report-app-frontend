import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { GridFooterItem, GridRow, GridRowView } from '../../interfaces/gridTableInterface';
import { ExportService } from '../../services/export/export.service';
import { formatCellValue, isBooleanValue } from '../../utils/cell-format';

function normalizeColumnName(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

@Component({
  selector: 'app-grid-table',
  imports: [],
  templateUrl: './grid-table.html',
  styleUrl: './grid-table.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridTable {
  readonly headers = input<string[]>([]);
  readonly rows = input<GridRow[]>([]);
  readonly idColumn = input('');

  readonly title = input('Resultados Obtenidos');
  readonly subtitle = input('');
  readonly icon = input('dataset');
  readonly emptyMessage = input('Sin resultados para mostrar');
  readonly exportFileName = input('export');

  readonly footerItems = input<GridFooterItem[]>([]);
  readonly footerNote = input('');

  private readonly exportService = inject(ExportService);

  readonly hasRows = computed(() => this.rows().length > 0);
  readonly hasHeaders = computed(() => this.headers().length > 0);

  readonly idIndex = computed(() => {
    const target = normalizeColumnName(this.idColumn());

    if (!target) {
      return -1;
    }

    return this.headers().findIndex((header) => normalizeColumnName(header) === target);
  });

  readonly columnCount = computed(() => {
    const rowWidth = this.rows().reduce((max, row) => Math.max(max, row.length), 0);

    return Math.max(this.headers().length, rowWidth);
  });

  readonly visibleColumnIndexes = computed(() => {
    const idIndex = this.idIndex();

    return Array.from({ length: this.columnCount() }, (_, index) => index).filter(
      (index) => index !== idIndex,
    );
  });

  readonly visibleHeaders = computed(() =>
    this.visibleColumnIndexes().map((index) => this.headers()[index] ?? ''),
  );

  readonly hasHeaderMismatch = computed(
    () => this.hasRows() && this.rows().some((row) => row.length !== this.headers().length),
  );

  readonly rowViews = computed<GridRowView[]>(() => {
    const idIndex = this.idIndex();
    const columnIndexes = this.visibleColumnIndexes();

    return this.rows().map((row, rowIndex) => ({
      trackId: idIndex >= 0 ? (row[idIndex] ?? rowIndex) : rowIndex,
      cells: columnIndexes.map((columnIndex) => {
        const cell = row[columnIndex];

        return { text: formatCellValue(cell), isBoolean: isBooleanValue(cell) };
      }),
    }));
  });

  exportCsv(): void {
    const exportedRows: string[][] = [
      this.headers(),
      ...this.rows().map((row) => row.map((cell) => formatCellValue(cell))),
    ];

    this.exportService.downloadCsv(exportedRows, `${this.exportFileName()}.csv`);
  }

  exportJson(): void {
    this.exportService.downloadJson(this.rows(), `${this.exportFileName()}.json`);
  }
}
