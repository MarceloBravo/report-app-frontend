import { Component } from '@angular/core';
import { ExportService } from '../../services/export/export.service';

@Component({
  selector: 'app-grid-table',
  imports: [],
  templateUrl: './grid-table.html',
  styleUrl: './grid-table.sass',
})
export class GridTable {
  private rows = [
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

  private jsonData = [
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

  constructor(private exportService: ExportService) {}

  exportCsv(filename?: string): void {
    this.exportService.downloadCsv(this.rows, filename);
  }

  exportJson(): void {
    this.exportService.downloadJson(this.jsonData, 'resultados_consulta_qry_981a.json');
  }
}
