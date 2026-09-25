import { clamp01, parseJson } from './store.mjs';

export class StudentModel {
  static MODEL_VERSION = 'bayes-heuristic-v0.1';
  constructor(store) { this.store = store; }

  observe(input) {
    if (!input.concept_id) throw new Error('concept_id is required');
    const outcome = input.correct === true || input.correct === 1 || input.correct === '1' ? 1 : 0;
    return this.store.appendEvidence({ event_type: 'student_observation', concept_id: input.concept_id, source_ref: input.source_ref ?? null, epistemic_status: 'OBSERVED', payload: { outcome, confidence: input.confidence == null ? null : clamp01(input.confidence), latency_ms: input.latency_ms == null ? null : Number(input.latency_ms), representation: input.representation ?? null, operation: input.operation ?? null, transfer: Boolean(input.transfer), misconception_id: input.misconception_id ?? null, context: input.context ?? {} } });
  }

  reduce(conceptId, asOf = new Date()) {
    const events = this.store.listEvidence({ eventType: 'student_observation', conceptId });
    let alpha = 1, beta = 1, calibrationTotal = 0, calibrationN = 0, transferCorrect = 0, transferN = 0, stabilityDays = 1, lastCorrectAt = null;
    const mis = new Map();
    for (const event of events) {
      const p = event.payload;
      if (p.outcome === 1) {
        alpha += 1;
        const d = new Date(event.created_at);
        if (lastCorrectAt) stabilityDays = Math.min(365, Math.max(1, stabilityDays * 1.35 + Math.max(0, (d - lastCorrectAt) / 86400000) * 0.2));
        lastCorrectAt = d;
      } else {
        beta += 1;
        if (p.confidence != null && p.confidence >= 0.8) {
          const key = p.misconception_id || 'high_confidence_error_unknown';
          mis.set(key, (mis.get(key) || 0) + 1);
        }
      }
      if (p.confidence != null) { calibrationTotal += 1 - Math.abs(clamp01(p.confidence) - p.outcome); calibrationN += 1; }
      if (p.transfer) { transferN += 1; transferCorrect += p.outcome; }
    }
    const totalMis = [...mis.values()].reduce((a, b) => a + b, 0);
    const state = {
      concept_id: conceptId,
      model_version: StudentModel.MODEL_VERSION,
      mastery: alpha / (alpha + beta),
      uncertainty: clamp01(2 / (alpha + beta)),
      retrievability: lastCorrectAt ? Math.exp(-Math.max(0, (asOf - lastCorrectAt) / 86400000) / Math.max(stabilityDays, 0.25)) : 0,
      transfer: transferN ? transferCorrect / transferN : 0,
      calibration: calibrationN ? calibrationTotal / calibrationN : 0.5,
      misconceptions: Object.fromEntries([...mis.entries()].map(([k, v]) => [k, totalMis ? v / totalMis : 0])),
      evidence_refs: events.map((e) => e.event_id),
      evidence_count: events.length
    };
    this.store.upsertStudentState(state);
    return state;
  }
}

export class OperationPlanner {
  plan(state, mode = 'learning') {
    const m = Math.max(0, ...Object.values(state.misconceptions || {}));
    let operation = 'apply';
    if (mode === 'diagnostic' && state.uncertainty > 0.35) operation = 'discriminate_hypotheses';
    else if (m >= 0.5) operation = 'differentiate';
    else if (state.evidence_count < 2) operation = 'probe';
    else if (state.mastery < 0.45) operation = 'explain';
    else if (state.mastery >= 0.55 && state.retrievability < 0.55) operation = 'retrieve';
    else if (state.mastery >= 0.75 && state.transfer < 0.6) operation = 'transfer';
    return { operation, mode, objective: 'Improve or measure ' + state.concept_id + ' through ' + operation, target_state: state.concept_id, desired_evidence: mode === 'diagnostic' ? 'uncertainty_reduction' : 'learning_outcome', success_criteria: { immediate_correct: true, delayed_recheck_required: mode === 'learning' }, based_on_state_version: state.model_version };
  }
}

const REPS = {
  probe: [['retrieval_prompt', 0.82], ['confidence_probe', 0.74], ['minimal_case', 0.68]],
  discriminate_hypotheses: [['contrastive_probe', 0.84], ['comparison_table', 0.72], ['minimal_case', 0.70]],
  differentiate: [['comparison_table', 0.82], ['contrastive_case', 0.80], ['causal_graph', 0.62]],
  explain: [['worked_example', 0.82], ['mechanistic_text', 0.76], ['causal_graph', 0.72]],
  retrieve: [['retrieval_prompt', 0.86], ['cloze_grid', 0.76], ['flashcard', 0.70]],
  transfer: [['clinical_case', 0.88], ['branching_case', 0.80], ['simulation_prompt', 0.68]],
  apply: [['clinical_case', 0.82], ['worked_example', 0.72], ['decision_table', 0.68]]
};

export class RepresentationPlanner {
  constructor(store) { this.store = store; }
  plan({ conceptId, state, intervention }) {
    const penalties = parseJson(this.store.getMeta('representation_penalties'), {});
    const candidates = (REPS[intervention.operation] || REPS.probe).map(([representation, base]) => ({ representation, expected_utility: clamp01(base + (penalties[representation] || 0) + (state.uncertainty > 0.45 && representation.includes('probe') ? 0.06 : 0)), evidence_strength: state.evidence_count < 5 ? 'LOW' : 'PROVISIONAL' })).sort((a, b) => b.expected_utility - a.expected_utility);
    const decision = { concept_id: conceptId, intervention, candidates, selected_representation: candidates[0].representation, uncertainty: state.uncertainty, policy_version: 'representation-rules-v0.1', epistemic_status: 'HYPOTHESIS_DRIVEN_DECISION' };
    return { ...decision, decision_id: this.store.appendDecision('representation', conceptId, decision) };
  }
}

export class ResourceFactory {
  constructor(store) { this.store = store; }
  create({ conceptId, intervention, representationDecision }) {
    const needle = String(conceptId).replaceAll('_', ' ').toLowerCase();
    const claims = this.store.listClaims(200).filter((c) => c.metadata?.concept_id === conceptId || c.metadata?.topic_id === conceptId || String(c.statement).toLowerCase().includes(needle)).slice(0, 8);
    const provenance = claims.map((c) => ({ claim_id: c.claim_id, source_id: c.source_id })).filter((x) => x.claim_id || x.source_id);
    const rep = representationDecision.selected_representation;
    let data;
    if (rep === 'comparison_table' || rep === 'decision_table') data = { columns: ['evidence', 'source'], rows: claims.map((c) => [c.statement, c.source_id || 'unlinked']), instruction: 'Compare the evidence related to ' + conceptId + '.' };
    else if (rep === 'causal_graph') data = { nodes: [{ id: conceptId, label: conceptId }, ...claims.map((c) => ({ id: c.claim_id, label: c.statement }))], edges: claims.map((c) => ({ from: c.claim_id, to: conceptId, relation: 'supports_or_relates_to' })) };
    else if (rep.includes('case')) data = { prompt: 'Apply ' + conceptId + ' to a novel clinical situation. State your decision and confidence before requesting feedback.', evidence_pool: claims.map((c) => c.statement) };
    else if (rep === 'worked_example' || rep === 'mechanistic_text') data = { prompt: 'Explain ' + conceptId + ' mechanistically, then identify the step most likely to fail under transfer.', evidence_pool: claims.map((c) => c.statement) };
    else data = { prompt: 'Retrieve the key facts and relations for ' + conceptId + ' without looking at the source. Report confidence 0-1.', evidence_pool: claims.map((c) => c.statement) };
    const spec = { resource_type: rep, schema_version: '0.1', concept_id: conceptId, learning_objective: intervention.objective, target_operation: intervention.operation, accessibility: { keyboard_required: true, text_equivalent_required: true }, instrumentation: ['answer', 'confidence', 'latency_ms', 'representation', 'operation'], provenance, data, decision_ref: representationDecision.decision_id };
    return { ...spec, resource_id: this.store.appendResource(conceptId, spec) };
  }
}
