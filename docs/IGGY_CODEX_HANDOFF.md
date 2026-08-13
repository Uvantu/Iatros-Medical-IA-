# IGGY CODEX HANDOFF — Start Here

## User instruction to Codex

When the user opens the Codex app, they can say:

> **Busca las instrucciones Iggy en el repositorio `Uvantu/Iatros-Medical-IA-`, léelas completas y ejecuta únicamente la fase de descubrimiento/mapeo de mis carpetas de Medicina. No muevas, renombres ni borres nada todavía.**

Codex should then read:

- `/AGENTS.md`
- `/docs/IGGY_MASTER_PROTOCOL.md`
- `/docs/IGGY_CODEX_HANDOFF.md`

## Current objective

Build a faithful logical map of the user's existing Medicine filesystem and use it as the physical memory layer for Iggy.

Do not begin by creating a new semester hierarchy. First learn the existing one.

## First-run procedure

1. Confirm the repository instructions have been read.
2. Identify the user's real Medicine root folder on the PC.
3. Run a read-only topology scan.
4. Detect semester/cycle folders, course folders, documents, and likely aliases.
5. Identify any existing IATROS directories, master files, indexes, and old organization systems.
6. Mark historical semesters as protected.
7. Build a manifest and folder map.
8. Propose a non-destructive Iggy overlay.
9. Stop before physical reorganization.

## Required first-run output

Codex should report:

- `ROOT_OBSERVED`
- `HISTORICAL_SEMESTERS_FOUND`
- `CURRENT_SEMESTER_RELEVANT_PATHS`
- `IATROS_PATHS_FOUND`
- `AMBIGUOUS_AREAS`
- `DUPLICATE_CANDIDATES`
- `PROPOSED_OVERLAY`
- `MUTATIONS_APPLIED: NONE`
- `NEXT_RECOMMENDED_STEP`

## Current 2026-II logical coordinates

The overlay should be able to retrieve sources for:

- Cardiología
- Uro-Nefrología
- Hematología
- Gastroenterología
- Neumología
- Obstetricia
- Farmacoterapéutica
- Salud y Medio Ambiente
- Antropología Médica

User-declared density ranking currently known:

`Cardiología > Uro-Nefrología > Hematología`

Treat this as a planning signal, not as a judgment of cognitive mastery.

## Important conceptual correction

Do **not** treat `IGGY_MASTER.md` as a giant encyclopedia that must contain every piece of content.

The master layer should be closer to a bootloader/router:

- identity and operating contract;
- active state;
- indexes;
- relationships;
- priorities;
- provenance pointers;
- instructions for producing task-specific views.

The physical files remain the memory. Structured manifests become canonical navigation metadata. Markdown views remain regenerable.

## Durable principle

The purpose is not to make the filesystem visually perfect.

The purpose is to make the user's knowledge retrievable with minimal friction while preserving historical context and source integrity.
