import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { IggyLiveEngine } from '../iggy-engine/index.mjs';

function fixture() {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'iggy-live-')
  );
  const kb = path.join(root, 'kb');
  fs.mkdirSync(kb);

  fs.writeFileSync(
    path.join(kb, 'source-catalog.json'),
    JSON.stringify({
      sources: [{
        source_id: 'SRC-1',
        title: 'ECG source',
        role: 'textbook',
        uri: 'fixture://ecg'
      }]
    })
  );

  fs.writeFileSync(
    path.join(kb, 'certified-facts.json'),
    JSON.stringify({
      facts: [
        {
          claim_id: 'CL-1',
          source_id: 'SRC-1',
          concept_id: 'ecg_inferior',
          statement:
            'II, III and aVF reflect the inferior territory.'
        },
        {
          claim_id: 'CL-2',
          source_id: 'SRC-1',
          concept_id: 'ecg_inferior',
          statement:
            'Interpretation requires pattern plus clinical context.'
        }
      ]
    })
  );

  return {
    kb,
    db: path.join(root, 'iggy.sqlite')
  };
}

test('ingests inert knowledge', () => {
  const f = fixture();
  const engine = new IggyLiveEngine({ dbPath: f.db });
  const result = engine.ingest({ kbDir: f.kb });

  assert.equal(result.certified_kb.sources, 1);
  assert.equal(result.certified_kb.claims, 2);
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
    misconception_id: 'territory_confusion'
  });

  const result = engine.observe({
    concept_id: 'ecg_inferior',
    correct: true,
    confidence: 0.7,
    representation: 'comparison_table'
  });

  assert.equal(result.state.evidence_count, 2);
  assert.ok(
    result.state.misconceptions.territory_confusion > 0
  );

  engine.close();
});

test('cycle emits intervention representation and ResourceSpec', () => {
  const f = fixture();
  const engine = new IggyLiveEngine({ dbPath: f.db });

  engine.ingest({ kbDir: f.kb });
  engine.observe({
    concept_id: 'ecg_inferior',
    correct: false,
    confidence: 0.92,
    misconception_id: 'territory_confusion'
  });

  const result = engine.cycle({
    conceptId: 'ecg_inferior'
  });

  assert.ok(result.intervention.operation);
  assert.ok(result.representation.selected_representation);
  assert.equal(result.resource.concept_id, 'ecg_inferior');
  assert.ok(Array.isArray(result.resource.provenance));

  engine.close();
});

test('self-improvement auto-applies only low-level reversible changes', () => {
  const f = fixture();
  const engine = new IggyLiveEngine({
    dbPath: f.db,
    auditEveryCycles: 1
  });

  for (let i = 0; i < 6; i++) {
    engine.observe({
      concept_id: 'ecg_inferior',
      correct: false,
      confidence: 0.9,
      representation: 'flashcard'
    });
  }

  const result = engine.cycle({
    conceptId: 'ecg_inferior',
    forceAudit: true
  });

  assert.ok(result.maintenance.pressure_ids.length);
  assert.ok(result.maintenance.applied_ids.length);
  assert.equal(result.maintenance.audit.pass, true);
  assert.ok(
    engine.status().recent_transformations.every(
      (t) => t.revision_level < 7
    )
  );

  engine.close();
});
