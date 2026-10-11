# GridTable

Componente de grilla dinámico y reutilizable. Recibe los datos por propiedades y se encarga de
formatear cada celda **según el tipo del valor**, no según la columna.

- Selector: `app-grid-table`
- Standalone, `ChangeDetectionStrategy.OnPush`.

## Datos de entrada

Las filas son **posicionales**: cada `row` es un array cuyas celdas se alinean por índice con
`headers`. El componente consumidor es responsable de normalizar sus datos a esta estructura antes
de pasarlos.

## Inputs

| Input | Tipo | ¿Opcional? | Por defecto | Finalidad |
| --- | --- | --- | --- | --- |
| `headers` | `string[]` | Sí | `[]` | Nombres de las columnas. Si está vacío, **no se renderizan las cabeceras** (se mantiene la barra superior y el resto de la grilla). |
| `rows` | `unknown[][]` | Sí | `[]` | Datos de cada fila como array posicional de celdas. Si está vacío, se ocultan la barra superior y el footer, y se muestra el mensaje vacío. |
| `idColumn` | `string` | Sí | `''` | Nombre de la columna que actúa como identificador de fila. La comparación ignora mayúsculas y separadores (`_`, `-`), por lo que `id`, `productoId` y `producto_id` coinciden entre sí. Esa columna **no se muestra**, pero su valor se usa para identificar cada fila. Si no se encuentra la columna, se usa el índice de fila. |
| `title` | `string` | Sí | `'Resultados Obtenidos'` | Título mostrado en la barra superior. |
| `subtitle` | `string` | Sí | `''` | Texto secundario de la barra superior. Si está vacío, no se muestra. |
| `icon` | `string` | Sí | `'dataset'` | Nombre del icono (Material Symbols) de la barra superior. |
| `emptyMessage` | `string` | Sí | `'Sin resultados para mostrar'` | Mensaje mostrado cuando no hay filas. |
| `exportFileName` | `string` | Sí | `'export'` | Nombre base (sin extensión) de los archivos descargados por los botones CSV/JSON. |
| `footerItems` | `GridFooterItem[]` | Sí | `[]` | Métricas del footer, cada una como `{ label, value }` (p. ej. `{ label: 'Caché', value: 'false' }`). Si no hay filas, no se renderiza. |
| `footerNote` | `string` | Sí | `''` | Nota con indicador animado a la derecha del footer. Si está vacío, no se muestra. |

### Tipos auxiliares

```ts
type GridRow = unknown[];

interface GridFooterItem {
  label: string;
  value: string;
}
```

## Conversión de valores de celda

La conversión se evalúa **celda por celda** en tiempo de render, por lo que un mismo tipo puede
aparecer en cualquier columna.

| Tipo de valor | Resultado |
| --- | --- |
| `null` / `undefined` | Cadena vacía `''` |
| `boolean` | `'Sí'` / `'No'` (renderizado como badge) |
| `Date` o string ISO de fecha | `dd/mm/AAAA hh:mm:ss` (p. ej. `01/10/2024 14:30:05`) |
| `number` | `String(valor)` |
| `string` | El propio texto |
| Objeto / otros | `JSON.stringify(valor)` |

## Exportación

- **Exportar CSV**: descarga `headers` + filas con cada celda ya formateada. Archivo: `<exportFileName>.csv`.
- **JSON**: descarga `rows` en crudo. Archivo: `<exportFileName>.json`.

Ambos botones se muestran únicamente cuando hay filas.

## Ejemplo de uso

```html
<app-grid-table
  [headers]="gridHeaders"
  [rows]="gridRows"
  idColumn="CLIENTE_ID"
  title="Resultados Obtenidos"
  subtitle="10 registros correspondientes a Q4 2024"
  [footerItems]="gridFooterItems"
  footerNote="Consulta auditada en cluster de analítica"
  exportFileName="resultados_consulta_qry_981a" />
```

```ts
readonly gridHeaders = ['CLIENTE_ID', 'NOMBRE_EMPRESA', 'ACTIVO'];
readonly gridRows: unknown[][] = [
  ['CLI-8941', 'Acorn Tech Global', true],
  ['CLI-7820', 'Fintech Dynamics Corp', false],
];
readonly gridFooterItems = [{ label: 'Tiempo de Ejecución', value: '48ms' }];
```

En este ejemplo, `CLIENTE_ID` no se muestra pero se usa para identificar cada fila.
