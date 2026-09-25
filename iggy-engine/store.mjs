import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export const nowIso = () => new Date().toISOString();
export const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));
export const parseJson = (value, fallback = null) => {
  if (value == null) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};
export const stableId = (...parts) => crypto.createHash('sha256')
  .update(parts.filter(Boolean).join('|')).digest('hex').slice(0, 24);
const encode = (value) => JSON.stringify(value ?? null);

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS sources(source_id TEXT PRIMARY KEY,title TEXT,role TEXT,uri TEXT,sha256 TEXT,temporal_status TEXT,authority TEXT,metadata_json TEXT NOT NULL,updated_at TEXT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS claims(claim_id TEXT PRIMARY KEY,source_id TEXT,statement TEXT NOT NULL,status TEXT NOT NULL,metadata_json TEXT NOT NULL,created_at TEXT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS evidence_events(event_id TEXT PRIMARY KEY,event_type TEXT NOT NULL,concept_id TEXT,source_ref TEXT,epistemic_status TEXT NOT NULL,payload_json TEXT NOT NULL,created_at TEXT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS student_states(concept_id TEXT PRIMARY KEY,model_version TEXT NOT NULL,mastery REAL NOT NULL,uncertainty REAL NOT NULL,retrievability REAL NOT NULL,transfer REAL NOT NULL,calibration REAL NOT NULL,misconceptions_json TEXT NOT NULL,evidence_refs_json TEXT NOT NULL,evidence_count INTEGER NOT NULL,updated_at TEXT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS decisions(decision_id TEXT PRIMARY KEY,decision_type TEXT NOT NULL,concept_id TEXT,payload_json TEXT NOT NULL,created_at TEXT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS resources(resource_id TEXT PRIMARY KEY,concept_id TEXT,spec_json TEXT NOT NULL,created_at TEXT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS revision_pressures(pressure_id TEXT PRIMARY KEY,kind TEXT NOT NULL,target TEXT NOT NULL,severity REAL NOT NULL,context_json TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,resolved_at TEXT);',
  'CREATE TABLE IF NOT EXISTS transformations(transformation_id TEXT PRIMARY KEY,target TEXT NOT NULL,revision_level INTEGER NOT NULL,proposal_json TEXT NOT NULL,evaluation_policy_json TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,applied_at TEXT);',
  'CREATE TABLE IF NOT EXISTS audits(audit_id TEXT PRIMARY KEY,scope TEXT NOT NULL,report_json TEXT NOT NULL,created_at TEXT NOT NULL);'
].join('\n');

export class IggyStore {
  constructor(dbPath = path.resolve('.iggy/iggy-live.sqlite')) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.dbPath = dbPath;
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
    this.db.exec(SCHEMA);
    if (this.getMeta('schema_version') == null) this.setMeta('schema_version', '0.1');
    if (this.getMeta('cycle_count') == null) this.setMeta('cycle_count', '0');
    if (this.getMeta('representation_penalties') == null) this.setMeta('representation_penalties', '{}');
  }

  close() { this.db.close(); }
  setMeta(key, value) { this.db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, String(value)); }
  getMeta(key) { return this.db.prepare('SELECT value FROM meta WHERE key=?').get(key)?.value ?? null; }

  upsertSource(source) {
    const id = source.source_id || source.id || stableId(source.uri, source.title, encode(source));
    const sql = 'INSERT INTO sources(source_id,title,role,uri,sha256,temporal_status,authority,metadata_json,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(source_id) DO UPDATE SET title=excluded.title,role=excluded.role,uri=excluded.uri,sha256=excluded.sha256,temporal_status=excluded.temporal_status,authority=excluded.authority,metadata_json=excluded.metadata_json,updated_at=excluded.updated_at';
    this.db.prepare(sql).run(id, source.title ?? source.name ?? null, source.role ?? source.source_role ?? null, source.uri ?? source.path ?? null, source.sha256 ?? source.hash ?? null, source.temporal_status ?? 'unknown', source.authority ?? source.authority_by_domain ?? null, encode(source), nowIso());
    return id;
  }

  upsertClaim(claim) {
    const statement = claim.statement ?? claim.statement_short ?? claim.statement_operational ?? claim.text ?? claim.content;
    if (!statement) return null;
    const id = claim.claim_id || claim.id || stableId(claim.source_id, statement);
    const sql = 'INSERT INTO claims(claim_id,source_id,statement,status,metadata_json,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(claim_id) DO UPDATE SET source_id=excluded.source_id,statement=excluded.statement,status=excluded.status,metadata_json=excluded.metadata_json';
    this.db.prepare(sql).run(id, claim.source_id ?? null, statement, claim.status ?? 'active', encode(claim), nowIso());
    return id;
  }

  appendEvidence(event) {
    const id = event.event_id || crypto.randomUUID();
    this.db.prepare('INSERT INTO evidence_events(event_id,event_type,concept_id,source_ref,epistemic_status,payload_json,created_at) VALUES(?,?,?,?,?,?,?)')
      .run(id, event.event_type, event.concept_id ?? null, event.source_ref ?? null, event.epistemic_status ?? 'OBSERVED', encode(event.payload ?? {}), event.created_at || nowIso());
    return id;
  }

  listEvidence({ eventType = null, conceptId = null } = {}) {
    let sql = 'SELECT * FROM evidence_events';
    const where = [], args = [];
    if (eventType) { where.push('event_type=?'); args.push(eventType); }
    if (conceptId) { where.push('concept_id=?'); args.push(conceptId); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY created_at ASC';
    return this.db.prepare(sql).all(...args).map((r) => ({ ...r, payload: parseJson(r.payload_json, {}) }));
  }

  listClaims(limit = 1000) {
    return this.db.prepare('SELECT * FROM claims ORDER BY created_at LIMIT ?').all(limit)
      .map((r) => ({ ...r, metadata: parseJson(r.metadata_json, {}) }));
  }

  upsertStudentState(state) {
    const sql = 'INSERT INTO student_states(concept_id,model_version,mastery,uncertainty,retrievability,transfer,calibration,misconceptions_json,evidence_refs_json,evidence_count,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(concept_id) DO UPDATE SET model_version=excluded.model_version,mastery=excluded.mastery,uncertainty=excluded.uncertainty,retrievability=excluded.retrievability,transfer=excluded.transfer,calibration=excluded.calibration,misconceptions_json=excluded.misconceptions_json,evidence_refs_json=excluded.evidence_refs_json,evidence_count=excluded.evidence_count,updated_at=excluded.updated_at';
    this.db.prepare(sql).run(state.concept_id, state.model_version, state.mastery, state.uncertainty, state.retrievability, state.transfer, state.calibration, encode(state.misconceptions), encode(state.evidence_refs), state.evidence_count, nowIso());
  }

  getStudentState(conceptId) {
    const r = this.db.prepare('SELECT * FROM student_states WHERE concept_id=?').get(conceptId);
    if (!r) return null;
    return { concept_id: r.concept_id, model_version: r.model_version, mastery: r.mastery, uncertainty: r.uncertainty, retrievability: r.retrievability, transfer: r.transfer, calibration: r.calibration, misconceptions: parseJson(r.misconceptions_json, {}), evidence_refs: parseJson(r.evidence_refs_json, []), evidence_count: r.evidence_count, updated_at: r.updated_at };
  }

  listStudentStates() { return this.db.prepare('SELECT concept_id FROM student_states').all().map((r) => this.getStudentState(r.concept_id)); }

  appendDecision(type, conceptId, payload) {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO decisions(decision_id,decision_type,concept_id,payload_json,created_at) VALUES(?,?,?,?,?)').run(id, type, conceptId ?? null, encode(payload), nowIso());
    return id;
  }

  appendResource(conceptId, spec) {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO resources(resource_id,concept_id,spec_json,created_at) VALUES(?,?,?,?)').run(id, conceptId ?? null, encode({ ...spec, resource_id: id }), nowIso());
    return id;
  }

  addPressure({ kind, target, severity = 0.5, context = {} }) {
    const id = stableId(kind, target, encode(context.signature ?? context));
    if (this.db.prepare("SELECT pressure_id FROM revision_pressures WHERE pressure_id=? AND status='open'").get(id)) return id;
    this.db.prepare("INSERT INTO revision_pressures(pressure_id,kind,target,severity,context_json,status,created_at) VALUES(?,?,?,?,?,'open',?)")
      .run(id, kind, target, clamp01(severity), encode(context), nowIso());
    return id;
  }

  listOpenPressures() { return this.db.prepare("SELECT * FROM revision_pressures WHERE status='open' ORDER BY severity DESC").all().map((r) => ({ ...r, context: parseJson(r.context_json, {}) })); }
  resolvePressure(id) { this.db.prepare("UPDATE revision_pressures SET status='resolved',resolved_at=? WHERE pressure_id=?").run(nowIso(), id); }

  appendTransformation({ target, revision_level, proposal, evaluation_policy, status }) {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO transformations(transformation_id,target,revision_level,proposal_json,evaluation_policy_json,status,created_at) VALUES(?,?,?,?,?,?,?)')
      .run(id, target, revision_level, encode(proposal), encode(evaluation_policy), status, nowIso());
    return id;
  }

  listTransformations() { return this.db.prepare('SELECT * FROM transformations ORDER BY created_at DESC').all().map((r) => ({ ...r, proposal: parseJson(r.proposal_json, {}), evaluation_policy: parseJson(r.evaluation_policy_json, {}) })); }
  applyTransformation(id) { this.db.prepare("UPDATE transformations SET status='applied',applied_at=? WHERE transformation_id=?").run(nowIso(), id); }

  appendAudit(scope, report) {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO audits(audit_id,scope,report_json,created_at) VALUES(?,?,?,?)').run(id, scope, encode(report), nowIso());
    this.setMeta('last_audit_at', nowIso());
    return id;
  }

  stats() {
    const count = (table) => Number(this.db.prepare('SELECT COUNT(*) AS n FROM ' + table).get().n);
    return { db_path: this.dbPath, schema_version: this.getMeta('schema_version'), cycle_count: Number(this.getMeta('cycle_count') || 0), sources: count('sources'), claims: count('claims'), evidence_events: count('evidence_events'), student_states: count('student_states'), decisions: count('decisions'), resources: count('resources'), revision_pressures_open: Number(this.db.prepare("SELECT COUNT(*) AS n FROM revision_pressures WHERE status='open'").get().n), transformations: count('transformations'), audits: count('audits'), last_audit_at: this.getMeta('last_audit_at') };
  }
}
