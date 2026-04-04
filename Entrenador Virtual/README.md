# Entrenador Virtual

MVP local para un asistente de entrenamiento adaptativo orientado a armwrestling y fuerza bruta transferible.

## Que incluye esta base

- Perfil inicial del atleta y base de datos fija en SQLite.
- Check-in diario con dolor, fatiga, readiness y tiempo disponible.
- Logger de sesiones con datos de mesa y limitacion principal.
- Logger de ejercicios individuales por sesion.
- Soporte para esfuerzos dinamicos y holds isometricos por tiempo.
- Guardado por ejercicio de carga, reps, sets, RPE y marca de RM confirmado.
- Calculo automatico de RM teorico o confirmado segun los datos disponibles.
- Objetivo de la proxima sesion por ejercicio segun RPE y dolor.
- Motor de recomendacion determinista con reglas y scoring auditable.
- Resumen post-sesion con lectura de limitacion raiz.
- Tablero semanal con exposicion por patron, sets, dolor y ejercicios rentables.
- Panel con contexto actual, recomendacion del dia, sesiones recientes y records por ejercicio.

## Que rescatamos de ENARM

- Persistencia simple, robusta y auditable.
- Motor de priorizacion por score en lugar de reglas sueltas.
- Separacion entre datos, logica de negocio y UI.
- Documentacion de capas, filtros duros y trazabilidad.

## Como usarlo

```powershell
cd C:\Users\Usuario\Desktop\Entrenador Virtual
.\serve.ps1
```

Luego abre `http://localhost:8000`.

La base se guardara en `C:\Users\Usuario\Desktop\Entrenador Virtual\data\entrenador-virtual.sqlite`.

`index.html` directo ya no es el flujo correcto si quieres persistencia real; para usar la base fija abre siempre la app con servidor local.

## Simular progresiones

```powershell
cd C:\Users\Usuario\Desktop\Entrenador Virtual
node .\scripts\simulate-progressions.js
```

Esto regenera:

- `docs/simulaciones-progresion.md`
- `docs/simulaciones-progresion.json`

## Estructura

- `index.html`: shell principal.
- `styles.css`: interfaz responsiva.
- `server.js`: servidor HTTP local y API con SQLite.
- `scripts/simulate-progressions.js`: simulador de progresiones y reporte comparativo.
- `src/seed.js`: perfil inicial, datos semilla y catalogos.
- `src/storage.js`: cliente de la API local.
- `src/engine.js`: estado derivado, heuristicas y scoring de sesiones.
- `src/ui.js`: renderizado del dashboard.
- `src/app.js`: eventos y orquestacion.
- `docs/auditoria-enarm.md`: que sirve y que no del proyecto ENARM.
- `docs/arquitectura-entrenador-virtual.md`: esquema objetivo y plan de evolucion.

## Siguiente etapa recomendada

1. Agregar filtros y comparativas por brazo en records y RM.
2. Aadir ajuste intra-sesion y reprogramacion semanal automatica.
3. Separar el motor de reglas en modulos por dolor, fatiga, transferencia y tolerancia de tejido.
4. Migrar la base a TypeScript cuando el modelo de datos ya este estable.
