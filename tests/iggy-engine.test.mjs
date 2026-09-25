import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { IggyLiveEngine } from '../iggy-engine/index.mjs';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iggy-live-'));
  const kb = path.join(root, 'kb');
  fs.mkdirSync(kb);
  fs.writeFileSync(path.join(kb, 'source-catalog.json'), JSON.stringify({
    sources: [{ source_id: 'SRC-1', title: 'ECG source', role: 'textbook', uri: 'fixture://ecg' }]
  }));
  fs.writeFileSync(path.join(kb, 'certified-facts.json'), JSON.stringify({
    facts: [
      { claim_id: 'CL-1', source_id: 'SRC-1', concept_id: 'ecg_inferior', statement: 'II, III and aVF reflect the inferior territory.' },
      { claim_id: 'CL-2', source_id: 'SRC-1', concept_id: 'ecg_inferior', statement: 'Interpretation requires pattern plus clinical context.' }
    ]
  }));
  fs.writeFileSync(path.join(kb, 'integrity-manifest.json'), JSON.stringify({ version: 1, fixture: true }));
  return { kb, db: path.join(root, 'iggy.sqlite') };
}

test('ingests inert knowledge idempotently and observes integrity manifest', () => {
  const f = fixture();
  const engine = new IggyLiveEngine({ dbPath: f.db });
  const first = engine.ingest({ kbDir: f.kb });
  const before = engine.status().store.evidence_events;
  const second = engine.ingest({ kbDir: f.kb });
  const after = engine.status().store.evidence_events;

  assert.equal(first.certified_kb.sources, 1);
  assert.equal(first.certified_kb.claims, 2);
  assert.equal(first.certified_kb.integrity_manifest_present, true);
  assert.equal(second.certified_kb.claims, 2);
  assert.equal(after, before);
  engine.close();
});

test('derives student state from immutable observations', () => {
  const f = fixture();
  const engine = new IggyLiveEngine({ dbPath: f.db });
  engine.observe({
    concept_id: 'ecg_inferior',
    correct: false,
    confidence: 0.95,
    representation: 'retrieval_prompt',
    operation: 'retrieve',
    misconception_id: 'territory_confusion'
  });
  const result = engine.observe({
    concept_id: 'ecg_inferior',
    correct: true,
    confidence: 0.7,
    representation: 'comparison_table',
    operation: 'differentiate'
  });
  assert.equal(result.state.evidence_count, 2);
  assert.ok(result.state.misconceptions.territory_confusion > 0);
  engine.close();
});

test('cycle emits intervention representation and provenance-aware ResourceSpec', () => {
  const f = fixture();
  const engine = new IggyLiveEngine({ dbPath: f.db });
  engine.ingest({ kbDir: f.kb });
  engine.observe({
    concept_id: 'ecg_inferior',
    correct: false,
    confidence: 0.92,
    misconception_id: 'territory_confusion'
  });
  const result = engine.cycle({ conceptId: 'ecg_inferior' });
  assert.ok(result.intervention.operation);
  assert.ok(result.representation.selected_representation);
  assert.equal(result.resource.concept_id, 'ecg_inferior');
  assert.ok(result.resource.provenance.length > 0);
  engine.close();
});

test('representation self-improvement requires a scoped comparator and deduplicates proposals', () => {
  const f = fixture();
  const engine = new IggyLiveEngine({ dbPath: f.db, auditEveryCycles: 1 });
  engine.ingest({ kbDir: f.kb });

  for (let i = 0; i < 6; i++) {
    engine.observe({
      concept_id: 'ecg_inferior',
      correct: false,
      confidence: 0.9,
      representation: 'flashcard',
      operation: 'retrieve'
    });
    engine.observe({
      concept_id: 'ecg_inferior',
      correct: i !== 0,
      confidence: 0.75,
      representation: 'retrieval_prompt',
      operation: 'retrieve'
    });
  }

  const result = engine.cycle({ conceptId: 'ecg_inferior', forceAudit: true });
  assert.ok(result.maintenance.pressure_ids.length);
  assert.ok(result.maintenance.applied_ids.length);
  assert.equal(result.maintenance.audit.pass, true);

  const transformationsBefore = engine.status().store.transformations;
  engine.cycle({ conceptId: 'ecg_inferior' });
  const transformationsAfter = engine.status().store.transformations;
  assert.equal(transformationsAfter, transformationsBefore);
  engine.close();
});

test('higher-level pressure queues research and does not auto-apply', () => {
  const f = fixture();
  const engine = new IggyLiveEngine({ dbPath: f.db });
  const result = engine.signalRevisionPressure({
    kind: 'CONTRADICTION',
    target: 'claim:CL-X',
    severity: 0.8,
    context: { claim_id: 'CL-X' }
  });
  assert.ok(result.maintenance.research_task_ids.length > 0);
  assert.equal(result.maintenance.applied_ids.length, 0);
  assert.ok(engine.researchQueue().length > 0);
  assert.ok(engine.status().recent_transformations.some((t) => t.status === 'requires_authority'));
  engine.close();
});
