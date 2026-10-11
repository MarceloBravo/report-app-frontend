export type GridRow = unknown[];

export interface GridFooterItem {
  label: string;
  value: string;
}

export interface GridCellView {
  text: string;
  isBoolean: boolean;
}

export interface GridRowView {
  trackId: unknown;
  cells: GridCellView[];
}
