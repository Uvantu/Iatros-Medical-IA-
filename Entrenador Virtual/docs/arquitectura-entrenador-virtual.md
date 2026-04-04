# Arquitectura propuesta para Entrenador Virtual

## MVP funcional actual

```text
Entrenador Virtual/
â”œâ”€â”€ index.html
â”œâ”€â”€ styles.css
â”œâ”€â”€ serve.ps1
â”œâ”€â”€ package.json
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app.js
â”‚   â”œâ”€â”€ engine.js
â”‚   â”œâ”€â”€ seed.js
â”‚   â”œâ”€â”€ storage.js
â”‚   â””â”€â”€ ui.js
â””â”€â”€ docs/
    â”œâ”€â”€ auditoria-enarm.md
    â””â”€â”€ arquitectura-entrenador-virtual.md
```

## Capas del sistema

### 1. Memoria permanente
Responsabilidad:

- perfil del atleta;
- fortalezas y debilidades;
- restricciones y equipo disponible.

Archivo actual:

- `src/seed.js`

### 2. Memoria operativa
Responsabilidad:

- check-ins diarios;
- sesiones reales;
- ventana reciente de 7-21 dias.

Archivo actual:

- `src/storage.js`

### 3. Motor de inferencia
Responsabilidad:

- construir el estado actual;
- detectar banderas;
- puntuar sesiones candidatas;
- producir explicacion y trade-offs.

Archivo actual:

- `src/engine.js`

### 4. Presentacion
Responsabilidad:

- formularios;
- paneles;
- recomendacion del dia;
- historial corto.

Archivos actuales:

- `index.html`
- `styles.css`
- `src/ui.js`
- `src/app.js`

## Modelo de datos recomendado

### athlete_profile

- `athlete_id`
- `display_name`
- `primary_goal`
- `secondary_goal`
- `current_strength_profile`
- `priority_distribution`
- `constraints`
- `equipment_available`

### daily_checkin

- `date`
- `sleep_hours`
- `readiness`
- `bodyweight`
- `pain`
- `fatigue`
- `available_time_min`
- `session_type_planned`

### session

- `session_id`
- `date`
- `session_type`
- `goal_of_session`
- `effort_rpe_session`
- `results`
- `pain_events`

## Siguiente estructura recomendada para V2

```text
src/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ bootstrap.ts
â”‚   â””â”€â”€ routes/
â”œâ”€â”€ domain/
â”‚   â”œâ”€â”€ athlete/
â”‚   â”œâ”€â”€ checkin/
â”‚   â”œâ”€â”€ session/
â”‚   â”œâ”€â”€ recommendation/
â”‚   â””â”€â”€ ontology/
â”œâ”€â”€ engine/
â”‚   â”œâ”€â”€ rules/
â”‚   â”œâ”€â”€ scoring/
â”‚   â”œâ”€â”€ state/
â”‚   â””â”€â”€ explanations/
â”œâ”€â”€ persistence/
â”‚   â”œâ”€â”€ sqlite/
â”‚   â””â”€â”€ repositories/
â”œâ”€â”€ ui/
â”‚   â”œâ”€â”€ dashboard/
â”‚   â”œâ”€â”€ forms/
â”‚   â”œâ”€â”€ history/
â”‚   â””â”€â”€ recommendation/
â””â”€â”€ shared/
    â”œâ”€â”€ constants/
    â”œâ”€â”€ utils/
    â””â”€â”€ schemas/
```

## Roadmap realista

### Version 1

- perfil base;
- check-in diario;
- logger de sesion;
- recomendacion determinista;
- explicacion humana.

### Version 2

- logger de ejercicios individuales;
- ajuste intra-sesion;
- dashboard semanal;
- banderas de dolor y fatiga mas finas.

### Version 3

- SQLite o backend ligero;
- comparativas entre bloques;
- reprogramacion semanal automatica;
- explicaciones asistidas por LLM sobre una base de reglas estable.

## Decision tecnica recomendada

Para no perder velocidad:

1. mantener este MVP en JavaScript modular;
2. consolidar reglas y esquema de datos;
3. migrar luego a TypeScript + React cuando la ontologia ya este estable;
4. mover persistencia a SQLite cuando el logger de ejercicios ya no quepa limpio en `localStorage`.
