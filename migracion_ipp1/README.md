# Migracion IPP1 -> UI modular

## Estado
- app.bundle.js estable y funcional
- server.js estable y funcional
- UI modular creada en src/ui
- bridges verificados por smoke tests

## Modulos ya listos
- src/ui/helpers/route-labels.js
- src/ui/renderers/simulation-routes.js
- src/ui/renderers/adaptive-recommendation.js
- src/ui/renderers/heuristic-recommendation.js
- src/ui/index.js
- src/ui/legacy-bridge.js
- src/ui/default-bridge.js

## Siguiente paso tecnico
Reemplazar gradualmente funciones del bundle por llamadas al bridge modular, empezando por:
1. renderRecommendation
2. renderAdaptiveRecommendation
3. renderSimulationRoutes
4. buildRouteRoleLabel

## Regla
No tocar el bundle activo sin respaldo inmediato.
