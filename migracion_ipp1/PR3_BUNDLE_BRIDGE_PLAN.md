# PR3 - Bridge al bundle activo

## Objetivo
Conectar el bundle activo de la app con la UI modular ya integrada en `main`.

## Alcance
- cablear `renderRecommendation` al bridge
- cablear `renderAdaptiveRecommendation` al bridge
- cablear `renderSimulationRoutes` al bridge
- sustituir `buildRouteRoleLabel` local por la version del bridge
- mantener fallbacks y `safeRender`

## Regla
No rehacer el frontend completo en este PR.
Solo sustituir puntos de entrada del runtime actual por el bridge modular.

## Criterios de cierre
- la app sigue cargando
- la recomendacion del dia sigue renderizando
- la simulacion adaptativa sigue renderizando
- no reaparecen errores por helpers faltantes
