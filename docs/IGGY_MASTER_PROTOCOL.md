# IGGY MASTER PROTOCOL — File Brain / IAtros

Version: 0.2
Status: ACTIVE CONTRACT

## 1. Mission

Iggy is not a folder tree. Iggy is the **cognitive navigation layer** over the user's real information system.

Its job is to make the user's files behave like an external brain:

- preserve original memory;
- know where things are;
- know how they relate;
- distinguish source from interpretation;
- expose the right view for the current task;
- improve organization incrementally without destroying historical structure;
- keep all durable changes traceable and reversible.

The filesystem is physical memory. Iggy supplies indexing, relationships, metadata, temporal context, provenance, priority and task-specific views.

## 2. Core architectural principle

Do **not** solve the problem by forcing all files into one perfect folder hierarchy.

Use two layers:

### Layer A — Physical memory
The user's existing files and folders on the PC, including previous Medicine semesters/cycles.

### Layer B — Iggy logical overlay
Manifests, aliases, indexes, relationship maps, generated Markdown views and task state that point to physical sources.

A source should normally exist physically once while being reachable through many logical views.

Example:

`Fisiología -> cardiovascular -> Cardiología 2026-II`

and

`Fisiología -> renal -> Uro-Nefrología 2026-II`

may both point to the same historical physiology source without duplicating it.

## 3. Absolute safety contract

Historical academic folders are protected until explicitly migrated by the user.

Before any structural mutation:

1. Observe.
2. Map.
3. Build a manifest.
4. Detect aliases and likely semester/cycle boundaries.
5. Produce a proposed overlay.
6. Produce a dry-run of any physical change.
7. Obtain explicit user approval.
8. Apply the smallest justified mutation.
9. Verify.
10. Log.

Never interpret silence as permission.

Never delete a source because a duplicate is suspected. First prove byte-identical or explicitly classify as semantic duplicate; then propose an action.

## 4. Discovery Pass — first local operation

The first Codex pass on the user's PC must be **read-only**.

### 4.1 Find the real academic root
Do not assume a path. The user may point to it or Codex may locate candidate roots with permission.

### 4.2 Inventory
Capture at minimum:

- absolute path;
- relative path from chosen root;
- kind: file/folder;
- extension;
- size;
- modified timestamp;
- parent;
- depth;
- detected semester/cycle hints;
- detected subject hints;
- likely document role;
- confidence;
- protected-history flag.

Use hashes only where useful; avoid an expensive full-drive hash pass before the topology is understood.

### 4.3 Infer cautiously
Names such as `Sem 4`, `4 semestre`, `Ciclo VI`, course names, years or professor names can become aliases, not automatic renames.

### 4.4 Produce the first artifacts
The local root should receive a non-invasive `.iggy/` directory if the user permits metadata creation. If even metadata creation is not yet authorized, generate the artifacts inside the current Codex workspace instead.

Target artifacts:

- `.iggy/state.json`
- `.iggy/manifest.jsonl`
- `.iggy/folder_map.md`
- `.iggy/aliases.yaml`
- `.iggy/proposals.jsonl`
- `.iggy/change_log.jsonl`

## 5. Classification model

Every physical source may receive multiple logical classifications.

### 5.1 Academic coordinates
- institution
- program
- semester/cycle
- period/year
- subject
- professor
- group

### 5.2 Document role
- official_program
- class_schedule
- teacher_instruction
- lecture_notes
- textbook
- guideline
- GPC
- NOM
- exam
- question_bank
- assignment
- presentation
- image
- student_summary
- research_article
- administrative_record
- generated_view
- unknown

### 5.3 Epistemic status
- `O` observed
- `C` user-declared
- `D` derived
- `I` inferred
- `?` unknown
- `X` not inferable

### 5.4 Temporal status
- current
- historical
- superseded
- unknown

Never infer medical currency from file modification date alone.

## 6. Current academic overlay — 2026-II

The system must support the user's current real enrollment as a logical view without altering historical folders.

Current subjects, provisionally ordered by the student's declared density where known:

1. Cardiología — density rank 1
2. Uro-Nefrología — density rank 2
3. Hematología — density rank 3
4. Gastroenterología
5. Neumología
6. Obstetricia — carried/open from previous cycle
7. Farmacoterapéutica — carried/open from previous cycle
8. Salud y Medio Ambiente
9. Antropología Médica

Do not derive cognitive weakness from past grades. Administrative grades and cognitive mastery are separate entities.

## 7. Generated views

Iggy should generate views for intent, not merely folders.

Examples:

- `study_now`
- `exam_tomorrow`
- `teacher_specific`
- `clinical_problem`
- `weekly_plan`
- `source_audit`
- `current_guideline`
- `historical_exam_pattern`
- `cross_subject_transfer`

Generated Markdown should be treated as a projection over the source graph.

## 8. Master files

Recommended logical files inside IATROS or the chosen Iggy metadata home:

```text
.iggy/
├── state.json
├── manifest.jsonl
├── aliases.yaml
├── proposals.jsonl
├── change_log.jsonl
├── self_improvement_log.jsonl
├── rules/
│   ├── navigation.yaml
│   ├── epistemic_policy.yaml
│   ├── source_policy.yaml
│   └── output_profiles.yaml
└── indexes/
    ├── by_semester/
    ├── by_subject/
    ├── by_professor/
    ├── by_document_role/
    └── by_clinical_topic/
```

The exact physical placement must adapt to the user's real hierarchy after Discovery Pass.

## 9. Semesters as protected historical memory

Previous semesters should normally remain intact.

Iggy may:

- index them;
- map aliases;
- create logical links;
- identify missing/duplicate/ambiguous items;
- use them as prerequisite memory for current subjects.

Iggy may not automatically:

- flatten them;
- rename them into a new universal convention;
- move them into IATROS;
- merge their subject folders;
- delete apparently obsolete documents.

## 10. Inbox routing

Once the historical topology is understood, new material may be routed through an Inbox workflow.

Preferred state machine:

`NEW -> CLASSIFIED -> PROPOSED_DESTINATION -> VERIFIED -> FILED -> INDEXED`

For ambiguous items:

`NEW -> AMBIGUOUS -> HUMAN_DECISION`

No guessed placement when confidence is low.

## 11. Duplicates

Use three distinct concepts:

- byte duplicate: same cryptographic hash;
- content-equivalent: same document with different container/name/version;
- semantic overlap: different sources covering similar material.

Only byte duplicates are candidates for highly confident physical deduplication, and even then a dry-run and user approval are required.

## 12. Clinical knowledge policy

Academic historical material is excellent evidence for:

- what was taught;
- how a professor or cohort organized content;
- historical exam culture;
- curricular emphasis.

It is not automatically current medical authority.

When Iggy later produces clinical guidance, preserve provenance and distinguish:

- teacher/course source;
- historical UAN/UAM source;
- current official guideline;
- primary literature;
- inference.

## 13. Self-improvement

Iggy may improve its own routing and navigation rules by observation, but not silently.

Any durable rule change must contain:

- rule_id
- old_version
- proposed_version
- evidence
- reason
- scope
- expected_gain
- risk
- rollback
- status: proposed/accepted/rejected

Write proposals to `.iggy/self_improvement_log.jsonl` or equivalent.

Constitution-level changes require explicit approval.

## 14. Phase gates

### Gate A — topology understood
Evidence required:
- root identified;
- historical semesters mapped;
- major subject folders mapped;
- unknown regions listed.

### Gate B — overlay validated
Evidence required:
- aliases validated;
- current-semester logical view proposed;
- no historical mutations needed to make it work.

### Gate C — controlled filing enabled
Evidence required:
- Inbox workflow tested in dry-run;
- rollback known;
- change log operational.

### Gate D — Iggy cognitive layer
Evidence required:
- sources can be retrieved by subject and topic;
- generated views link back to originals;
- professor/course/current-evidence layers remain distinct.

## 15. What Codex should report after the first pass

Return a concise but information-dense report containing:

1. observed root and top-level topology;
2. semester/cycle hierarchy as actually found;
3. protected regions;
4. current IATROS-related locations;
5. inconsistencies/aliases, without changing them;
6. obvious duplicate candidates;
7. unclassified regions;
8. proposed logical overlay;
9. proposed next read-only step;
10. a separate mutation plan, if any, marked **NOT APPLIED**.

## 16. Stop conditions

Stop and ask the user when:

- two different roots could both be authoritative;
- a move would cross historical semester boundaries;
- a path appears to be synced/cloud-managed and mutation risk is unclear;
- a folder name is semantically ambiguous and placement would be consequential;
- deleting or merging anything is being considered;
- the user's observed structure conflicts with a prior template.

## 17. Success definition

The system succeeds when the user can ask for knowledge by intent and Iggy can resolve the right physical sources without the user remembering where they live.

The target transformation is:

`intention -> Iggy -> relevant sources -> optimized view`

instead of:

`intention -> remember folder -> search manually -> open files -> reconstruct context`.
