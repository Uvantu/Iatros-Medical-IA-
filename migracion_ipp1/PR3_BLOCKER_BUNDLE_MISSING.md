# PR3 - Bloqueo actual

## Hecho confirmado
El repo remoto si contiene `Entrenador Virtual/index.html` y ese archivo referencia `app.bundle.js` como bundle activo de runtime.

## Bloqueo
El archivo `Entrenador Virtual/app.bundle.js` no esta versionado en el repositorio remoto en la rama de trabajo actual.

## Consecuencia
No se puede completar en GitHub la sustitucion controlada hacia `legacy-bridge` porque faltan los puntos reales de cableado del runtime.

## Lo que si ya esta listo en main
- `src/ui/helpers/route-labels.js`
- `src/ui/renderers/simulation-routes.js`
- `src/ui/renderers/heuristic-recommendation.js`
- `src/ui/renderers/adaptive-recommendation.js`
- `src/ui/index.js`
- `src/ui/legacy-bridge.js`
- `src/ui/default-bridge.js`

## Para desbloquear PR3
Subir al repositorio los archivos activos del frontend local:
- `Entrenador Virtual/app.bundle.js`
- `Entrenador Virtual/server.js` (si forma parte del runtime versionado)
- cualquier archivo de entrada o build que consuma el bundle real

## Una vez subidos
Los puntos a sustituir son:
1. `renderRecommendation`
2. `renderAdaptiveRecommendation`
3. `renderSimulationRoutes`
4. `buildRouteRoleLabel`
5. cableado en `renderApp()`
6. conservacion de `safeRender`
