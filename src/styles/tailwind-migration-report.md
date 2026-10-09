# Informe de migración Tailwind → Sass

Fecha: 2026-10-08

Resumen:

- Escaneado: `src/` (HTML, templates y componentes). Se detectaron numerosas utilidades Tailwind y clases basadas en tokens (`bg-surface*`, `text-on-surface*`, etc.).
- Objetivo: convertir utilidades Tailwind a clases Sass/semánticas como en `src/app/pages/onboarding`.

Hallazgos principales (ejemplos):

- Layout y espaciamiento: `flex`, `flex-col`, `flex-wrap`, `items-center`, `justify-between`, `gap-1|2|3|4`, `px-3|4|5|8`, `py-1.5|2.5`, `pl-72`, `pt-16`, `w-full`, `min-h-screen`, `h-full`, `w-72`, `overflow-hidden`, `overflow-x-auto`.
- Tipografía: `text-2xl`, `text-sm`, `text-xs`, `text-[10px]`, `text-[11px]`, `text-[14px]`, `text-[15px]`, `text-[16px]`, `text-[18px]`, `font-headline`, `font-label`, `font-body`, `tracking-tight`, `uppercase`, `font-semibold`, `font-medium`, `leading-relaxed`, `whitespace-pre`, `font-mono`, `truncate`.
- Colores / tokens: `bg-surface`, `bg-surface-container-lowest`, `bg-surface-container-low`, `bg-surface-container`, `bg-surface-container-high`, `bg-surface-container-highest`, `bg-primary`, `bg-primary-fixed`, `text-on-surface`, `text-on-surface-variant`, `text-outline`, `text-primary`, `bg-emerald-400`, `bg-amber-400`, `bg-error`, `bg-cyan-950`, `bg-indigo-950`, `bg-blue-950`, `bg-secondary`, `bg-tertiary`, y variantes con opacidad (`/50`, `/60`, `/10`).
- Bordes/sombra/transiciones: `rounded-md|lg|xl|full`, `shadow-sm|md|lg`, `transition-colors`, `transition-all`, `animate-pulse`.
- Otros: `inline-flex`, `group-hover:*`, `selection:*`, `grid`, `grid-cols-[3rem_1fr]`, `sm:`, `md:` prefijos responsivos, y utilidades con valores arbitrarios como `text-[15px]`, `grid-cols-[3rem_1fr]`.

Clasificación para la migración:

- Auto-mapeables (pueden añadirse como utilidades Sass y aplicarse con reemplazo global): clases estáticas tipo `flex`, `items-center`, `gap-3`, `px-3`, `py-1.5`, `rounded-lg`, `shadow-md`, `text-sm`, `text-xs`, `w-full`, `pl-72`, `bg-primary`, `text-on-surface`.
- Requieren atención manual:
  - Variantes responsivas (`sm:`, `md:`): necesitan mixins o reescritura a clases semánticas.
  - Valores arbitrarios (`text-[15px]`, `grid-cols-[3rem_1fr]`): preferible convertir a clases semánticas o crear utilidades de nombre fijo (`.text-15`, `.grid-cols-custom-3rem-1fr`).
  - Opacidades integradas (`bg-foo/50`): mapear a clases con color RGBA o usar utilidades `--opacity`.

Recomendación de proceso (incremental, seguro):

1. Añadir un partial Sass global con utilidades auto-mapeables (ya creado: `_tailwind-compat.sass` y se añadió un archivo extendido).
2. Ejecutar un reemplazo controlado en plantillas para sustituir utilidades estándar por sus equivalentes Sass (o mantener utilidades si ya funcionan vía compat partial).
3. Tratar los casos complejos uno a uno (responsivos, arbitrarios) transformándolos a clases semánticas en los componentes.
4. Quitar el CDN/config de Tailwind cuando el coverage sea total y la app visual sea equivalente.

Siguientes pasos propuestos (puedo ejecutar ahora):

- Generar automáticamente un partial Sass extendido con mappings para las utilidades simples detectadas (creado como `_tailwind-compat-extended.sass`).
- Añadirlo a `src/styles.sass` y comprobar estilos (reload).
- Opcional: aplicar cambios de reemplazo en archivos HTML/templantes para usar las nuevas clases (solo si das OK).

Solicita: responde `continuar` para que aplique el partial extendido y actualice `src/styles.sass`, o `reemplazar` para que además ejecute un reemplazo automático de clases en plantillas.
