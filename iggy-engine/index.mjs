import { IggyStore } from './store.mjs';
import { KnowledgeBridge } from './knowledge.mjs';
import {
  StudentModel,
  OperationPlanner,
  RepresentationPlanner,
  ResourceFactory
} from './cognition.mjs';
import { RevisionEngine, HARD_CONSTITUTION } from './revision.mjs';

export class IggyLiveEngine {
  constructor({ dbPath, auditEveryCycles = 10 } = {}) {
    this.store = new IggyStore(dbPath);
    this.knowledge = new KnowledgeBridge(this.store);
    this.student = new StudentModel(this.store);
    this.operations = new OperationPlanner();
    this.representations = new RepresentationPlanner(this.store);
    this.resources = new ResourceFactory(this.store);
    this.revision = new RevisionEngine(this.store, { auditEveryCycles });
  }

  ingest({ kbDir = null, manifestPath = null } = {}) {
    const result = {
      certified_kb: kbDir ? this.knowledge.ingestCertifiedKnowledgeBase(kbDir) : null,
      manifest: manifestPath ? this.knowledge.ingestManifest(manifestPath) : null
    };
    return { ...result, maintenance: this.revision.maintenance(), status: this.store.stats() };
  }

  observe(observation) {
    const event_id = this.student.observe(observation);
    const state = this.student.reduce(observation.concept_id);
    return { event_id, state };
  }

  cycle({ conceptId, mode = 'learning', forceAudit = false } = {}) {
    if (!conceptId) throw new Error('conceptId is required');

    const state = this.student.reduce(conceptId);
    const intervention = this.operations.plan(state, mode);
    const representation = this.representations.plan({
      conceptId,
      state,
      intervention
    });
    const resource = this.resources.create({
      conceptId,
      intervention,
      representationDecision: representation
    });

    const cycle = Number(this.store.getMeta('cycle_count') || 0) + 1;
    this.store.setMeta('cycle_count', String(cycle));

    return {
      engine_version: 'iggy-live-v0.1',
      cycle,
      state,
      intervention,
      representation,
      resource,
      maintenance: this.revision.maintenance({ forceAudit })
    };
  }

  signalRevisionPressure(pressure) {
    const pressure_id = this.revision.signalPressure(pressure);
    return {
      pressure_id,
      maintenance: this.revision.maintenance()
    };
  }

  researchQueue(status = 'queued') {
    return this.store.listResearchTasks(status);
  }

  completeResearch({ task_id, result, evidence = null }) {
    if (!task_id) throw new Error('task_id is required');
    this.store.completeResearchTask(task_id, result);
    let evidence_id = null;
    if (evidence) {
      evidence_id = this.store.appendEvidence({
        event_type: 'research_result',
        epistemic_status: evidence.epistemic_status || 'SOURCE_BACKED',
        source_ref: evidence.source_ref ?? null,
        concept_id: evidence.concept_id ?? null,
        payload: {
          task_id,
          result,
          ...evidence.payload
        }
      });
    }
    return { task_id, evidence_id, maintenance: this.revision.maintenance() };
  }

  audit() { return this.revision.audit('manual'); }

  status() {
    return {
      engine_version: 'iggy-live-v0.1',
      hard_constitution: HARD_CONSTITUTION,
      store: this.store.stats(),
      open_pressures: this.store.listOpenPressures(),
      research_queue: this.store.listResearchTasks('queued'),
      recent_transformations: this.store.listTransformations().slice(0, 20)
    };
  }

  close() { this.store.close(); }
}

export { HARD_CONSTITUTION } from './revision.mjs';
