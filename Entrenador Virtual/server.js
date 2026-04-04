import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

import { buildEntryStrengthMetrics, buildExerciseRecords } from "./src/engine.js";
import { createSeedData } from "./src/seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIRECTORY = __dirname;
const DEFAULT_DATABASE_PATH = path.join(ROOT_DIRECTORY, "data", "entrenador-virtual.sqlite");
const DATABASE_PATH = path.resolve(process.env.ENTRENADOR_DB_PATH || DEFAULT_DATABASE_PATH);
const DATA_DIRECTORY = path.dirname(DATABASE_PATH);
const LEGACY_PLACEHOLDER_SESSION_ID = "2026-04-03-mesa-01";
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function parsePort(argv) {
  const portFlagIndex = argv.findIndex((value) => value === "--port");

  if (portFlagIndex >= 0) {
    const candidate = Number(argv[portFlagIndex + 1]);

    if (Number.isInteger(candidate) && candidate > 0) {
      return candidate;
    }
  }

  const positional = Number(argv[2]);
  return Number.isInteger(positional) && positional > 0 ? positional : 8000;
}

function nowIso() {
  return new Date().toISOString();
}

function sortByDateDescending(entries) {
  return entries
    .slice()
    .sort((left, right) => String(right.date).localeCompare(String(left.date)));
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function sendJson(response, statusCode, payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
  });
  response.end(body);
}

function sendText(response, statusCode, message) {
  const body = Buffer.from(String(message), "utf8");
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": body.length,
  });
  response.end(body);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });
    request.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    request.on("error", reject);
  });
}

function openDatabase() {
  ensureDirectory(DATA_DIRECTORY);
  const database = new DatabaseSync(DATABASE_PATH);
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS athlete_profile (
      athlete_id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checkins (
      checkin_date TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      session_date TEXT NOT NULL,
      session_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercise_entries (
      entry_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      session_date TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      side TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exercise_records (
      exercise_key TEXT PRIMARY KEY,
      exercise_name TEXT NOT NULL,
      side TEXT NOT NULL,
      pattern TEXT,
      category TEXT,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date DESC);
    CREATE INDEX IF NOT EXISTS idx_exercise_entries_date ON exercise_entries(session_date DESC);
    CREATE INDEX IF NOT EXISTS idx_exercise_entries_name ON exercise_entries(exercise_name, side);
  `);

  return database;
}

function parsePayloadRow(row) {
  return row ? JSON.parse(row.payload) : null;
}

function loadCheckins(database) {
  const statement = database.prepare("SELECT payload FROM checkins ORDER BY checkin_date DESC");
  return statement.all().map(parsePayloadRow);
}

function loadSessions(database) {
  const statement = database.prepare("SELECT payload FROM sessions ORDER BY session_date DESC, session_id DESC");
  return statement.all().map(parsePayloadRow);
}

function loadExerciseEntries(database) {
  const statement = database.prepare("SELECT payload FROM exercise_entries ORDER BY session_date DESC, entry_id DESC");
  return statement.all().map(parsePayloadRow);
}

function loadExerciseRecords(database) {
  const statement = database.prepare("SELECT payload FROM exercise_records ORDER BY exercise_name COLLATE NOCASE ASC, side COLLATE NOCASE ASC");
  return statement.all().map(parsePayloadRow);
}

function loadAthleteProfile(database) {
  const row = database.prepare("SELECT payload FROM athlete_profile LIMIT 1").get();
  return parsePayloadRow(row);
}

function loadAppData(database) {
  return {
    version: 7,
    athleteProfile: loadAthleteProfile(database),
    dailyCheckins: sortByDateDescending(loadCheckins(database)),
    sessions: sortByDateDescending(loadSessions(database)),
    exerciseEntries: sortByDateDescending(loadExerciseEntries(database)),
    exerciseRecords: loadExerciseRecords(database),
    storage: {
      mode: "sqlite",
      databasePath: DATABASE_PATH,
      lastSyncAt: nowIso(),
    },
  };
}

function runTransaction(database, callback) {
  database.exec("BEGIN IMMEDIATE");

  try {
    const result = callback();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function saveAthleteProfile(database, athleteProfile) {
  const statement = database.prepare(`
    INSERT INTO athlete_profile (athlete_id, payload, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(athlete_id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `);
  const timestamp = nowIso();
  statement.run(
    athleteProfile.athlete_id,
    JSON.stringify(athleteProfile),
    timestamp
  );
}

function saveCheckin(database, checkin) {
  const statement = database.prepare(`
    INSERT INTO checkins (checkin_date, payload, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(checkin_date) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `);
  const timestamp = nowIso();
  statement.run(checkin.date, JSON.stringify(checkin), timestamp);
}

function enrichExerciseEntry(entry) {
  const metrics = buildEntryStrengthMetrics(entry);

  return {
    ...entry,
    effort_type: entry.effort_type || (Number(entry.duration_seconds) > 0 ? "isometric_hold" : "dynamic"),
    duration_seconds: Math.max(0, Number(entry.duration_seconds) || 0),
    confirmed_rm: Boolean(entry.confirmed_rm),
    load: Number(entry.load) || 0,
    sets: Number(entry.sets) || 0,
    reps: Number(entry.reps) || 0,
    rpe: Number(entry.rpe) || 0,
    pain_during: Number(entry.pain_during) || 0,
    vector_quality: Number(entry.vector_quality) || 0,
    technique_quality: Number(entry.technique_quality) || 0,
    estimated_rm_kg: metrics.theoreticalRmKg,
    confirmed_rm_kg: metrics.confirmedRmKg,
    current_rm_kg: metrics.currentRmKg,
    rm_source_type: metrics.rmSourceType,
    estimated_failure_reps: metrics.estimatedFailureReps,
  };
}

function saveSessionWithEntries(database, session, exerciseEntries) {
  const sessionStatement = database.prepare(`
    INSERT INTO sessions (session_id, session_date, session_type, payload, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      session_date = excluded.session_date,
      session_type = excluded.session_type,
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `);
  const entryStatement = database.prepare(`
    INSERT INTO exercise_entries (entry_id, session_id, session_date, exercise_name, side, payload, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(entry_id) DO UPDATE SET
      session_id = excluded.session_id,
      session_date = excluded.session_date,
      exercise_name = excluded.exercise_name,
      side = excluded.side,
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `);
  const deleteEntryStatement = database.prepare("DELETE FROM exercise_entries WHERE session_id = ?");
  const timestamp = nowIso();
  const sanitizedEntries = exerciseEntries.map(enrichExerciseEntry);
  const completeSession = {
    ...session,
    exercise_entry_count: sanitizedEntries.length,
  };

  sessionStatement.run(
    completeSession.session_id,
    completeSession.date,
    completeSession.session_type,
    JSON.stringify(completeSession),
    timestamp
  );

  deleteEntryStatement.run(completeSession.session_id);

  sanitizedEntries.forEach((entry) => {
    entryStatement.run(
      entry.entry_id,
      completeSession.session_id,
      entry.date,
      entry.exercise_name,
      entry.side || "unspecified",
      JSON.stringify(entry),
      timestamp
    );
  });
}

function refreshExerciseRecords(database) {
  const deleteStatement = database.prepare("DELETE FROM exercise_records");
  const insertStatement = database.prepare(`
    INSERT INTO exercise_records (exercise_key, exercise_name, side, pattern, category, payload, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const exerciseEntries = loadExerciseEntries(database);
  const latestCheckin = sortByDateDescending(loadCheckins(database))[0] || null;
  const records = buildExerciseRecords(exerciseEntries, {
    latestCheckin,
    referenceDate: latestCheckin?.date || exerciseEntries[0]?.date || new Date().toISOString().slice(0, 10),
  });
  const timestamp = nowIso();

  deleteStatement.run();

  records.forEach((record) => {
    insertStatement.run(
      record.exerciseKey,
      record.exerciseName,
      record.side || "unspecified",
      record.pattern || "",
      record.category || "",
      JSON.stringify(record),
      timestamp
    );
  });
}

function clearDatabase(database) {
  database.prepare("DELETE FROM exercise_records").run();
  database.prepare("DELETE FROM exercise_entries").run();
  database.prepare("DELETE FROM sessions").run();
  database.prepare("DELETE FROM checkins").run();
  database.prepare("DELETE FROM athlete_profile").run();
}

function migrateLegacySeedDataIfNeeded(database) {
  const sessionRows = database.prepare("SELECT session_id FROM sessions ORDER BY session_id ASC").all();

  if (sessionRows.length !== 1 || sessionRows[0]?.session_id !== LEGACY_PLACEHOLDER_SESSION_ID) {
    return;
  }

  const seed = createSeedData();

  runTransaction(database, () => {
    clearDatabase(database);
    saveAthleteProfile(database, seed.athleteProfile);
    seed.dailyCheckins.forEach((checkin) => saveCheckin(database, checkin));
    seed.sessions.forEach((session) => {
      const sessionEntries = seed.exerciseEntries.filter((entry) => entry.session_id === session.session_id);
      saveSessionWithEntries(database, session, sessionEntries);
    });
    refreshExerciseRecords(database);
  });
}

function seedDatabaseIfNeeded(database) {
  const countRow = database.prepare("SELECT COUNT(*) AS count FROM sessions").get();

  if (Number(countRow?.count || 0) > 0) {
    return;
  }

  const seed = createSeedData();

  runTransaction(database, () => {
    saveAthleteProfile(database, seed.athleteProfile);
    seed.dailyCheckins.forEach((checkin) => saveCheckin(database, checkin));
    seed.sessions.forEach((session) => {
      const sessionEntries = seed.exerciseEntries.filter((entry) => entry.session_id === session.session_id);
      saveSessionWithEntries(database, session, sessionEntries);
    });
    refreshExerciseRecords(database);
  });
}

async function handleApiRequest(database, request, response) {
  if (request.method === "GET" && request.url === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      mode: "sqlite",
      databasePath: DATABASE_PATH,
    });
    return true;
  }

  if (request.method === "GET" && request.url === "/api/app-data") {
    sendJson(response, 200, loadAppData(database));
    return true;
  }

  if (request.method === "POST" && request.url === "/api/checkins") {
    const rawBody = await readRequestBody(request);
    const payload = rawBody ? JSON.parse(rawBody) : null;

    if (!payload?.date) {
      sendJson(response, 400, { error: "Payload de check-in invalido." });
      return true;
    }

    runTransaction(database, () => {
      saveCheckin(database, payload);
      refreshExerciseRecords(database);
    });
    sendJson(response, 200, loadAppData(database));
    return true;
  }

  if (request.method === "POST" && request.url === "/api/sessions") {
    const rawBody = await readRequestBody(request);
    const payload = rawBody ? JSON.parse(rawBody) : null;
    const session = payload?.session;
    const exerciseEntries = Array.isArray(payload?.exerciseEntries) ? payload.exerciseEntries : null;

    if (!session?.session_id || !session?.date || !exerciseEntries) {
      sendJson(response, 400, { error: "Payload de sesion invalido." });
      return true;
    }

    runTransaction(database, () => {
      saveSessionWithEntries(database, session, exerciseEntries);
      refreshExerciseRecords(database);
    });
    sendJson(response, 200, loadAppData(database));
    return true;
  }

  return false;
}

function resolveStaticPath(requestUrl) {
  const pathname = new URL(requestUrl, "http://localhost").pathname;
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const candidatePath = path.join(ROOT_DIRECTORY, relativePath);
  const fullPath = path.resolve(candidatePath);

  if (!fullPath.startsWith(ROOT_DIRECTORY)) {
    return null;
  }

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    return path.join(fullPath, "index.html");
  }

  return fullPath;
}

function handleStaticRequest(request, response) {
  const fullPath = resolveStaticPath(request.url || "/");

  if (!fullPath) {
    sendText(response, 403, "403 - Acceso denegado");
    return;
  }

  if (!fs.existsSync(fullPath)) {
    sendText(response, 404, "404 - Archivo no encontrado");
    return;
  }

  const extension = path.extname(fullPath).toLowerCase();
  const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
  const body = fs.readFileSync(fullPath);
  response.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": body.length,
  });
  response.end(body);
}

const port = parsePort(process.argv);
const database = openDatabase();
seedDatabaseIfNeeded(database);
migrateLegacySeedDataIfNeeded(database);
refreshExerciseRecords(database);

const server = http.createServer(async (request, response) => {
  try {
    const apiHandled = await handleApiRequest(database, request, response);

    if (apiHandled) {
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendText(response, 405, "405 - Metodo no permitido");
      return;
    }

    handleStaticRequest(request, response);
  } catch (error) {
    console.error("Error en el servidor local:", error);
    sendJson(response, 500, {
      error: "Error interno del servidor.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Servidor activo en http://localhost:${port}`);
  console.log(`Base de datos activa en ${DATABASE_PATH}`);
  console.log("Presiona Ctrl + C para detenerlo.");
});
