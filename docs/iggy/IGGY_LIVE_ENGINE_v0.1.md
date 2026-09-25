# IGGY Live Cognitive Engine v0.1

Status: experimental executable core
Branch: `feature/iggy-live-cognitive-engine-v0.1`

## Mission

Turn IATROS from inert medical information into a living, iterative cognitive system while preserving evidence, genealogy, authority, uncertainty, semantic identity and correctability.

The engine is intentionally independent from React. The web app consumes it through a local HTTP bridge or a future server adapter.

## Operational flow

```text
physical / certified knowledge
        ↓
KnowledgeBridge
        ↓
sources + claims + provenance
        ↓
Evidence Ledger (SQLite)
        ↓
Student observations
        ↓
Derived StudentState
        ↓
OperationPlanner
        ↓
RepresentationPlanner
        ↓
ResourceSpec
        ↓
trusted web renderer
        ↓
new ObservationEvent
        ↓
recompute state
        ↓
META-IGGY maintenance
```

The parallel self-improvement loop is:

```text
revision pressure
    ↓
characterize gap / contradiction / staleness / capability ceiling
    ↓
TransformationProposal
    ↓
precommitted evaluation policy
    ↓
safe low-level sandbox OR research queue + authority gate
    ↓
audit
    ↓
new evidence
```

## Hard Constitution

The engine does not treat its current policies as eternal truth. It protects six conservation laws:

1. evidence conservation;
2. genealogy conservation;
3. authority conservation;
4. explicit uncertainty;
5. semantic identity;
6. correctability.

Only low-level, reversible representation adjustments may auto-apply in v0.1. Invariant-level and higher changes may never auto-apply.

## Persistence

Default database:

```text
.iggy/iggy-live.sqlite
```

SQLite stores:

- sources;
- claims;
- immutable evidence events;
- derived student-state snapshots;
- representation decisions;
- ResourceSpecs;
- revision pressures;
- transformation proposals;
- research tasks;
- audits.

StudentState is a derived projection and must remain recomputable from evidence.

The current implementation uses Node's built-in `node:sqlite` `DatabaseSync`, so Node >=22.5 is required. The storage boundary is isolated so it can later be replaced without changing the cognitive contracts.

## Inert knowledge bridge

The engine can ingest:

### .iggy manifest

```bash
npm run iggy:ingest -- --manifest "C:\path\to\.iggy\manifest.jsonl"
```

### Certified knowledge-base directory

Expected files when available:

```text
source-catalog.json
certified-facts.json
question-source-facts.json
blocked-or-review-facts.json
integrity-manifest.json
```

Run:

```bash
npm run iggy:ingest -- --kb "C:\path\to\certified-knowledge-base"
```

The connector observes `integrity-manifest.json` but v0.1 does not pretend to verify an unpublished manifest schema. Cryptographic verification remains the responsibility of the certified-KB producer until that schema is wired explicitly.

Ingestion is idempotent for imported knowledge evidence.

## Student observation

```bash
npm run iggy:observe -- \
  --concept ecg_inferior \
  --correct false \
  --confidence 0.95 \
  --representation comparison_table \
  --operation differentiate \
  --misconception territory_confusion
```

The observation is stored as evidence. Mastery, retrievability, transfer, calibration and misconception probabilities are derived separately.

## Generate the next cognitive action

```bash
npm run iggy:cycle -- --concept ecg_inferior --mode learning
```

The result contains:

- derived StudentState;
- InterventionPlan / cognitive operation;
- candidate representations;
- RepresentationDecision;
- structured ResourceSpec;
- maintenance result.

The renderer is deliberately not part of the kernel.

## Web bridge

Start:

```bash
npm run iggy:serve
```

Default:

```text
http://127.0.0.1:8791
```

Endpoints:

- `GET /api/iggy/status`
- `GET /api/iggy/research-queue`
- `POST /api/iggy/observe`
- `POST /api/iggy/cycle`
- `POST /api/iggy/ingest`
- `POST /api/iggy/revision-pressure`
- `POST /api/iggy/research-result`
- `POST /api/iggy/audit`

Environment variables:

- `IGGY_DB_PATH`
- `IGGY_KB_DIR`
- `IGGY_MANIFEST_PATH`
- `IGGY_PORT`
- `IGGY_ALLOWED_ORIGIN`
- `IGGY_AUDIT_EVERY_CYCLES`

When `IGGY_KB_DIR` or `IGGY_MANIFEST_PATH` is present, the local server ingests that corpus at boot.

## Internal self-improvement protocol

v0.1 detects or accepts revision pressures including:

- `MISSING_ABSTRACTION`;
- `UNRESOLVED_EVIDENCE`;
- `CONTRADICTION`;
- `STALE_ASSUMPTION`;
- `CAPABILITY_CEILING`;
- externally signaled anomaly/new-evidence pressures.

For missing knowledge, contradiction, stale assumptions and other higher-level pressures, the engine creates a research task and a transformation proposal marked `requires_authority`.

Representation changes are narrower. A representation is not penalized merely for low accuracy. Auto-adjustment requires:

- same concept;
- same cognitive operation;
- at least two representations;
- at least 6 observations for each compared representation;
- a relative performance gap >= 0.20;
- underperforming representation accuracy < 0.55.

Even then the adjustment is scoped to `concept × operation × representation`, reversible and explicitly labeled observational/confounded rather than causal proof.

## Research queue

The engine does not silently browse or rewrite medical knowledge. It emits research tasks for an external research worker/agent.

```bash
npm run iggy:research-queue
```

A research result can be returned through `POST /api/iggy/research-result` and optionally appended as new source-backed evidence. The next maintenance cycle reevaluates the pressure.

This boundary lets web/deep-research agents evolve independently from the cognitive kernel.

## Audits

Run manually:

```bash
npm run iggy:audit
```

Audits also run every 10 cognitive cycles by default and may be triggered by high-severity revision pressure.

Current audits verify structural invariants only. A passing audit does **not** prove that a learning intervention is educationally superior.

## Current StudentModel boundary

`bayes-heuristic-v0.1` is a transparent baseline, not a validated final psychometric model. It maintains:

- mastery;
- uncertainty;
- retrievability;
- transfer evidence;
- confidence calibration;
- misconception distribution.

The point of preserving raw evidence and model version is that this reducer can be replaced later by better BKT/CDM/IRT/memory models and historical states recomputed.

## Validation

The executable core has integration tests for:

1. idempotent inert-knowledge ingestion;
2. evidence → derived cognitive state;
3. full cognitive cycle → ResourceSpec with provenance;
4. scoped representation self-improvement with comparator and proposal deduplication;
5. higher-level contradiction → research queue without auto-application.

Run:

```bash
npm run test:iggy
```

## Deliberate boundaries of v0.1

Not claimed yet:

- connection to the user's current local KB path until that path is observed on the machine;
- semantic contradiction detection from arbitrary free text;
- cryptographic interpretation of the unpublished integrity-manifest schema;
- causal proof that one representation improves learning;
- production medical validation;
- automatic invariant/constitution rewriting;
- React UI rendering of every ResourceSpec.

These are explicit next gates, not hidden omissions.

## Next integration gate

On the actual IATROS machine:

1. observe the current `.iggy/manifest.jsonl` and certified-KB paths;
2. run ingestion without moving historical sources;
3. compare counts/hashes with the producer pipeline;
4. start `iggy:serve`;
5. connect the existing web client to `/api/iggy/*`;
6. instrument one real domain first (ECG);
7. close the first real loop: resource → answer/confidence/latency → StudentState → next resource;
8. feed research-task results back as evidence;
9. audit before any broader promotion.
