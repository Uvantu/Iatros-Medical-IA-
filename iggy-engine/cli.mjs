#!/usr/bin/env node
import path from 'node:path';
import { parseArgs } from 'node:util';
import { IggyLiveEngine } from './index.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    db: { type: 'string' },
    kb: { type: 'string' },
    manifest: { type: 'string' },
    concept: { type: 'string' },
    correct: { type: 'string' },
    confidence: { type: 'string' },
    latency: { type: 'string' },
    representation: { type: 'string' },
    operation: { type: 'string' },
    transfer: { type: 'boolean' },
    misconception: { type: 'string' },
    mode: { type: 'string' },
    kind: { type: 'string' },
    target: { type: 'string' },
    severity: { type: 'string' },
    'force-audit': { type: 'boolean' }
  }
});

const command = positionals[0] || 'status';
const engine = new IggyLiveEngine({
  dbPath: path.resolve(values.db || process.env.IGGY_DB_PATH || '.iggy/iggy-live.sqlite')
});

try {
  let result;

  if (command === 'init' || command === 'status') {
    result = engine.status();
  } else if (command === 'ingest') {
    result = engine.ingest({ kbDir: values.kb, manifestPath: values.manifest });
  } else if (command === 'observe') {
    result = engine.observe({
      concept_id: values.concept,
      correct: values.correct === '1' || values.correct === 'true',
      confidence: values.confidence == null ? null : Number(values.confidence),
      latency_ms: values.latency == null ? null : Number(values.latency),
      representation: values.representation ?? null,
      operation: values.operation ?? null,
      transfer: Boolean(values.transfer),
      misconception_id: values.misconception ?? null
    });
  } else if (command === 'cycle') {
    result = engine.cycle({
      conceptId: values.concept,
      mode: values.mode || 'learning',
      forceAudit: Boolean(values['force-audit'])
    });
  } else if (command === 'pressure') {
    result = engine.signalRevisionPressure({
      kind: values.kind || 'ANOMALY',
      target: values.target || 'unspecified',
      severity: values.severity == null ? 0.5 : Number(values.severity),
      context: {}
    });
  } else if (command === 'research-queue') {
    result = engine.researchQueue();
  } else if (command === 'audit') {
    result = engine.audit();
  } else {
    throw new Error('Unknown command: ' + command);
  }

  console.log(JSON.stringify(result, null, 2));
} finally {
  engine.close();
}
