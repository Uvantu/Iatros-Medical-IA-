# Estado estable IPP1

## Integraciones activas
- IPP1 integrado al ciclo principal
- Endpoint /api/ipp-cycle activo
- Recomendacion adaptativa renderizando
- Resumen IPP1 visible en UI
- Blindaje de render con safeRender

## Backups locales
- app.bundle.ipp1-estable.js
- server.ipp1-estable.js

## Errores ya corregidos
- payload undefined en renderRecommendation
- renderAdaptiveRecommendation is not defined
- buildAdaptiveExerciseMarkup is not defined
- buildRouteRoleLabel is not defined

## Siguiente capa
- extraer renderAdaptiveRecommendation fuera de app.bundle.js
- extraer renderSimulationRoutes fuera de app.bundle.js
- centralizar helpers de rutas
- limpiar textos con acentos rotos
