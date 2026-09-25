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

export class RevisionEngine {
  constructor(store, { auditEveryCycles = 10 } = {}) {
    this.store = store;
    this.auditEveryCycles = auditEveryCycles;
  }

  detectPressures() {
    const ids = [];
    const claims = this.store.listClaims();
    const linked = new Set(
      claims.flatMap((c) => [c.metadata?.concept_id, c.metadata?.topic_id]).filter(Boolean)
    );

    for (const state of this.store.listStudentStates()) {
      if (claims.length && !linked.has(state.concept_id)) {
        ids.push(this.store.addPressure({
          kind: 'MISSING_ABSTRACTION',
          target: 'knowledge:' + state.concept_id,
          severity: 0.55,
          context: {
            signature: state.concept_id,
            concept_id: state.concept_id,
            reason: 'student evidence exists but no concept-linked claims were found'
          }
        }));
      }
    }

    const grouped = new Map();
    for (const event of this.store.listEvidence({ eventType: 'student_observation' })) {
      const representation = event.payload.representation;
      if (!representation) continue;
      const xs = grouped.get(representation) || [];
      xs.push(event.payload.outcome);
      grouped.set(representation, xs);
    }

    for (const [representation, xs] of grouped) {
      if (xs.length < 6) continue;
      const accuracy = xs.reduce((a, b) => a + b, 0) / xs.length;
      if (accuracy < 0.35) {
        ids.push(this.store.addPressure({
          kind: 'CAPABILITY_CEILING',
          target: 'representation:' + representation,
          severity: 0.70,
          context: {
            signature: representation + ':' + xs.length + ':' + accuracy.toFixed(2),
            representation,
            n: xs.length,
            accuracy
          }
        }));
      }
    }

    return [...new Set(ids)];
  }

  propose() {
    const out = [];

    for (const pressure of this.store.listOpenPressures()) {
      if (
        pressure.kind === 'CAPABILITY_CEILING' &&
        pressure.target.startsWith('representation:')
      ) {
        out.push(this.store.appendTransformation({
          target: 'representation_policy:' + pressure.context.representation,
          revision_level: LEVEL.REPRESENTATION,
          proposal: {
            action: 'deprioritize_representation',
            representation: pressure.context.representation,
            delta: -0.08,
            pressure_ref: pressure.pressure_id,
            hard_constitution_preserved: HARD_CONSTITUTION
          },
          evaluation_policy: {
            frozen_before_application: true,
            minimum_future_observations: 6,
            success: 'accuracy improves without worse transfer/calibration signal',
            rollback: 'remove penalty if future accuracy rises above 0.55 or evidence becomes contradictory'
          },
          status: 'sandbox'
        }));
      } else {
        out.push(this.store.appendTransformation({
          target: pressure.target,
          revision_level: LEVEL.POLICY,
          proposal: {
            action: 'investigate_gap',
            reason: pressure.kind,
            pressure_ref: pressure.pressure_id,
            auto_apply: false
          },
          evaluation_policy: {
            frozen_before_application: true,
            success: 'new evidence resolves or scopes the revision pressure'
          },
          status: 'requires_authority'
        }));
      }
    }

    return out;
  }

  applySafe() {
    const penalties = parseJson(this.store.getMeta('representation_penalties'), {});
    const applied = [];

    for (const transformation of this.store.listTransformations()) {
      if (
        transformation.status !== 'sandbox' ||
        transformation.revision_level > LEVEL.REPRESENTATION ||
        transformation.proposal.action !== 'deprioritize_representation'
      ) continue;

      const representation = transformation.proposal.representation;
      penalties[representation] = Math.max(
        -0.24,
        Number(penalties[representation] || 0) +
          Number(transformation.proposal.delta || 0)
      );

      this.store.setMeta('representation_penalties', JSON.stringify(penalties));
      this.store.applyTransformation(transformation.transformation_id);

      if (transformation.proposal.pressure_ref) {
        this.store.resolvePressure(transformation.proposal.pressure_ref);
      }

      applied.push(transformation.transformation_id);
    }

    return applied;
  }

  audit(scope = 'periodic') {
    const violations = [];

    for (const state of this.store.listStudentStates()) {
      if (!state.model_version) {
        violations.push({
          law: 'genealogy_conservation',
          target: state.concept_id,
          detail: 'missing model_version'
        });
      }

      if (!Array.isArray(state.evidence_refs)) {
        violations.push({
          law: 'evidence_conservation',
          target: state.concept_id,
          detail: 'missing evidence_refs'
        });
      }

      if (state.uncertainty < 0 || state.uncertainty > 1) {
        violations.push({
          law: 'explicit_uncertainty',
          target: state.concept_id,
          detail: 'uncertainty out of bounds'
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
      epistemic_note:
        'Structural audit only; it does not prove educational efficacy.'
    };

    return {
      ...report,
      audit_id: this.store.appendAudit(scope, report)
    };
  }

  maintenance({ forceAudit = false } = {}) {
    const pressure_ids = this.detectPressures();
    const proposal_ids = this.propose();
    const applied_ids = this.applySafe();
    const cycles = Number(this.store.getMeta('cycle_count') || 0);

    const audit =
      forceAudit ||
      (cycles > 0 && cycles % this.auditEveryCycles === 0)
        ? this.audit(forceAudit ? 'forced' : 'periodic')
        : null;

    return { pressure_ids, proposal_ids, applied_ids, audit };
  }
}
