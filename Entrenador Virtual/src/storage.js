import { createSeedData } from "./seed.js";

const API_ROOT = "/api";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortByDateDescending(entries) {
  return entries
    .slice()
    .sort((left, right) => String(right.date).localeCompare(String(left.date)));
}

function ensureShape(data) {
  const seed = createSeedData();

  return {
    version: data?.version || seed.version,
    athleteProfile: data?.athleteProfile || seed.athleteProfile,
    dailyCheckins: Array.isArray(data?.dailyCheckins) ? sortByDateDescending(data.dailyCheckins) : seed.dailyCheckins,
    sessions: Array.isArray(data?.sessions) ? sortByDateDescending(data.sessions) : seed.sessions,
    exerciseEntries: Array.isArray(data?.exerciseEntries) ? sortByDateDescending(data.exerciseEntries) : seed.exerciseEntries,
    exerciseRecords: Array.isArray(data?.exerciseRecords) ? clone(data.exerciseRecords) : [],
    storage: data?.storage || {
      mode: "browser_fallback",
      databasePath: "",
      lastSyncAt: null,
    },
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = response.statusText;

    try {
      const payload = await response.json();
      detail = payload?.detail || payload?.error || detail;
    } catch (error) {
      console.warn("No fue posible leer el error detallado del servidor.", error);
    }

    throw new Error(detail || "No fue posible conectar con la base de datos local.");
  }

  return response.json();
}

export async function loadAppData() {
  try {
    const payload = await requestJson("/app-data", { method: "GET" });
    return ensureShape(payload);
  } catch (error) {
    console.warn("No fue posible leer la base local. Se cargara la semilla temporal.", error);
    return ensureShape(createSeedData());
  }
}

export async function saveCheckin(checkin) {
  const payload = await requestJson("/checkins", {
    method: "POST",
    body: JSON.stringify(checkin),
  });

  return ensureShape(payload);
}

export async function saveSession(session, exerciseEntries = []) {
  const payload = await requestJson("/sessions", {
    method: "POST",
    body: JSON.stringify({ session, exerciseEntries }),
  });

  return ensureShape(payload);
}

export function getLatestCheckin(data) {
  return ensureShape(data).dailyCheckins[0] || null;
}

export function getLatestSession(data) {
  return ensureShape(data).sessions[0] || null;
}

export function getSessionExerciseEntries(data, sessionId) {
  return ensureShape(data).exerciseEntries.filter((entry) => entry.session_id === sessionId);
}

export function createSessionId(date, sessionType, index) {
  const fragment = sessionType.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `${date}-${fragment}-${String(index).padStart(2, "0")}`;
}

export function createExerciseEntryId(sessionId, index) {
  return `${sessionId}-ex-${String(index).padStart(2, "0")}`;
}
