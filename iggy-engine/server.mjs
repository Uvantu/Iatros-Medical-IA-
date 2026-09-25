#!/usr/bin/env node
import http from 'node:http';
import path from 'node:path';
import { IggyLiveEngine } from './index.mjs';

const port = Number(process.env.IGGY_PORT || 8791);
const origin = process.env.IGGY_ALLOWED_ORIGIN || 'http://localhost:5173';
const engine = new IggyLiveEngine({
  dbPath: path.resolve(process.env.IGGY_DB_PATH || '.iggy/iggy-live.sqlite'),
  auditEveryCycles: Number(process.env.IGGY_AUDIT_EVERY_CYCLES || 10)
});

if (process.env.IGGY_KB_DIR || process.env.IGGY_MANIFEST_PATH) {
  const boot = engine.ingest({
    kbDir: process.env.IGGY_KB_DIR || null,
    manifestPath: process.env.IGGY_MANIFEST_PATH || null
  });
  console.log('IGGY boot ingestion:', JSON.stringify(boot.status));
}

const send = (res, status, body) => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS'
  });
  res.end(JSON.stringify(body));
};

const readJson = async (req) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});

  try {
    if (req.method === 'GET' && req.url === '/api/iggy/status') {
      return send(res, 200, engine.status());
    }
    if (req.method === 'GET' && req.url === '/api/iggy/research-queue') {
      return send(res, 200, engine.researchQueue());
    }
    if (req.method === 'POST' && req.url === '/api/iggy/observe') {
      return send(res, 200, engine.observe(await readJson(req)));
    }
    if (req.method === 'POST' && req.url === '/api/iggy/cycle') {
      const body = await readJson(req);
      return send(res, 200, engine.cycle({
        conceptId: body.concept_id || body.conceptId,
        mode: body.mode || 'learning',
        forceAudit: Boolean(body.force_audit)
      }));
    }
    if (req.method === 'POST' && req.url === '/api/iggy/ingest') {
      return send(res, 200, engine.ingest(await readJson(req)));
    }
    if (req.method === 'POST' && req.url === '/api/iggy/revision-pressure') {
      return send(res, 200, engine.signalRevisionPressure(await readJson(req)));
    }
    if (req.method === 'POST' && req.url === '/api/iggy/research-result') {
      return send(res, 200, engine.completeResearch(await readJson(req)));
    }
    if (req.method === 'POST' && req.url === '/api/iggy/audit') {
      return send(res, 200, engine.audit());
    }
    return send(res, 404, { error: 'not_found' });
  } catch (error) {
    return send(res, 400, { error: error.message });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('IGGY Live Engine listening on http://127.0.0.1:' + port);
});

const shutdown = () => {
  engine.close();
  server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
