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
    return {
      certified_kb: kbDir
        ? this.knowledge.ingestCertifiedKnowledgeBase(kbDir)
        : null,
      manifest: manifestPath
        ? this.knowledge.ingestManifest(manifestPath)
        : null,
      status: this.store.stats()
    };
  }

  observe(observation) {
    const event_id = this.student.observe(observation);
    return {
      event_id,
      state: this.student.reduce(observation.concept_id)
    };
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

  audit() {
    return this.revision.audit('manual');
  }

  status() {
    return {
      engine_version: 'iggy-live-v0.1',
      hard_constitution: HARD_CONSTITUTION,
      store: this.store.stats(),
      open_pressures: this.store.listOpenPressures(),
      recent_transformations:
        this.store.listTransformations().slice(0, 20)
    };
  }

  close() {
    this.store.close();
  }
}

export { HARD_CONSTITUTION } from './revision.mjs';
