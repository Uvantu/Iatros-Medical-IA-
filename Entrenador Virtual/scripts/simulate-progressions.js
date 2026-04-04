import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildCurrentState,
  buildExerciseRecords,
  buildPerformanceSnapshot,
  buildSessionInsight,
  buildWeeklyDashboard,
  recommendSession,
} from "../src/engine.js";
import { createSeedData } from "../src/seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIRECTORY = path.resolve(__dirname, "..");
const DOCS_DIRECTORY = path.join(ROOT_DIRECTORY, "docs");
const REPORT_MARKDOWN_PATH = path.join(DOCS_DIRECTORY, "simulaciones-progresion.md");
const REPORT_JSON_PATH = path.join(DOCS_DIRECTORY, "simulaciones-progresion.json");
const DAY_MS = 24 * 60 * 60 * 1000;

const PLANNED_SESSION_OFFSETS = [2, 4, 7, 9, 11, 14, 16, 18];

const SCENARIOS = [
  {
    id: "perfecta_fuerza",
    label: "Perfecta en Fuerza",
    description: "Cumple todos los dias planeados, captura check-ins diarios y convierte casi todos los objetivos en progreso real.",
    actualSessionOffsets: PLANNED_SESSION_OFFSETS,
    shouldCaptureCheckin(dayOffset) {
      return dayOffset >= 1;
    },
    buildCheckin(dayOffset, isTrainingDay) {
      return {
        readiness: 8.4 + ((dayOffset % 3) * 0.2),
        pain: isTrainingDay ? 1.5 : 1.2,
        globalFatigue: isTrainingDay ? 4.5 : 3.5,
        forearmFatigue: isTrainingDay ? 4.5 : 3.5,
        backFatigue: 3.5,
        legsFatigue: 2.5,
        availableTimeMin: 100,
      };
    },
  },
  {
    id: "media",
    label: "Media",
    description: "Cumple las sesiones, pero la mayoria de las veces solo consolida sin una conversion clara de cada objetivo a nueva marca.",
    actualSessionOffsets: PLANNED_SESSION_OFFSETS,
    shouldCaptureCheckin(dayOffset) {
      return dayOffset % 2 === 0 || PLANNED_SESSION_OFFSETS.includes(dayOffset);
    },
    buildCheckin(dayOffset, isTrainingDay) {
      return {
        readiness: 6.8 + ((dayOffset % 2) * 0.3),
        pain: isTrainingDay ? 2.6 : 2.1,
        globalFatigue: isTrainingDay ? 5.4 : 4.8,
        forearmFatigue: isTrainingDay ? 5.2 : 4.6,
        backFatigue: 4.2,
        legsFatigue: 3,
        availableTimeMin: 90,
      };
    },
  },
  {
    id: "muy_pobre",
    label: "Muy Pobre",
    description: "Hay captura frecuente, pero la sesion llega con dolor alto, mala tolerancia y salidas pobres. Sirve para ver si el sistema de verdad frena.",
    actualSessionOffsets: PLANNED_SESSION_OFFSETS,
    shouldCaptureCheckin(dayOffset) {
      return dayOffset >= 1;
    },
    buildCheckin(dayOffset, isTrainingDay) {
      const worsening = Math.min(1.4, dayOffset * 0.06);

      return {
        readiness: Math.max(4.2, 6.2 - worsening),
        pain: isTrainingDay ? 4.2 + worsening : 3.8 + worsening,
        globalFatigue: 6.3 + (isTrainingDay ? 0.7 : 0.3),
        forearmFatigue: 6.8 + (isTrainingDay ? 0.8 : 0.4),
        backFatigue: 5.3,
        legsFatigue: 3.4,
        availableTimeMin: 85,
      };
    },
  },
  {
    id: "dias_saltados",
    label: "Dias Saltados",
    description: "Se pierden varios dias planeados y casi no hay check-ins entre sesiones. Debe quedar visible que la precision del sistema cae aunque el dolor no sea altisimo.",
    actualSessionOffsets: [2, 7, 14, 18],
    shouldCaptureCheckin(dayOffset) {
      return [2, 7, 14, 18].includes(dayOffset);
    },
    buildCheckin(dayOffset) {
      return {
        readiness: 7 + ((dayOffset % 3) * 0.2),
        pain: 2.8,
        globalFatigue: 5.2,
        forearmFatigue: 5,
        backFatigue: 4.1,
        legsFatigue: 2.6,
        availableTimeMin: 95,
      };
    },
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeDate(dateText) {
  return new Date(`${dateText}T12:00:00`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateText, days) {
  const nextDate = normalizeDate(dateText);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return formatDate(nextDate);
}

function sortByDateDescending(entries) {
  return entries
    .slice()
    .sort((left, right) => String(right.date).localeCompare(String(left.date)));
}

function buildExerciseKey(exerciseName, side) {
  return `${String(exerciseName).trim().toLowerCase()}::${String(side || "unspecified").trim().toLowerCase()}`;
}

function roundNumber(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(digits));
}

function getLoadStep(load) {
  if (!Number.isFinite(load) || load <= 0) {
    return 0.5;
  }

  if (load >= 25) {
    return 2.5;
  }

  if (load >= 10) {
    return 1;
  }

  return 0.5;
}

function parseTargetLabel(label, fallback = {}) {
  const safeLabel = String(label || "");
  const dynamicMatch = safeLabel.match(/([\d.]+)\s+(kg|lbs)\s+x\s+(\d+)\s+reps/i);

  if (dynamicMatch) {
    return {
      load: Number(dynamicMatch[1]),
      loadUnit: dynamicMatch[2].toLowerCase(),
      reps: Number(dynamicMatch[3]),
      durationSeconds: 0,
      effortType: "dynamic",
    };
  }

  const holdMatch = safeLabel.match(/([\d.]+)\s+(kg|lbs)\s+x\s+(\d+)\s+s/i);

  if (holdMatch) {
    return {
      load: Number(holdMatch[1]),
      loadUnit: holdMatch[2].toLowerCase(),
      reps: 1,
      durationSeconds: Number(holdMatch[3]),
      effortType: "isometric_hold",
    };
  }

  return {
    load: Number(fallback.load) || 0,
    loadUnit: fallback.loadUnit || "kg",
    reps: Number(fallback.reps) || 1,
    durationSeconds: Number(fallback.durationSeconds) || 0,
    effortType: fallback.effortType || "dynamic",
  };
}

function buildTrackedExerciseCatalog() {
  const seed = createSeedData();
  const records = buildExerciseRecords(seed.exerciseEntries);

  return records.map((record) => ({
    exerciseName: record.exerciseName,
    side: record.side,
    category: record.category,
    pattern: record.pattern,
    effortType: record.effortType,
    loadUnit: record.bestSet?.loadUnit || "kg",
    baseSetCount: record.bestSet?.sets || 1,
    notes: `simulado_desde_${record.exerciseName}`,
  }));
}

const TRACKED_EXERCISES = buildTrackedExerciseCatalog();

function buildCheckinPayload(baseDate, dayOffset, scenario, isTrainingDay) {
  const values = scenario.buildCheckin(dayOffset, isTrainingDay);

  return {
    date: addDays(baseDate, dayOffset),
    sleep_hours: roundNumber(isTrainingDay ? 7.4 : 7.8, 1),
    readiness: roundNumber(values.readiness, 1),
    bodyweight: 80,
    pain: {
      medial_elbow_right: roundNumber(values.pain, 1),
      lateral_elbow_right: 0,
      shoulder_right: 0,
      wrist_right: 0,
    },
    fatigue: {
      global: roundNumber(values.globalFatigue, 1),
      forearm_hand: roundNumber(values.forearmFatigue, 1),
      back: roundNumber(values.backFatigue, 1),
      legs: roundNumber(values.legsFatigue, 1),
    },
    available_time_min: values.availableTimeMin,
    session_type_planned: isTrainingDay ? "specific_aw" : "recovery",
  };
}

function buildEntryFromRecord(record, scenarioId, sessionIndex, gapDays) {
  const bestSet = record.bestSet || {};
  const current = {
    load: Number(bestSet.load) || 0,
    loadUnit: bestSet.loadUnit || "kg",
    reps: Number(bestSet.reps) || 1,
    durationSeconds: Number(bestSet.durationSeconds) || 0,
    effortType: record.effortType || bestSet.effortType || "dynamic",
  };
  const target = parseTargetLabel(record.nextTargetLabel, current);
  const step = getLoadStep(current.load);

  if (scenarioId === "perfecta_fuerza") {
    if (current.effortType === "isometric_hold") {
      return {
        load: target.load || current.load,
        reps: 1,
        durationSeconds: Math.max(target.durationSeconds || current.durationSeconds, current.durationSeconds + 3),
        rpe: 9.2,
        pain: 1.4,
        vector: 0.92,
        technique: 0.92,
      };
    }

    if (record.progressionAction === "hold") {
      return {
        load: current.load,
        reps: current.reps + 1,
        durationSeconds: 0,
        rpe: 7.7,
        pain: 1.5,
        vector: 0.91,
        technique: 0.9,
      };
    }

    return {
      load: target.load || current.load,
      reps: target.reps || current.reps,
      durationSeconds: 0,
      rpe: record.progressionAction === "increase" ? 7.6 : 8.4,
      pain: 1.5,
      vector: 0.91,
      technique: 0.9,
    };
  }

  if (scenarioId === "media") {
    if (current.effortType === "isometric_hold") {
      return {
        load: current.load,
        reps: 1,
        durationSeconds: current.durationSeconds + (sessionIndex % 2 === 0 ? 2 : 0),
        rpe: 8.8,
        pain: 2.5,
        vector: 0.85,
        technique: 0.85,
      };
    }

    if (record.progressionAction === "increase") {
      return {
        load: current.load,
        reps: current.reps + (sessionIndex % 2 === 0 ? 1 : 0),
        durationSeconds: 0,
        rpe: 8.8,
        pain: 2.6,
        vector: 0.84,
        technique: 0.85,
      };
    }

    if (record.progressionAction === "hold" && sessionIndex % 3 === 0) {
      return {
        load: current.load,
        reps: current.reps + 1,
        durationSeconds: 0,
        rpe: 8.7,
        pain: 2.5,
        vector: 0.84,
        technique: 0.85,
      };
    }

    return {
      load: current.load,
      reps: current.reps,
      durationSeconds: 0,
      rpe: 8.5,
      pain: 2.4,
      vector: 0.84,
      technique: 0.85,
    };
  }

  if (scenarioId === "muy_pobre") {
    if (current.effortType === "isometric_hold") {
      return {
        load: Math.max(step, current.load - step),
        reps: 1,
        durationSeconds: Math.max(12, current.durationSeconds - 5),
        rpe: 10,
        pain: 5.2,
        vector: 0.71,
        technique: 0.7,
      };
    }

    return {
      load: Math.max(step, current.load - step),
      reps: Math.max(1, current.reps - 1),
      durationSeconds: 0,
      rpe: 9.8,
      pain: 5.1,
      vector: 0.72,
      technique: 0.71,
    };
  }

  if (current.effortType === "isometric_hold") {
    return {
      load: current.load,
      reps: 1,
      durationSeconds: gapDays >= 4 ? Math.max(12, current.durationSeconds - 2) : current.durationSeconds + 1,
      rpe: gapDays >= 4 ? 9.4 : 8.8,
      pain: 2.8,
      vector: 0.82,
      technique: 0.82,
    };
  }

  return {
    load: gapDays >= 4 ? current.load : current.load,
    reps: gapDays >= 4 ? Math.max(1, current.reps - 1) : current.reps,
    durationSeconds: 0,
    rpe: gapDays >= 4 ? 9.2 : 8.8,
    pain: 2.9,
    vector: 0.81,
    technique: 0.82,
  };
}

function createSessionEntry(sessionId, sessionDate, index, config, scenarioId, sessionIndex, gapDays, record) {
  const actual = buildEntryFromRecord(record, scenarioId, sessionIndex, gapDays);

  return {
    entry_id: `${sessionId}-ex-${String(index + 1).padStart(2, "0")}`,
    session_id: sessionId,
    date: sessionDate,
    exercise_name: config.exerciseName,
    category: config.category,
    pattern: config.pattern,
    side: config.side,
    load: roundNumber(actual.load, 1),
    load_unit: config.loadUnit,
    effort_type: config.effortType,
    sets: config.baseSetCount,
    reps: actual.reps,
    duration_seconds: actual.durationSeconds,
    rpe: roundNumber(actual.rpe, 1),
    pain_during: roundNumber(actual.pain, 1),
    vector_quality: roundNumber(actual.vector, 2),
    technique_quality: roundNumber(actual.technique, 2),
    confirmed_rm: false,
    notes: `${config.notes}_${scenarioId}`,
  };
}

function addCheckin(data, checkin) {
  data.dailyCheckins = sortByDateDescending([checkin, ...data.dailyCheckins.filter((entry) => entry.date !== checkin.date)]);
}

function addSession(data, session, exerciseEntries) {
  data.sessions = sortByDateDescending([session, ...data.sessions]);
  data.exerciseEntries = sortByDateDescending([...exerciseEntries, ...data.exerciseEntries]);
}

function getLatestCheckin(data) {
  return data.dailyCheckins[0] || null;
}

function getLatestSession(data) {
  return data.sessions[0] || null;
}

function summarizeExerciseProgress(baselineMap, finalMap) {
  return TRACKED_EXERCISES.map((config) => {
    const key = buildExerciseKey(config.exerciseName, config.side);
    const baseline = baselineMap.get(key);
    const current = finalMap.get(key);

    return {
      exerciseName: config.exerciseName,
      side: config.side,
      baselineLabel: baseline?.recordLabel || "sin dato",
      finalLabel: current?.recordLabel || "sin dato",
      nextTargetLabel: current?.nextTargetLabel || "sin objetivo",
      rmDeltaKg: baseline?.currentRmKg && current?.currentRmKg
        ? roundNumber(current.currentRmKg - baseline.currentRmKg, 1)
        : null,
      durationDeltaSeconds: baseline?.durationSeconds && current?.durationSeconds
        ? current.durationSeconds - baseline.durationSeconds
        : null,
    };
  });
}

function buildCaptureGapSummary(plannedOffsets, actualOffsets) {
  const missedOffsets = plannedOffsets.filter((offset) => !actualOffsets.includes(offset));

  return {
    plannedSessions: plannedOffsets.length,
    executedSessions: actualOffsets.length,
    missedSessions: missedOffsets.length,
    missedOffsets,
  };
}

function buildScenarioSession(data, scenario, sessionDate, sessionIndex, dayOffset, recommendation) {
  const recordMap = new Map(
    buildExerciseRecords(data.exerciseEntries).map((record) => [buildExerciseKey(record.exerciseName, record.side), record])
  );
  const previousSessionDate = getLatestSession(data)?.date || data.sessions[data.sessions.length - 1]?.date || sessionDate;
  const gapDays = Math.max(0, Math.round((normalizeDate(sessionDate).getTime() - normalizeDate(previousSessionDate).getTime()) / DAY_MS));
  const sessionId = `${sessionDate}-sim-${scenario.id}-${String(sessionIndex).padStart(2, "0")}`;
  const exerciseEntries = TRACKED_EXERCISES.map((config, index) => {
    const key = buildExerciseKey(config.exerciseName, config.side);
    return createSessionEntry(
      sessionId,
      sessionDate,
      index,
      config,
      scenario.id,
      sessionIndex,
      gapDays,
      recordMap.get(key)
    );
  });
  const painPeak = Math.max(...exerciseEntries.map((entry) => Number(entry.pain_during) || 0), 0);
  const avgPain = exerciseEntries.reduce((total, entry) => total + Number(entry.pain_during || 0), 0) / exerciseEntries.length;
  const primaryPattern = painPeak >= 4.5 ? "supervivencia_de_carga" : "back_pressure_y_pronacion";

  return {
    session: {
      session_id: sessionId,
      date: sessionDate,
      session_type: "specific_aw",
      goal_of_session: sessionIndex % 2 === 0 ? "toproll_pesado" : "hook_ligero_controlado",
      effort_rpe_session: roundNumber(avgPain >= 4 ? 9.6 : avgPain >= 2.5 ? 8.6 : 7.8, 1),
      results: {
        best_pattern: primaryPattern,
        best_grip_condition: painPeak >= 4.5 ? "compensado_por_dolor" : "medio_neutro",
        main_limitation: painPeak >= 4.5 ? "dolor_medial_y_tolerancia" : "rising_y_hold_largo",
        could_stop: avgPain < 4,
        could_move: avgPain < 3,
        could_finish: avgPain < 2.2 && scenario.id === "perfecta_fuerza",
      },
      pain_events: painPeak >= 3
        ? [
            {
              zone: "medial_elbow_right",
              type: painPeak >= 5 ? "pain_spike" : "irritability",
              severity: roundNumber(painPeak, 1),
              during: "specific_aw",
              resolved_with: painPeak >= 5 ? "bajar_carga" : "continuar_controlado",
            },
          ]
        : [],
      exercise_entry_count: exerciseEntries.length,
      recommendation_label_before_session: recommendation?.session_recommendation?.label || "sin recomendacion",
      scheduled_day_offset: dayOffset,
    },
    exerciseEntries,
    gapDays,
  };
}

function runScenario(scenario) {
  const data = createSeedData();
  const seed = createSeedData();
  const baseDate = seed.dailyCheckins[0].date;
  const baselineRecordMap = new Map(
    buildExerciseRecords(seed.exerciseEntries).map((record) => [buildExerciseKey(record.exerciseName, record.side), record])
  );
  const endOffset = Math.max(...PLANNED_SESSION_OFFSETS);
  const timeline = [];
  let executedSessionCount = 0;

  for (let dayOffset = 1; dayOffset <= endOffset; dayOffset += 1) {
    const date = addDays(baseDate, dayOffset);
    const plannedSession = PLANNED_SESSION_OFFSETS.includes(dayOffset);
    const actualSession = scenario.actualSessionOffsets.includes(dayOffset);

    if (scenario.shouldCaptureCheckin(dayOffset, plannedSession, actualSession)) {
      addCheckin(data, buildCheckinPayload(baseDate, dayOffset, scenario, actualSession));
    }

    if (!plannedSession) {
      continue;
    }

    if (!actualSession) {
      timeline.push({
        date,
        planned: true,
        executed: false,
        readiness: null,
        pain: null,
        recommendationLabel: "sin captura",
        note: "dia planeado pero no ejecutado",
      });
      continue;
    }

    const latestCheckin = getLatestCheckin(data);
    const recommendation = latestCheckin
      ? recommendSession(data.athleteProfile, data.sessions, latestCheckin, data.exerciseEntries)
      : null;
    executedSessionCount += 1;
    const { session, exerciseEntries, gapDays } = buildScenarioSession(
      data,
      scenario,
      date,
      executedSessionCount,
      dayOffset,
      recommendation
    );

    addSession(data, session, exerciseEntries);

    const currentRecords = buildExerciseRecords(data.exerciseEntries);
    const pullup = currentRecords.find((record) => record.exerciseName === "dominada_neutra_grip_grueso");
    const pronation = currentRecords.find((record) => record.exerciseName === "pronacion_media");

    timeline.push({
      date,
      planned: true,
      executed: true,
      readiness: latestCheckin?.readiness || null,
      pain: latestCheckin?.pain?.medial_elbow_right || null,
      recommendationLabel: recommendation?.session_recommendation?.label || "sin recomendacion",
      note: `pull-up siguiente: ${pullup?.nextTargetLabel || "sin objetivo"} | pronacion media siguiente: ${pronation?.nextTargetLabel || "sin objetivo"} | gap previo: ${gapDays} d`,
    });
  }

  const latestCheckin = getLatestCheckin(data);
  const context = latestCheckin
    ? buildCurrentState(data.athleteProfile, data.sessions, latestCheckin, data.exerciseEntries)
    : null;
  const finalRecommendation = latestCheckin
    ? recommendSession(data.athleteProfile, data.sessions, latestCheckin, data.exerciseEntries)
    : null;
  const latestSession = getLatestSession(data);
  const sessionInsight = latestSession
    ? buildSessionInsight(data.athleteProfile, latestSession, data.exerciseEntries)
    : null;
  const weeklyDashboard = buildWeeklyDashboard(
    data.athleteProfile,
    data.dailyCheckins,
    data.sessions,
    data.exerciseEntries,
    latestCheckin?.date || baseDate
  );
  const finalRecords = buildExerciseRecords(data.exerciseEntries);
  const performanceSnapshot = buildPerformanceSnapshot(
    data.athleteProfile,
    latestCheckin,
    context,
    finalRecommendation,
    weeklyDashboard,
    sessionInsight,
    data.exerciseEntries,
    finalRecords
  );
  const finalRecordMap = new Map(finalRecords.map((record) => [buildExerciseKey(record.exerciseName, record.side), record]));
  const captureSummary = buildCaptureGapSummary(PLANNED_SESSION_OFFSETS, scenario.actualSessionOffsets);

  return {
    id: scenario.id,
    label: scenario.label,
    description: scenario.description,
    captureSummary,
    finalRecommendation: finalRecommendation?.session_recommendation?.label || "sin recomendacion",
    finalRecommendationPriority: finalRecommendation?.session_recommendation?.next_priority || "sin prioridad",
    weeklyFocus: weeklyDashboard.recommendedFocus,
    riskFlags: weeklyDashboard.riskFlags,
    positiveSignals: weeklyDashboard.positiveSignals,
    metrics: weeklyDashboard.metrics,
    progression: summarizeExerciseProgress(baselineRecordMap, finalRecordMap),
    timeline,
    performanceSnapshot,
  };
}

function renderScenarioMetricsRow(result) {
  return `| ${result.label} | ${result.captureSummary.executedSessions}/${result.captureSummary.plannedSessions} | ${result.metrics.checkinDaysCaptured}/7 | ${result.metrics.maxCheckinGapDays} d | ${result.metrics.avgMedialPain}/10 | ${result.finalRecommendation} | ${result.weeklyFocus} |`;
}

function renderTimelineTable(result) {
  const lines = [
    "| Fecha | Planeado | Ejecutado | Readiness | Dolor | Recomendacion previa | Nota |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  result.timeline.forEach((item) => {
    const safeNote = String(item.note || "").replaceAll("|", " / ");
    lines.push(
      `| ${item.date} | ${item.planned ? "si" : "no"} | ${item.executed ? "si" : "no"} | ${item.readiness ?? "-"} | ${item.pain ?? "-"} | ${item.recommendationLabel} | ${safeNote} |`
    );
  });

  return lines.join("\n");
}

function renderProgressTable(result) {
  const lines = [
    "| Ejercicio | Lado | Base | Final | Objetivo siguiente | Delta RM / capacidad |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  result.progression.forEach((item) => {
    const delta = item.rmDeltaKg != null
      ? `${item.rmDeltaKg > 0 ? "+" : ""}${item.rmDeltaKg} kg`
      : item.durationDeltaSeconds != null
        ? `${item.durationDeltaSeconds > 0 ? "+" : ""}${item.durationDeltaSeconds} s`
        : "sin delta";

    lines.push(
      `| ${item.exerciseName} | ${item.side} | ${item.baselineLabel} | ${item.finalLabel} | ${item.nextTargetLabel} | ${delta} |`
    );
  });

  return lines.join("\n");
}

function renderFindings(result) {
  const findings = [];

  if (result.captureSummary.missedSessions === 0 && result.metrics.maxCheckinGapDays <= 1) {
    findings.push("El sistema mantiene contexto estable porque casi no pierde continuidad de captura.");
  }

  if (result.riskFlags.includes("faltan capturas recientes; el contexto ya pierde precision")) {
    findings.push("La nueva bandera de continuidad detecta correctamente que faltan check-ins y baja la confianza del contexto.");
  }

  if (result.riskFlags.includes("hay huecos grandes entre sesiones; la progresion puede sobreestimar continuidad")) {
    findings.push("Los huecos entre sesiones ya quedan visibles como riesgo real de sobreestimar continuidad.");
  }

  if (result.riskFlags.includes("irritabilidad medial repetida esta semana")) {
    findings.push("Cuando el dolor sube de forma repetida, el sistema empuja a bajar agresion local en lugar de seguir escalando.");
  }

  if (!findings.length) {
    findings.push("No aparece una falla estructural dura en esta simulacion, pero conviene seguir comparando contra datos reales.");
  }

  return findings.map((item) => `- ${item}`).join("\n");
}

function buildMarkdownReport(results) {
  const lines = [
    "# Simulaciones de Progresion",
    "",
    `Generado automaticamente el ${new Date().toISOString()}.`,
    "",
    "## Comparativo rapido",
    "",
    "| Escenario | Sesiones ejecutadas | Check-ins 7d | Hueco max captura | Dolor medio 7d | Recomendacion final | Enfoque final |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...results.map(renderScenarioMetricsRow),
  ];

  results.forEach((result) => {
    lines.push("");
    lines.push(`## ${result.label}`);
    lines.push("");
    lines.push(result.description);
    lines.push("");
    lines.push(`- Recomendacion final: ${result.finalRecommendation}`);
    lines.push(`- Prioridad final: ${result.finalRecommendationPriority}`);
    lines.push(`- Riesgos: ${result.riskFlags.length ? result.riskFlags.join("; ") : "sin alertas duras"}`);
    lines.push(`- Senales positivas: ${result.positiveSignals.length ? result.positiveSignals.join("; ") : "sin senales fuertes"}`);
    lines.push(`- Sesiones perdidas: ${result.captureSummary.missedSessions}`);
    lines.push("");
    lines.push("### Hallazgos");
    lines.push("");
    lines.push(renderFindings(result));
    lines.push("");
    lines.push("### Timeline");
    lines.push("");
    lines.push(renderTimelineTable(result));
    lines.push("");
    lines.push("### Progresion de ejercicios");
    lines.push("");
    lines.push(renderProgressTable(result));
  });

  return `${lines.join("\n")}\n`;
}

function main() {
  const results = SCENARIOS.map(runScenario);
  const markdownReport = buildMarkdownReport(results);

  fs.mkdirSync(DOCS_DIRECTORY, { recursive: true });
  fs.writeFileSync(REPORT_MARKDOWN_PATH, markdownReport, "utf8");
  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(results, null, 2), "utf8");

  console.log(`Reporte Markdown: ${REPORT_MARKDOWN_PATH}`);
  console.log(`Reporte JSON: ${REPORT_JSON_PATH}`);
  results.forEach((result) => {
    console.log(
      `${result.label}: sesiones ${result.captureSummary.executedSessions}/${result.captureSummary.plannedSessions}, ` +
      `check-ins ${result.metrics.checkinDaysCaptured}/7, hueco ${result.metrics.maxCheckinGapDays} d, ` +
      `recomendacion final "${result.finalRecommendation}".`
    );
  });
}

main();
