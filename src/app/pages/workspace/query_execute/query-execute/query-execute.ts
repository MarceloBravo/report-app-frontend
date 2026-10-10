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
import { Connections } from '../../../../services/connections/connections';
import { ExportService } from '../../../../services/export/export.service';
import { QueryExecuteService } from '../../../../services/query-excecute/query-execute-service';

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
      ["CLIENTE_ID", "NOMBRE_EMPRESA", "PAIS", "SEGMENTO", "TOTAL_OPERACIONES", "FACTURACION_USD"],
      ["CLI-8941", "Acorn Tech Global", "España", "Enterprise", "142", "482950.00"],
      ["CLI-7820", "Fintech Dynamics Corp", "México", "Enterprise", "98", "394200.50"],
      ["CLI-9031", "NovaRetail Latam", "Chile", "Corporate", "120", "356800.00"],
      ["CLI-6419", "BioGenetics Lab", "Colombia", "Enterprise", "85", "312450.00"],
      ["CLI-5524", "Andes Logistics SA", "Perú", "Mid-Market", "64", "289100.00"],
      ["CLI-4103", "Iberia Telecom", "España", "Enterprise", "114", "276430.20"],
      ["CLI-3329", "Atlas Mining Co", "Chile", "Corporate", "52", "241890.00"],
      ["CLI-2910", "Pacific Cloud Services", "Argentina", "Enterprise", "88", "219500.00"],
      ["CLI-1845", "Vanguard Media", "México", "Mid-Market", "43", "195340.75"],
      ["CLI-1022", "Zenith Commerce", "España", "Mid-Market", "71", "178210.00"]
    ];

    this.exportService.downloadCsv(rows, filename ?? 'consulta_sql_export.csv');
  }

  exportTableToJSON(): void {
    const data = [
      { cliente_id: "CLI-8941", nombre_empresa: "Acorn Tech Global", pais: "España", segmento: "Enterprise", total_operaciones: 142, facturacion_usd: 482950.00 },
      { cliente_id: "CLI-7820", nombre_empresa: "Fintech Dynamics Corp", pais: "México", segmento: "Enterprise", total_operaciones: 98, facturacion_usd: 394200.50 },
      { cliente_id: "CLI-9031", nombre_empresa: "NovaRetail Latam", pais: "Chile", segmento: "Corporate", total_operaciones: 120, facturacion_usd: 356800.00 },
      { cliente_id: "CLI-6419", nombre_empresa: "BioGenetics Lab", pais: "Colombia", segmento: "Enterprise", total_operaciones: 85, facturacion_usd: 312450.00 },
      { cliente_id: "CLI-5524", nombre_empresa: "Andes Logistics SA", pais: "Perú", segmento: "Mid-Market", total_operaciones: 64, facturacion_usd: 289100.00 },
      { cliente_id: "CLI-4103", nombre_empresa: "Iberia Telecom", pais: "España", segmento: "Enterprise", total_operaciones: 114, facturacion_usd: 276430.20 },
      { cliente_id: "CLI-3329", nombre_empresa: "Atlas Mining Co", pais: "Chile", segmento: "Corporate", total_operaciones: 52, facturacion_usd: 241890.00 },
      { cliente_id: "CLI-2910", nombre_empresa: "Pacific Cloud Services", pais: "Argentina", segmento: "Enterprise", total_operaciones: 88, facturacion_usd: 219500.00 },
      { cliente_id: "CLI-1845", nombre_empresa: "Vanguard Media", pais: "México", segmento: "Mid-Market", total_operaciones: 43, facturacion_usd: 195340.75 },
      { cliente_id: "CLI-1022", nombre_empresa: "Zenith Commerce", pais: "España", segmento: "Mid-Market", total_operaciones: 71, facturacion_usd: 178210.00 }
    ];

    this.exportService.downloadJson(data, 'resultados_consulta_qry_981a.json');
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
