# Auditoría técnica de Iatros Medical IA

## Diagnóstico del repositorio actual

El repositorio actual resuelve únicamente la primera capa del flujo: cargar un PDF y renderizarlo en canvas.

### Fortalezas
- usa PDF.js de forma funcional para visualización;
- tiene una base mínima, fácil de ampliar;
- la UI inicial es clara para pruebas rápidas.

### Debilidades estructurales
- no extrae texto por página;
- no conserva trazabilidad clínica del fragmento fuente;
- no existe modelo intermedio entre PDF bruto y pregunta;
- no hay validaciones contra deriva semántica;
- no existe una salida estructurada exportable;
- no hay separación entre visualización y normalización clínica.

## Lo que cambia realmente la calidad

No hacía falta añadir más interfaz primero. Hacía falta interponer una capa explícita entre el PDF y el sistema de preguntas:

1. `medical extract record`
2. `simplified fact`
3. validación mínima de trazabilidad
4. revisión clínica posterior

## Mejora propuesta

Se añadió una propuesta de workbench en la carpeta `workbench/` y plantillas en `quality-system/`.

### Carpeta `workbench/`
Contiene una versión lista para integración de:
- `App.next.jsx`
- `PdfViewer.next.jsx`
- `ExtractionWorkbench.jsx`
- `extractionWorkbench.js`
- `styles.next.css`

### Carpeta `quality-system/`
Contiene:
- `enarm-medical-extraction-codebook.json`
- `medical-extract-record-template.json`
- `medical-simplified-fact-template.json`

## Criterio de diseño

Esta propuesta no intenta saltar directamente a preguntas. Primero obliga a:
- conservar página exacta;
- conservar fragmento bruto;
- generar un hecho operativo;
- exportarlo con estatus controlado.

## Siguiente integración recomendada

1. mover `workbench/App.next.jsx` sobre `src/App.jsx`
2. mover `workbench/PdfViewer.next.jsx` sobre `src/components/PdfViewer.jsx`
3. mover `workbench/styles.next.css` sobre `src/styles.css`
4. copiar `workbench/ExtractionWorkbench.jsx` a `src/components/`
5. copiar `workbench/extractionWorkbench.js` a `src/lib/`
6. después persistir los JSON exportados en una base certificada
