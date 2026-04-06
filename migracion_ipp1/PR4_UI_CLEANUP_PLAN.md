# PR4 - Limpieza UI tras integrar bridge

## Objetivo
Consolidar el runtime despues del merge del bridge.

## Alcance
- reducir duplicacion entre ui-bridge.js y app.bundle.js
- normalizar textos y acentos
- dejar claro que vive en bridge y que vive en bundle
- agregar smoke-checklist versionado
- no reescribir toda la app
## Smoke checklist
- app carga
- recomendación heurística ok
- recomendación adaptativa ok
- rutas simuladas ok
- consola sin errores de bridge
