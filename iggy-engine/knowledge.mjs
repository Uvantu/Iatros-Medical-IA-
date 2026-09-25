import fs from 'node:fs';
import path from 'node:path';
import { stableId } from './store.mjs';

const recordsFrom = (payload, preferred = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of preferred) if (Array.isArray(payload[key])) return payload[key];
  const arrays = Object.values(payload).filter(Array.isArray);
  return arrays.length === 1 ? arrays[0] : [];
};

export class KnowledgeBridge {
  constructor(store) { this.store = store; }

  ingestManifest(manifestPath) {
    if (!manifestPath || !fs.existsSync(manifestPath)) return { imported: 0, skipped: 0, path: manifestPath ?? null };
    let imported = 0, skipped = 0;
    for (const line of fs.readFileSync(manifestPath, 'utf8').split(/\r?\n/).filter(Boolean)) {
      try {
        const r = JSON.parse(line);
        this.store.upsertSource({ ...r, source_id: r.source_id || stableId(r.absolute_path, r.relative_path), title: r.title || r.name || path.basename(r.absolute_path || r.relative_path || 'source'), role: r.document_role || r.role || 'unknown', uri: r.absolute_path || r.relative_path });
        imported += 1;
      } catch { skipped += 1; }
    }
    return { imported, skipped, path: manifestPath };
  }

  ingestCertifiedKnowledgeBase(kbDir) {
    if (!kbDir || !fs.existsSync(kbDir)) return { found: false, path: kbDir ?? null, sources: 0, claims: 0, review: 0 };
    const out = { found: true, path: kbDir, sources: 0, claims: 0, review: 0 };
    const read = (name) => {
      const p = path.join(kbDir, name);
      return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
    };
    for (const source of recordsFrom(read('source-catalog.json'), ['sources', 'records', 'items'])) {
      this.store.upsertSource(source); out.sources += 1;
    }
    const ingestFacts = (name, status) => {
      for (const fact of recordsFrom(read(name), ['facts', 'records', 'items'])) {
        const sourceId = fact.source_id || fact.source?.source_id || fact.source_ref || null;
        const claimId = this.store.upsertClaim({ ...fact, source_id: sourceId, status });
        if (!claimId) continue;
        this.store.appendEvidence({ event_type: 'knowledge_claim_imported', concept_id: fact.concept_id || fact.topic_id || null, source_ref: sourceId, epistemic_status: status === 'active' ? 'SOURCE_BACKED' : 'REVIEW_REQUIRED', payload: { claim_id: claimId, status, origin_file: name } });
        if (status === 'active') out.claims += 1; else out.review += 1;
      }
    };
    ingestFacts('certified-facts.json', 'active');
    ingestFacts('question-source-facts.json', 'active');
    ingestFacts('blocked-or-review-facts.json', 'review');
    return out;
  }
}
