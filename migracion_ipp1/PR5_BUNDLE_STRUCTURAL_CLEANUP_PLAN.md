# PR5 - Bundle structural cleanup

## Objetivo
Reducir duplicacion residual entre app.bundle.js y ui-bridge.js sin romper el runtime.

## Alcance
- simplificar renderRecommendation
- simplificar renderAdaptiveRecommendation
- simplificar renderSimulationRoutes
- mantener fallbacks minimos
- conservar smoke test manual
- no rehacer frontend
