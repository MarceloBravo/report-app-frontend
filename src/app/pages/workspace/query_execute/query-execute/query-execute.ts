import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MainMenu } from '../../../../components/main-menu/main-menu';
import { Header } from '../../../../components/header/header';
import { Breadcrumbs } from '../../../../components/breadcrumbs/breadcrumbs';
import { GridTable } from '../../../../components/grid-table/grid-table';
import { ConvertQueryRequestInterface } from '../../../../interfaces/convertQueryRequestInterface';
import { ConvertQueryResponseInterface } from '../../../../interfaces/convertQueryResponseInterface';
import { ConnectionResponseInterface } from '../../../../interfaces/connectionResponseInterface';
import type { GridFooterItem } from '../../../../interfaces/gridTableInterface';
import { Connections } from '../../../../services/connections/connections';
import { ExportService } from '../../../../services/export/export.service';
import { QueryExecuteService } from '../../../../services/query-excecute/query-execute-service';
import { toGridData } from '../../../../utils/grid-data';

export interface ConnectionGroup {
  dbName: string;
  connections: { dbConnectionId: string; schemaName: string }[];
}

@Component({
  selector: 'app-query-execute',
  imports: [MainMenu, Header,Breadcrumbs, GridTable],
  templateUrl: './query-execute.html',
  styleUrl: './query-execute.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryExecute {
  // Prompt shown in the UI
  placeholderText = 'Ej.: ¿Cuáles fueron los 10 clientes con mayor facturación en el último trimestre de 2024 agrupados por país y segmento?';
  promptText = '';

  // SQL shown in the textarea
  rawSql = `SELECT 
  c.cliente_id,
  c.nombre_empresa,
  c.pais,
  c.segmento,
  COUNT(f.factura_id) AS total_operaciones,
  ROUND(SUM(f.monto_total)::numeric, 2) AS facturacion_usd
FROM clientes c
JOIN facturas f ON c.cliente_id = f.cliente_id
WHERE f.fecha_emision BETWEEN '2024-10-01' AND '2024-12-31'
  AND f.estado = 'PAGADA'
GROUP BY c.cliente_id, c.nombre_empresa, c.pais, c.segmento
ORDER BY facturacion_usd DESC
LIMIT 10;`;

  // UI feedback labels
  promptCopyFeedback = 'Copiar Prompt';
  sqlCopyFeedback = 'Copiar SQL';

  // Grouped database connections for the selector
  readonly connectionGroups = signal<ConnectionGroup[]>([]);
  readonly selectedConnectionId = signal('');
  readonly isConverting = signal(false);
  readonly canConvert = computed(
    () => this.selectedConnectionId().length > 0 && this.promptText.trim().length > 0,
  );

  // Result metadata of the last conversion
  readonly queryResult = signal<ConvertQueryResponseInterface | null>(null);
  readonly queryStatus = signal<'success' | 'error'>('success');
  readonly errorCode = signal<number | null>(null);
  readonly elapsedMs = signal<number | null>(null);

  private readonly dateFormatter = new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  readonly statusText = computed(() =>
    this.queryStatus() === 'success'
      ? 'Exitosa (200 OK)'
      : `Fallida (Cod error ${this.errorCode() ?? '?'})`,
  );
  readonly statusPillClass = computed(() =>
    this.queryStatus() === 'success'
      ? 'bg-emerald-500/10 text-emerald-400'
      : 'bg-error/10 text-error',
  );
  readonly statusDotClass = computed(() =>
    this.queryStatus() === 'success' ? 'bg-emerald-400' : 'bg-error',
  );
  private readonly timeFormatter = new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  readonly elapsedTimeLabel = computed(() => {
    const ms = this.elapsedMs() ?? 0;
    if (ms < 0) return '0:00:00';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });
  readonly registrosCountLabel = computed(() => this.queryResult()?.registrosCount ?? 0);
  readonly fechaConsultaFormatted = computed(() => {
    const fecha = this.queryResult()?.fechaConsulta;
    return fecha ? this.dateFormatter.format(new Date(fecha)) : '—';
  });

  // Results rendered by the reusable grid, derived from the service response
  private readonly gridData = computed(() => toGridData(this.queryResult()?.data ?? []));
  readonly gridHeaders = computed(() => this.gridData().headers);
  readonly gridRows = computed(() => this.gridData().rows);
  readonly gridSubtitle = computed(() => {
    const result = this.queryResult();
    return result ? `${result.registrosCount} registros retornados` : '';
  });
  readonly gridFooterItems = computed<GridFooterItem[]>(() => [
    { label: 'Tiempo de Ejecución', value: this.elapsedTimeLabel() },
    { label: 'Estado', value: this.queryStatus() === 'success' ? 'OK' : 'Error' },
  ]);

  constructor(
    private exportService: ExportService,
    private readonly connectionsService: Connections,
    private readonly queryExecuteService: QueryExecuteService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.connectionsService
      .getConnections()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (connections) => this.connectionGroups.set(this.groupByDbName(connections)),
      });
  }

  onConnectionChange(event: Event): void {
    this.selectedConnectionId.set((event.target as HTMLSelectElement).value);
  }

  onPromptInput(event: Event): void {
    this.promptText = (event.target as HTMLInputElement).value;
  }

  onPromptKeydown(event: Event): void {
    if ((event as KeyboardEvent).key === 'Enter') {
      event.preventDefault();
      this.convertQuery();
    }
  }

  convertQuery(): void {
    if (!this.canConvert() || this.isConverting()) {
      return;
    }

    const payload: ConvertQueryRequestInterface = {
      preguntaUsuario: this.promptText.trim(),
      dbConnectionId: this.selectedConnectionId(),
    };

    this.isConverting.set(true);

    const startedAt = performance.now();

    this.queryExecuteService
      .convertir(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.elapsedMs.set(Math.round(performance.now() - startedAt));
          this.isConverting.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.queryResult.set(response);
          this.queryStatus.set('success');
          this.rawSql = response.querySqlGenerada;
        },
        error: (error: HttpErrorResponse) => {
          this.queryStatus.set('error');
          this.errorCode.set(error.status);
          this.temporarilySetSqlFeedback('Error al convertir');
        },
      });
  }

  private groupByDbName(connections: ConnectionResponseInterface[]): ConnectionGroup[] {
    const groups = new Map<string, ConnectionGroup>();

    for (const connection of connections) {
      const group = groups.get(connection.dbName) ?? { dbName: connection.dbName, connections: [] };
      group.connections.push({
        dbConnectionId: connection.dbConnectionId,
        schemaName: connection.schemaName,
      });
      groups.set(connection.dbName, group);
    }

    return [...groups.values()];
  }

  async copyPrompt(): Promise<void> {
    const text = String(this.promptText).replace(/^"|"$/g, '');
    await this.exportService.writeToClipboard(text);
    this.temporarilySetPromptFeedback('¡Copiado!');
  }

  async copySql(): Promise<void> {
    await this.exportService.writeToClipboard(this.rawSql);
    this.temporarilySetSqlFeedback('¡SQL Copiado!');
  }

  exportTableToCSV(filename?: string): void {
    const rows = [
      this.gridHeaders(),
      ...this.gridRows().map((row) => row.map((cell) => String(cell ?? ''))),
    ];

    this.exportService.downloadCsv(rows, filename ?? 'consulta_sql_export.csv');
  }

  exportTableToJSON(): void {
    this.exportService.downloadJson(
      this.queryResult()?.data ?? [],
      'resultados_consulta_qry_981a.json',
    );
  }

  // clipboard and download helpers moved to ExportService

  private temporarilySetPromptFeedback(message: string): void {
    const prev = this.promptCopyFeedback;
    this.promptCopyFeedback = message;
    setTimeout(() => { this.promptCopyFeedback = prev; }, 2000);
  }

  private temporarilySetSqlFeedback(message: string): void {
    const prev = this.sqlCopyFeedback;
    this.sqlCopyFeedback = message;
    setTimeout(() => { this.sqlCopyFeedback = prev; }, 2000);
  }
}
