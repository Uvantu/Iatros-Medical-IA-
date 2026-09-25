import { parseJson } from './store.mjs';

export const HARD_CONSTITUTION = Object.freeze([
  'evidence_conservation',
  'genealogy_conservation',
  'authority_conservation',
  'explicit_uncertainty',
  'semantic_identity',
  'correctability'
]);

export const LEVEL = Object.freeze({
  EXPERIENCE: 0,
  PARAMETER: 1,
  REPRESENTATION: 2,
  POLICY: 3,
  MODEL: 4,
  ONTOLOGY: 5,
  ARCHITECTURE: 6,
  INVARIANT: 7,
  META_POLICY: 8,
  CONSTITUTION: 9
});

const accuracy = (events) =>
  events.length
    ? events.reduce((sum, e) => sum + Number(e.payload.outcome || 0), 0) / events.length
    : 0;

export class RevisionEngine {
  constructor(store, { auditEveryCycles = 10 } = {}) {
    this.store = store;
    this.auditEveryCycles = auditEveryCycles;
  }

  signalPressure({ kind, target, severity = 0.5, context = {} }) {
    return this.store.addPressure({ kind, target, severity, context });
  }

  detectPressures() {
    const ids = [];
    const claims = this.store.listClaims();
    const linkedConcepts = new Set(
      claims.flatMap((c) => [c.metadata?.concept_id, c.metadata?.topic_id]).filter(Boolean)
    );

    for (const state of this.store.listStudentStates()) {
      if (!linkedConcepts.has(state.concept_id)) {
        ids.push(this.store.addPressure({
          kind: 'MISSING_ABSTRACTION',
          target: 'knowledge:' + state.concept_id,
          severity: 0.60,
          context: {
            signature: state.concept_id,
            concept_id: state.concept_id,
            reason: 'student evidence exists but no concept-linked source claim was found'
          }
        }));
      }
    }

    for (const claim of claims) {
      if (claim.status === 'review') {
        ids.push(this.store.addPressure({
          kind: 'UNRESOLVED_EVIDENCE',
          target: 'claim:' + claim.claim_id,
          severity: 0.55,
          context: {
            signature: claim.claim_id,
            claim_id: claim.claim_id,
            source_id: claim.source_id,
            reason: 'claim is blocked or review-required'
          }
        }));
      }
      const conflicts = claim.metadata?.conflicts_with;
      if (Array.isArray(conflicts) && conflicts.length) {
        ids.push(this.store.addPressure({
          kind: 'CONTRADICTION',
          target: 'claim:' + claim.claim_id,
          severity: 0.75,
          context: {
            signature: claim.claim_id + ':' + conflicts.join(','),
            claim_id: claim.claim_id,
            conflicts_with: conflicts
          }
        }));
      }
    }

    const now = Date.now();
    for (const source of this.store.listSources()) {
      const reviewAfter = source.metadata?.review_after || source.metadata?.valid_until;
      if (reviewAfter) {
        const due = Date.parse(reviewAfter);
        if (Number.isFinite(due) && due < now) {
          ids.push(this.store.addPressure({
            kind: 'STALE_ASSUMPTION',
            target: 'source:' + source.source_id,
            severity: 0.65,
            context: {
              signature: source.source_id + ':' + reviewAfter,
              source_id: source.source_id,
              review_after: reviewAfter
            }
          }));
        }
      }
    }

    const observations = this.store.listEvidence({ eventType: 'student_observation' });
    const byContext = new Map();
    for (const event of observations) {
      const rep = event.payload.representation;
      const op = event.payload.operation;
      if (!rep || !op || !event.concept_id) continue;
      const contextKey = event.concept_id + '|' + op;
      if (!byContext.has(contextKey)) byContext.set(contextKey, new Map());
      const byRep = byContext.get(contextKey);
      const xs = byRep.get(rep) || [];
      xs.push(event);
      byRep.set(rep, xs);
    }

    for (const [contextKey, byRep] of byContext) {
      const eligible = [...byRep.entries()]
        .filter(([, xs]) => xs.length >= 6)
        .map(([representation, xs]) => ({
          representation,
          n: xs.length,
          accuracy: accuracy(xs)
        }));

      if (eligible.length < 2) continue;
      eligible.sort((a, b) => b.accuracy - a.accuracy);
      const best = eligible[0];
      const [conceptId, operation] = contextKey.split('|');

      for (const candidate of eligible.slice(1)) {
        const gap = best.accuracy - candidate.accuracy;
        if (gap < 0.20 || candidate.accuracy >= 0.55) continue;

        ids.push(this.store.addPressure({
          kind: 'CAPABILITY_CEILING',
          target: 'representation:' + conceptId + ':' + operation + ':' + candidate.representation,
          severity: Math.min(0.90, 0.60 + gap),
          context: {
            signature: [conceptId, operation, candidate.representation, candidate.n, candidate.accuracy.toFixed(2), best.representation, best.accuracy.toFixed(2)].join(':'),
            concept_id: conceptId,
            operation,
            representation: candidate.representation,
            n: candidate.n,
            accuracy: candidate.accuracy,
            comparator: best.representation,
            comparator_n: best.n,
            comparator_accuracy: best.accuracy,
            gap,
            caveat: 'observational comparison; assignment may be confounded'
          }
        }));
      }
    }

    return [...new Set(ids)];
  }

  propose() {
    const transformationIds = [];
    const researchTaskIds = [];

    for (const pressure of this.store.listOpenPressures()) {
      if (this.store.hasTransformationForPressure(pressure.pressure_id)) continue;

      if (pressure.kind === 'CAPABILITY_CEILING') {
        const c = pressure.context;
        transformationIds.push(this.store.appendTransformation({
          target: pressure.target,
          revision_level: LEVEL.REPRESENTATION,
          proposal: {
            action: 'deprioritize_representation',
            concept_id: c.concept_id,
            operation: c.operation,
            representation: c.representation,
            comparator: c.comparator,
            delta: -0.08,
            pressure_ref: pressure.pressure_id,
            hard_constitution_preserved: HARD_CONSTITUTION
          },
          evaluation_policy: {
            frozen_before_application: true,
            evidence_basis: 'comparative observational data in same concept and operation',
            minimum_future_observations: 6,
            success: 'relative outcome gap narrows without worse transfer/calibration signal',
            rollback: 'remove scoped adjustment if later evidence reverses the comparison',
            limitation: 'does not establish causal educational superiority'
          },
          status: 'sandbox'
        }));
        continue;
      }

      const researchQuery = this.#researchQueryFor(pressure);
      researchTaskIds.push(this.store.queueResearchTask({
        pressure_id: pressure.pressure_id,
        query: researchQuery
      }));

      transformationIds.push(this.store.appendTransformation({
        target: pressure.target,
        revision_level: this.#revisionLevelFor(pressure),
        proposal: {
          action: 'investigate_gap',
          pressure_kind: pressure.kind,
          pressure_ref: pressure.pressure_id,
          research_query: researchQuery,
          auto_apply: false
        },
        evaluation_policy: {
          frozen_before_application: true,
          success: 'new evidence resolves, scopes, or preserves the tension explicitly'
        },
        status: 'requires_authority'
      }));
    }

    return { transformation_ids: transformationIds, research_task_ids: researchTaskIds };
  }

  #revisionLevelFor(pressure) {
    if (pressure.kind === 'MISSING_ABSTRACTION') return LEVEL.ONTOLOGY;
    if (pressure.kind === 'STALE_ASSUMPTION') return LEVEL.MODEL;
    if (pressure.kind === 'CONTRADICTION') return LEVEL.POLICY;
    return LEVEL.POLICY;
  }

  #researchQueryFor(pressure) {
    const c = pressure.context || {};
    if (pressure.kind === 'MISSING_ABSTRACTION') {
      return 'Find source-backed concepts and relations needed to model ' + (c.concept_id || pressure.target) + ', preserving provenance and unresolved alternatives.';
    }
    if (pressure.kind === 'STALE_ASSUMPTION') {
      return 'Verify whether source ' + (c.source_id || pressure.target) + ' has been superseded or requires a current authoritative replacement.';
    }
    if (pressure.kind === 'CONTRADICTION') {
      return 'Investigate the conflicting claims around ' + (c.claim_id || pressure.target) + '; characterize scope, evidence strength, dates, and whether the conflict is real or contextual.';
    }
    return 'Investigate revision pressure ' + pressure.kind + ' on ' + pressure.target + ' and return evidence, uncertainty, alternatives, and a discriminating test.';
  }

  applySafe() {
    const adjustments = parseJson(this.store.getMeta('representation_penalties'), {});
    const applied = [];

    for (const t of this.store.listTransformations()) {
      if (
        t.status !== 'sandbox' ||
        t.revision_level > LEVEL.REPRESENTATION ||
        t.proposal.action !== 'deprioritize_representation'
      ) continue;

      const key = [
        'concept',
        t.proposal.concept_id,
        t.proposal.operation,
        t.proposal.representation
      ].join('|');

      adjustments[key] = Math.max(
        -0.24,
        Number(adjustments[key] || 0) + Number(t.proposal.delta || 0)
      );

      this.store.setMeta('representation_penalties', JSON.stringify(adjustments));
      this.store.applyTransformation(t.transformation_id);
      if (t.proposal.pressure_ref) this.store.resolvePressure(t.proposal.pressure_ref);
      applied.push(t.transformation_id);
    }

    return applied;
  }

  audit(scope = 'periodic') {
    const violations = [];

    for (const state of this.store.listStudentStates()) {
      if (!state.model_version) {
        violations.push({ law: 'genealogy_conservation', target: state.concept_id, detail: 'missing model_version' });
      }
      if (!Array.isArray(state.evidence_refs)) {
        violations.push({ law: 'evidence_conservation', target: state.concept_id, detail: 'missing evidence_refs' });
      }
      if (state.uncertainty < 0 || state.uncertainty > 1) {
        violations.push({ law: 'explicit_uncertainty', target: state.concept_id, detail: 'uncertainty out of bounds' });
      }
    }

    for (const t of this.store.listTransformations()) {
      if (t.status === 'applied' && t.revision_level >= LEVEL.INVARIANT) {
        violations.push({
          law: 'authority_conservation',
          target: t.transformation_id,
          detail: 'invariant-or-higher transformation was auto-applied'
        });
      }
    }

    const report = {
      scope,
      engine_version: 'iggy-live-v0.1',
      hard_constitution: HARD_CONSTITUTION,
      stats: this.store.stats(),
      violations,
      pass: violations.length === 0,
      epistemic_note: 'Structural audit only; it does not prove educational efficacy.'
    };

    return { ...report, audit_id: this.store.appendAudit(scope, report) };
  }

  maintenance({ forceAudit = false } = {}) {
    const pressure_ids = this.detectPressures();
    const proposal = this.propose();
    const applied_ids = this.applySafe();
    const cycles = Number(this.store.getMeta('cycle_count') || 0);
    const severe = this.store.listOpenPressures().some((p) => p.severity >= 0.85);

    const audit = forceAudit || severe || (cycles > 0 && cycles % this.auditEveryCycles === 0)
      ? this.audit(forceAudit ? 'forced' : severe ? 'severity-triggered' : 'periodic')
      : null;

    return {
      pressure_ids,
      proposal_ids: proposal.transformation_ids,
      research_task_ids: proposal.research_task_ids,
      applied_ids,
      audit
    };
  }
}
