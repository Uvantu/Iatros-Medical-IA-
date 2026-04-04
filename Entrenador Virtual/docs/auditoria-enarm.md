# Auditoria ENARM -> Entrenador Virtual

## Lo que si conviene rescatar

### 1. Motor de priorizacion por score
El proyecto ENARM no decide con una sola regla; ordena candidatos con puntuaciones, penalizaciones y desempates.

Eso sirve mucho aqui porque el asistente deportivo tambien necesita balancear:

- objetivo dominante;
- debilidad real;
- dolor;
- fatiga;
- interferencia con mesa;
- redundancia reciente.

### 2. Persistencia local simple
La estrategia de guardar estado y metricas en `localStorage` permite un MVP funcional sin backend.

Para este nuevo proyecto, esa idea se reutiliza como:

- perfil del atleta;
- check-ins diarios;
- sesiones recientes.

### 3. Separacion entre datos, dominio y UI
ENARM ya tenia una intuicion correcta:

- datos del banco;
- logica adaptativa;
- render de interfaz.

Aqui lo traducimos a:

- `seed.js` y `storage.js`;
- `engine.js`;
- `ui.js` y `app.js`.

### 4. Enfoque schema-first
La parte mas fuerte de ENARM no es la SPA, sino su obsesion por capas, slots, filtros duros y trazabilidad.

Eso se puede rescatar como filosofia:

- ontologia de patrones;
- estructura fija para check-ins y sesiones;
- reglas duras de dolor / interferencia;
- decisiones auditablemente explicables.

## Lo que no conviene copiar

### 1. Modelo de preguntas y dificultad
La logica de `questions`, `respuesta_correcta`, `tema`, `subtema` y `difficultyScore` es propia de un simulador tipo examen.

No se traslada al dominio de entrenamiento.

### 2. UI secuencial de quiz
Pantalla unica de pregunta -> respuesta -> feedback no sirve para un sistema de coaching.

Aqui necesitamos:

- captura diaria;
- bitacora;
- recomendacion;
- contexto reciente.

### 3. Semantica de banco ENARM
Los codebooks de pregunta, trampas, distractores y validacion editorial son valiosos como ejemplo de calidad, pero no como modelo directo de datos.

## Traduccion conceptual

| ENARM | Entrenador Virtual |
|---|---|
| banco de preguntas | banco de sesiones candidatas |
| filtro por tema | filtro por contexto fisiologico |
| scoring adaptativo | scoring de sesion recomendada |
| validacion de reactivo | seguridad / tolerancia de tejido |
| metricas por pregunta | metricas por patron / sesion |
| quality-system | reglas deterministas y ontologia de entrenamiento |

## Conclusion

Lo reutilizable de ENARM no es el producto visual, sino el esqueleto mental:

1. datos normalizados;
2. estado persistente;
3. motor de decision con score;
4. capas separadas;
5. reglas auditablemente explicables.
