# IATROS-IGGY — ACTIVE ORDER

Order ID: `IGGY-2026II-001`
Status: **ACTIVE**
Issued: 2026-08-16
Scope: Semester Brain 2026-II

## Mission
Begin building the real IATROS-IGGY Semester Brain from the user's existing Medicine archive without reorganizing historical semesters.

The current objective is **not** to collect everything indiscriminately. It is to establish a verified semester baseline, inherit valid prior-semester memory, identify deltas, and concentrate acquisition effort where the current semester is genuinely new.

## Governing documents
Read and obey, in this order:

1. `/AGENTS.md`
2. `/docs/IGGY_MASTER_PROTOCOL.md`
3. `/docs/IGGY_CODEX_HANDOFF.md`
4. this file

If a conflict appears, stop and report it rather than silently choosing.

---

## ORDER 1 — Read-only discovery of the real Medicine archive

Locate or ask the user for the actual local Medicine root. Do not invent a path.

Perform a read-only topology pass and identify:

- semester/cycle folders;
- subject folders;
- teacher-specific folders;
- programs and course schedules;
- PDFs, notes, presentations, question banks and exams;
- previous Obstetricia corpus;
- previous Farmacoterapéutica corpus;
- current-cycle VII material already present;
- possible IATROS folders and pre-existing manifests;
- ambiguous regions.

Do **not** move, rename, delete, merge or overwrite anything.

Output a manifest and map according to `IGGY_MASTER_PROTOCOL.md`.

---

## ORDER 2 — Protect historical semester memory

All previous Medicine semester/cycle folders are `PROTECTED_HISTORY` by default.

Historical material may be:

- indexed;
- tagged;
- linked logically;
- hashed selectively;
- reused as prerequisite memory;
- compared with current material.

It may not be physically migrated merely to make the new architecture look cleaner.

---

## ORDER 3 — Obstetricia and Farmacoterapéutica are inherited baselines

User declaration `[C]`:

> The user already has the Obstetricia and pharmacology/farmacotherapeutics material from the previous semester. These subjects should not be rebuilt from zero. They should be updated only for changes introduced in the new run of the course.

Therefore classify both subjects initially as:

`BASELINE_INHERITED_PENDING_LOCAL_VERIFICATION`

Do not claim exact inherited contents until observed locally `[O]`.

Required workflow:

`LOCATE OLD CORPUS -> INVENTORY -> FREEZE OLD BASELINE -> WAIT FOR 2026-II INPUT -> COMPUTE DELTA -> PROMOTE VALID CHANGES`

Expected delta fields:

- `topics_added`
- `topics_removed`
- `topic_order_changed`
- `program_changed`
- `schedule_changed`
- `bibliography_changed`
- `evaluation_changed`
- `teacher_instructions_changed`
- `teacher_emphasis_changed`
- `clinical_guidelines_to_refresh`

Do not duplicate unchanged legacy material into a new physical folder unless there is a compelling reason and user approval.

---

## ORDER 4 — Tuesday 2026-08-18 is a delta checkpoint, not a reset

The first class-day changes supplied by the user on Tuesday 2026-08-18 must be treated as a comparison event against the inherited baseline.

When new program, schedule, teacher instructions, bibliography, grading scheme or class emphasis becomes available:

1. preserve the new source;
2. identify the corresponding old source;
3. generate a structured delta;
4. mark unchanged items as inherited;
5. promote only verified changes into the working 2026-II state;
6. preserve the previous-semester source and genealogy.

Never overwrite the previous baseline.

---

## ORDER 5 — Acquisition priority is the genuinely new VII-cycle corpus

Until teacher programs/chronograms refine the priorities, focus new acquisition on:

1. Cardiología — declared density rank 1 `[C]`
2. Uro-Nefrología — declared density rank 2 `[C]`
3. Hematología — declared density rank 3 `[C]`
4. Gastroenterología
5. Neumología
6. Salud y Medio Ambiente
7. Antropología Médica

Obstetricia and Farmacoterapéutica are maintained in **delta/watch mode**, not primary reconstruction mode.

Do not infer academic mastery, weakness or priority from historical grades.

---

## ORDER 6 — Canonical semester time source

The official UAN `Calendario Escolar 2026-2027` has been independently verified by the user/assistant workflow and the user has supplied a matching PDF in the IAtros project conversation.

Register its metadata as the canonical institutional calendar source for the 2026-II temporal layer when the file becomes locally available to Codex.

Suggested stable source identity:

`SRC-UAN-OFFICIAL-CALENDAR-2026-2027`

Role:

`official_academic_calendar`

Do not fabricate a local path or SHA-256 before observing the actual file.

Use it to anchor the semester timeline, not to infer teacher-specific exam dates.

---

## ORDER 7 — Build the first Semester Brain working state

Create a **working state**, not yet an immutable final freeze, containing:

- institution/program/period;
- current enrollment view;
- actual class schedule when locally available;
- active subjects;
- teacher identities where sourced;
- inherited-vs-new status per subject;
- source catalog pointers;
- missing-source queue;
- unresolved contradictions;
- timeline anchors;
- coverage metrics;
- epistemic labels.

The immutable `SEMESTER_BRAIN_FREEZE_v1.0` may only be minted after the source pointers used by the freeze are resolvable and the baseline has passed the validation gate.

---

## ORDER 8 — Source policy

For each source record preserve at least:

- `source_id`
- physical path or canonical URI
- title
- source role
- subject(s)
- period
- professor when applicable
- publication/update date when applicable
- epistemic status
- temporal status
- authority by domain
- extraction/indexing state
- SHA-256 when useful and actually computed
- relations to other sources

Separate:

- official curriculum;
- teacher/course instructions;
- historical UAN/UAM material;
- historical exams/question banks;
- current clinical authority;
- primary literature;
- generated views.

Historical exams are evidence of evaluation culture, not automatically current medical authority.

---

## ORDER 9 — Required first report to the user

After discovery, return exactly these decision blocks:

1. `ROOT_OBSERVED`
2. `HISTORICAL_SEMESTERS_FOUND`
3. `OBSTETRICIA_BASELINE_FOUND`
4. `FARMACOTERAPEUTICA_BASELINE_FOUND`
5. `CURRENT_VII_MATERIAL_FOUND`
6. `CALENDAR_SOURCE_STATUS`
7. `DUPLICATE_CANDIDATES`
8. `AMBIGUITIES`
9. `MISSING_SOURCE_QUEUE`
10. `PROPOSED_IGGY_OVERLAY`
11. `MUTATIONS_APPLIED: NONE`
12. `NEXT_BEST_ACTION`

Do not begin physical reorganization after the report. Wait for explicit approval.

---

## Definition of success for this order

This order succeeds when Iggy knows:

- where the prior semester memory actually lives;
- which parts of Obstetricia and Farmacoterapéutica can be inherited;
- what is truly new for VII;
- which temporal source is canonical;
- what is missing;
- what should be compared on Tuesday;

without changing the historical filesystem.
