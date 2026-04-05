(() => {
  function safeRender(block) {
    try {
      return block();
    } catch (error) {
      console.error("Fallo de render protegido.", error);
      return false;
    }
  }

  // src/engine.js
  var DAY_MS = 24 * 60 * 60 * 1e3;
  var CANDIDATES = [
    {
      id: "base_strength_lower_push",
      type: "multiarticular_fuerza_base",
      label: "Fuerza base de bajo costo local",
      family: "base_strength",
      targetPatterns: ["squat", "horizontal_push", "horizontal_pull"],
      transferValue: 0.78,
      durationMin: 80,
      interference: 0.2,
      risk: { medialElbow: 0.15, forearm: 0.2, back: 0.35, legs: 0.45, global: 0.45 },
      mainExercises: [
        { name: "safety_bar_squat", sets: 5, reps: 4, rpe_target: 8 },
        { name: "bench_press_pausa", sets: 5, reps: 4, rpe_target: 7.5 },
        { name: "row_apoyado_con_straps", sets: 4, reps: 8, rpe_target: 7 }
      ],
      defaultAvoid: ["hook_pesado", "cup_pesado", "chin_up_supino_pesado"],
      monitor: ["dolor_medial_codo", "fatiga_agarre", "calidad_tecnica"]
    },
    {
      id: "rising_high_hook_technical",
      type: "specific_aw_rising_priority",
      label: "Especifico AW: rising + hook alto",
      family: "aw_specific",
      targetPatterns: ["rising", "high_hook", "finish"],
      transferValue: 0.96,
      durationMin: 75,
      interference: 0.62,
      risk: { medialElbow: 0.42, forearm: 0.7, back: 0.2, legs: 0.05, global: 0.48 },
      mainExercises: [
        { name: "rising_dinamico_correa_pulgar", sets: 5, reps: 8, rpe_target: 7.5 },
        { name: "starts_hook_alto_controlados", sets: 6, reps: 3, rpe_target: 7 },
        { name: "transicion_parar_mover_finalizar", sets: 4, reps: 4, rpe_target: 7 }
      ],
      defaultAvoid: ["cup_pesado_fatiga", "back_pressure_extra", "guerra_larga_en_mesa"],
      monitor: ["nudillos", "dolor_medial_codo", "fatiga_antebrazo"]
    },
    {
      id: "side_pressure_technical",
      type: "specific_aw_side_pressure_tecnico",
      label: "Especifico AW: side pressure tecnico",
      family: "aw_specific",
      targetPatterns: ["side_pressure", "finish", "containment"],
      transferValue: 0.84,
      durationMin: 70,
      interference: 0.75,
      risk: { medialElbow: 0.72, forearm: 0.62, back: 0.15, legs: 0.05, global: 0.45 },
      mainExercises: [
        { name: "side_pressure_tecnico_con_linea_fija", sets: 5, reps: 5, rpe_target: 6.5 },
        { name: "press_con_hombro_contenido", sets: 4, reps: 6, rpe_target: 6.5 },
        { name: "isometrico_de_finalizacion", sets: 4, reps: 12, rpe_target: 7 }
      ],
      defaultAvoid: ["side_pressure_bruto", "hook_pesado_si_hay_dolor", "curl_pesado"],
      monitor: ["dolor_medial_codo", "hombro", "elbow_drift"]
    },
    {
      id: "mesa_technical",
      type: "mesa_tecnica_controlada",
      label: "Mesa tecnica con volumen acotado",
      family: "table",
      targetPatterns: ["high_hook", "containment", "finish"],
      transferValue: 1,
      durationMin: 90,
      interference: 0.85,
      risk: { medialElbow: 0.64, forearm: 0.85, back: 0.18, legs: 0.05, global: 0.68 },
      mainExercises: [
        { name: "starts_tecnicos_en_mesa", sets: 8, reps: 1, rpe_target: 6.5 },
        { name: "hook_alto_desde_agarre_medio", sets: 6, reps: 1, rpe_target: 7 },
        { name: "holds_cortos_de_contencion", sets: 4, reps: 10, rpe_target: 7 }
      ],
      defaultAvoid: ["rounds_largos", "war_mode", "post_session_arm_day"],
      monitor: ["dolor_medial_codo", "agarre", "capacidad_de_finalizar"]
    },
    {
      id: "pull_support_straps",
      type: "tiron_soporte_con_straps",
      label: "Tiron controlado con straps",
      family: "pull_support",
      targetPatterns: ["horizontal_pull", "vertical_pull", "back_pressure"],
      transferValue: 0.62,
      durationMin: 60,
      interference: 0.4,
      risk: { medialElbow: 0.32, forearm: 0.38, back: 0.58, legs: 0.05, global: 0.4 },
      mainExercises: [
        { name: "row_con_straps_y_pecho_apoyado", sets: 4, reps: 8, rpe_target: 7 },
        { name: "lat_prayer_con_correa", sets: 4, reps: 10, rpe_target: 7 },
        { name: "escapula_y_tronco_sin_fallo", sets: 3, reps: 12, rpe_target: 6.5 }
      ],
      defaultAvoid: ["chin_up_supino_pesado", "curl_pesado", "straps_maximos"],
      monitor: ["dolor_medial_codo", "fatiga_espalda", "agarre"]
    },
    {
      id: "tissue_recovery",
      type: "recuperacion_y_tolerancia_de_tejido",
      label: "Recuperacion y tolerancia de tejido",
      family: "recovery",
      targetPatterns: ["flexor_pronator_isometric", "wrist_control", "tendon_tolerance"],
      transferValue: 0.48,
      durationMin: 35,
      interference: 0.05,
      risk: { medialElbow: 0.05, forearm: 0.1, back: 0.05, legs: 0.05, global: 0.12 },
      mainExercises: [
        { name: "isometrico_flexor_pronador", sets: 5, reps: 20, rpe_target: 5.5 },
        { name: "extensores_y_control_de_muneca", sets: 4, reps: 12, rpe_target: 5 },
        { name: "movilidad_y_flush_sin_dolor", sets: 3, reps: 10, rpe_target: 4 }
      ],
      defaultAvoid: ["guerra_en_mesa", "hook_pesado", "pronacion_pesada"],
      monitor: ["respuesta_del_tejido", "dolor_al_dia_siguiente", "fatiga_global"]
    }
  ];
  function normalizeDate(dateText) {
    return /* @__PURE__ */ new Date(`${dateText}T12:00:00`);
  }
  function shiftDate(dateText, days) {
    const date = normalizeDate(dateText);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
  function wholeDaysBetween(leftDateText, rightDateText) {
    return Math.round(
      Math.abs(normalizeDate(leftDateText).getTime() - normalizeDate(rightDateText).getTime()) / DAY_MS
    );
  }
  function hoursBetween(leftDateText, rightDateText) {
    if (!leftDateText || !rightDateText) {
      return Number.POSITIVE_INFINITY;
    }
    return Math.abs(normalizeDate(leftDateText).getTime() - normalizeDate(rightDateText).getTime()) / 36e5;
  }
  function getWindowEntries(entries, referenceDate, days) {
    const reference = normalizeDate(referenceDate).getTime();
    return entries.filter((entry) => {
      const delta = reference - normalizeDate(entry.date).getTime();
      return delta >= 0 && delta <= days * DAY_MS;
    });
  }
  function isTableSession(session) {
    return String(session.session_type || "").includes("mesa");
  }
  function inferSessionPatterns(session) {
    const haystack = [
      session.session_type,
      session.goal_of_session,
      session?.results?.best_pattern,
      session?.results?.best_grip_condition,
      session?.results?.main_limitation
    ].join(" ").toLowerCase();
    const patterns = /* @__PURE__ */ new Set();
    if (haystack.includes("rising")) patterns.add("rising");
    if (haystack.includes("cup")) patterns.add("cupping");
    if (haystack.includes("back")) patterns.add("back_pressure");
    if (haystack.includes("side")) patterns.add("side_pressure");
    if (haystack.includes("pron")) patterns.add("pronation");
    if (haystack.includes("hook alto")) patterns.add("high_hook");
    if (haystack.includes("hook")) patterns.add("deep_hook");
    if (haystack.includes("finish") || session?.results?.could_finish) patterns.add("finish");
    if (haystack.includes("contencion") || haystack.includes("contain")) patterns.add("containment");
    if (isTableSession(session)) patterns.add("mesa");
    if (haystack.includes("banca") || haystack.includes("bench")) patterns.add("horizontal_push");
    if (haystack.includes("remo") || haystack.includes("row")) patterns.add("horizontal_pull");
    if (haystack.includes("squat") || haystack.includes("pierna")) patterns.add("squat");
    return [...patterns];
  }
  function buildWeaknessMap(profile) {
    return Object.entries(profile.current_strength_profile || {}).reduce((map, [pattern, value]) => {
      if (value === "debil") {
        map[pattern] = 1;
      } else if (value === "debil_secundaria") {
        map[pattern] = 0.7;
      }
      return map;
    }, {});
  }
  function buildStrengthSet(profile) {
    return new Set(
      Object.entries(profile.current_strength_profile || {}).filter(([, value]) => String(value).includes("fuerte")).map(([pattern]) => pattern)
    );
  }
  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }
  function average(values) {
    if (!values.length) {
      return 0;
    }
    return values.reduce((total, value) => total + value, 0) / values.length;
  }
  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }
  function uniqueSortedDates(entries, referenceDate, days) {
    return [...new Set(getWindowEntries(entries, referenceDate, days).map((entry) => entry.date))].sort((left, right) => String(left).localeCompare(String(right)));
  }
  function computeCaptureContinuity(entries, referenceDate, days) {
    const dates = uniqueSortedDates(entries, referenceDate, days);
    const windowStartDate = shiftDate(referenceDate, -days);
    if (dates.length === 0) {
      return {
        capturedDays: 0,
        coverage: 0,
        maxGapDays: days,
        lastGapDays: days
      };
    }
    let maxGapDays = Math.max(0, wholeDaysBetween(windowStartDate, dates[0]) - 1);
    for (let index = 1; index < dates.length; index += 1) {
      maxGapDays = Math.max(maxGapDays, Math.max(0, wholeDaysBetween(dates[index - 1], dates[index]) - 1));
    }
    return {
      capturedDays: dates.length,
      coverage: Number((dates.length / days).toFixed(2)),
      maxGapDays,
      lastGapDays: Math.max(0, wholeDaysBetween(dates[dates.length - 1], referenceDate))
    };
  }
  function getSessionPainPeak(session) {
    return (session.pain_events || []).reduce((peak, event) => Math.max(peak, Number(event.severity) || 0), 0);
  }
  function computeMaxGapDays(entries, referenceDate) {
    const dates = [...new Set(entries.map((entry) => entry.date))].sort((left, right) => String(left).localeCompare(String(right)));
    if (dates.length === 0) {
      return Number.POSITIVE_INFINITY;
    }
    let maxGapDays = 0;
    let previousDate = dates[0];
    for (let index = 1; index < dates.length; index += 1) {
      maxGapDays = Math.max(maxGapDays, Math.max(0, wholeDaysBetween(previousDate, dates[index]) - 1));
      previousDate = dates[index];
    }
    maxGapDays = Math.max(maxGapDays, Math.max(0, wholeDaysBetween(dates[dates.length - 1], referenceDate) - 1));
    return maxGapDays;
  }
  function computePatternExposure(sessions, exerciseEntries, referenceDate) {
    const counts = {};
    getWindowEntries(sessions, referenceDate, 7).forEach((session) => {
      inferSessionPatterns(session).forEach((pattern) => {
        counts[pattern] = (counts[pattern] || 0) + 1;
      });
    });
    getWindowEntries(exerciseEntries, referenceDate, 7).forEach((entry) => {
      const sets = Number(entry.sets) || 0;
      const pattern = entry.pattern;
      if (!pattern) {
        return;
      }
      counts[pattern] = (counts[pattern] || 0) + Math.max(0.5, sets / 4);
    });
    return counts;
  }
  function computePatternPainMap(exerciseEntries, referenceDate) {
    const buckets = {};
    getWindowEntries(exerciseEntries, referenceDate, 7).forEach((entry) => {
      if (!entry.pattern) {
        return;
      }
      if (!buckets[entry.pattern]) {
        buckets[entry.pattern] = [];
      }
      buckets[entry.pattern].push(Number(entry.pain_during) || 0);
    });
    return Object.fromEntries(
      Object.entries(buckets).map(([pattern, values]) => [pattern, average(values)])
    );
  }
  function getObjectiveMatch(candidate, state2) {
    if (candidate.family === "base_strength") {
      if (state2.continuityBroken) {
        return state2.elbowIrritable ? 1 : 0.9;
      }
      return state2.hadHardTableIn24h || state2.elbowIrritable ? 1 : 0.68;
    }
    if (candidate.family === "aw_specific") {
      if (state2.continuityBroken) {
        return state2.medialPainToday >= 5 ? 0.16 : 0.48;
      }
      return state2.medialPainToday >= 5 ? 0.18 : state2.hadHardTableIn24h ? 0.42 : 0.94;
    }
    if (candidate.family === "table") {
      if (state2.continuityBroken) {
        return 0.35;
      }
      return state2.hadHardTableIn24h ? 0.1 : state2.medialPainToday >= 4 ? 0.25 : 0.9;
    }
    if (candidate.family === "pull_support") {
      if (state2.continuityBroken) {
        return 0.82;
      }
      return state2.medialPainToday >= 4 ? 0.46 : 0.74;
    }
    if (candidate.family === "recovery") {
      return state2.medialPainToday >= 5 || state2.readiness <= 4 ? 1 : 0.32;
    }
    return 0.5;
  }
  function getWeaknessTargeting(candidate, state2) {
    let score = 0;
    candidate.targetPatterns.forEach((pattern) => {
      score += state2.weaknessMap[pattern] || 0;
    });
    if (state2.deepLowDependency && candidate.targetPatterns.some((pattern) => ["rising", "high_hook"].includes(pattern))) {
      score += 0.35;
    }
    if (state2.stopNoFinish && candidate.targetPatterns.some((pattern) => ["finish", "side_pressure"].includes(pattern))) {
      score += 0.25;
    }
    return clamp01(score / 1.4);
  }
  function getToleranceFit(candidate, state2) {
    const painLoad = state2.medialPainToday / 10 * candidate.risk.medialElbow;
    const forearmLoad = state2.forearmFatigue / 10 * candidate.risk.forearm;
    const backLoad = state2.backFatigue / 10 * candidate.risk.back;
    const legLoad = state2.legsFatigue / 10 * candidate.risk.legs;
    const globalLoad = state2.globalFatigue / 10 * candidate.risk.global;
    return clamp01(1 - (painLoad * 0.45 + forearmLoad * 0.25 + backLoad * 0.1 + legLoad * 0.1 + globalLoad * 0.1));
  }
  function getAvailabilityFit(candidate, state2) {
    if (state2.availableTimeMin >= candidate.durationMin) {
      return 1;
    }
    if (state2.availableTimeMin >= candidate.durationMin * 0.75) {
      return 0.65;
    }
    return 0.25;
  }
  function getPainRisk(candidate, state2) {
    const eventPenalty = state2.recentMedialPainPeak >= 4 ? 0.18 : 0;
    const localPain = state2.medialPainToday / 10 * candidate.risk.medialElbow + eventPenalty;
    const patternPain = average(
      candidate.targetPatterns.map((pattern) => state2.patternPainMap[pattern]).filter((value) => Number.isFinite(value))
    ) / 10;
    return clamp01(localPain + patternPain * 0.55);
  }
  function getInterferenceCost(candidate, state2) {
    if (state2.hadHardTableIn24h) {
      return clamp01(candidate.interference + 0.18);
    }
    if (state2.lastTableWithin72h) {
      return clamp01(candidate.interference * 0.72);
    }
    return clamp01(candidate.interference * 0.3);
  }
  function getFatigueCost(candidate, state2) {
    const blended = state2.globalFatigue / 10 * candidate.risk.global * 0.35 + state2.forearmFatigue / 10 * candidate.risk.forearm * 0.35 + state2.backFatigue / 10 * candidate.risk.back * 0.15 + state2.legsFatigue / 10 * candidate.risk.legs * 0.15;
    return clamp01(blended);
  }
  function getRedundancyPenalty(candidate, state2) {
    const exposureAverage = candidate.targetPatterns.reduce((total, pattern) => total + (state2.patternExposure[pattern] || 0), 0) / Math.max(candidate.targetPatterns.length, 1);
    const sameFamilyPenalty = state2.lastSession?.session_type?.includes(candidate.family) ? 0.2 : 0;
    return clamp01(exposureAverage / 4 + sameFamilyPenalty);
  }
  function getStrengthMaintenancePenalty(candidate, state2) {
    const overlap = candidate.targetPatterns.filter((pattern) => state2.strengths.has(pattern)).length;
    return overlap > 0 ? overlap * 0.35 : 0;
  }
  function evaluateCandidate(candidate, state2) {
    const objectiveMatch = getObjectiveMatch(candidate, state2);
    const weaknessTargeting = getWeaknessTargeting(candidate, state2);
    const toleranceFit = getToleranceFit(candidate, state2);
    const availabilityFit = getAvailabilityFit(candidate, state2);
    const painRisk = getPainRisk(candidate, state2);
    const interferenceCost = getInterferenceCost(candidate, state2);
    const fatigueCost = getFatigueCost(candidate, state2);
    const redundancyPenalty = getRedundancyPenalty(candidate, state2);
    const strengthPenalty = getStrengthMaintenancePenalty(candidate, state2);
    let score = objectiveMatch * 5 + weaknessTargeting * 4 + candidate.transferValue * 4 + toleranceFit * 3 + availabilityFit * 2 - painRisk * 5 - interferenceCost * 4 - fatigueCost * 3 - redundancyPenalty * 2 - strengthPenalty;
    const notes = [];
    if (state2.hadHardTableIn24h && state2.elbowIrritable && candidate.id === "base_strength_lower_push") {
      score += 2.4;
      notes.push("Bonificacion por mesa dura reciente con codo irritable.");
    }
    if (state2.hadHardTableIn24h && state2.elbowIrritable && candidate.risk.medialElbow >= 0.4) {
      score -= 1.4;
      notes.push("Penalizacion por carga local alta tras mesa dura.");
    }
    if (state2.deepLowDependency && candidate.targetPatterns.some((pattern) => ["rising", "high_hook"].includes(pattern))) {
      score += 1.1;
      notes.push("Bonificacion por dependencia actual de agarre profundo y bajo.");
    }
    if (state2.stopNoFinish && candidate.targetPatterns.some((pattern) => ["finish", "side_pressure"].includes(pattern))) {
      score += 0.8;
      notes.push("Bonificacion por necesidad de convertir contencion en finalizacion.");
    }
    if (state2.medialPainToday >= 5 && candidate.family === "recovery") {
      score += 1.6;
      notes.push("Bonificacion por irritabilidad actual del tejido.");
    }
    return {
      ...candidate,
      score: Number(score.toFixed(2)),
      breakdown: {
        objectiveMatch,
        weaknessTargeting,
        transferValue: candidate.transferValue,
        toleranceFit,
        availabilityFit,
        painRisk,
        interferenceCost,
        fatigueCost,
        redundancyPenalty,
        strengthPenalty
      },
      notes
    };
  }
  function buildReasons(candidate, state2) {
    const reasons = [];
    if (state2.hadHardTableIn24h) {
      reasons.push("hubo mesa dura en las ultimas 24 horas");
    }
    if (state2.continuityBroken) {
      reasons.push("hubo huecos grandes entre sesiones y conviene reentrar con criterio");
    }
    if (state2.elbowIrritable) {
      reasons.push("el codo medial sigue irritable y necesita control de carga");
    }
    if (candidate.targetPatterns.includes("rising")) {
      reasons.push("ataca la debilidad principal actual: rising");
    }
    if (candidate.targetPatterns.includes("side_pressure") && state2.stopNoFinish) {
      reasons.push("ayuda a convertir contencion en movimiento y finalizacion");
    }
    if (state2.deepLowDependency && candidate.targetPatterns.some((pattern) => ["rising", "high_hook"].includes(pattern))) {
      reasons.push("amplia la capacidad fuera del agarre profundo y bajo");
    }
    if (candidate.family === "base_strength") {
      reasons.push("preserva rendimiento de mesa mientras mantiene fuerza bruta util");
    }
    if (candidate.family === "recovery") {
      reasons.push("reduce el costo de recuperacion y mejora tolerancia de tejido");
    }
    return reasons.slice(0, 4);
  }
  function buildAvoidList(candidate, state2) {
    const avoid = new Set(candidate.defaultAvoid);
    if (state2.hadHardTableIn24h || state2.elbowIrritable) {
      ["hook_pesado", "cup_pesado", "pronacion_pesada", "chin_up_supino_pesado"].forEach((item) => avoid.add(item));
    }
    if (state2.strengths.has("cupping")) {
      avoid.add("sobrevolumen_de_cupping");
    }
    if (state2.strengths.has("back_pressure")) {
      avoid.add("sobrevolumen_de_back_pressure");
    }
    return [...avoid];
  }
  function buildHumanExplanation(best, state2) {
    const lines = [];
    if (best.family === "base_strength") {
      lines.push("La recomendacion se va hacia fuerza base porque hoy el costo local en codo y antebrazo pesa mas que meter otra exposicion especifica.");
    } else if (best.family === "aw_specific") {
      lines.push("La recomendacion se mantiene especifica porque el contexto permite empujar transferencia directa sin pagar demasiado riesgo local.");
    } else if (best.family === "recovery") {
      lines.push("La recomendacion baja a recuperacion porque el tejido y la fatiga harian poco rentable una sesion agresiva.");
    } else {
      lines.push("La recomendacion busca mantener transferencia sin romper la tolerancia actual del tejido.");
    }
    if (state2.deepLowDependency) {
      lines.push("Tu patron reciente sigue dependiendo de agarre profundo y bajo, asi que conviene ampliar rising, hook alto y control de nudillos.");
    }
    if (state2.continuityBroken) {
      lines.push("Tambien hubo huecos grandes entre sesiones, asi que el sistema baja la agresion de reentrada aunque el dolor no sea extremo.");
    }
    if (state2.stopNoFinish) {
      lines.push("El sistema tambien detecta que puedes parar mejor de lo que finalizas, por eso la transicion a ataque sigue siendo prioridad.");
    }
    if (state2.weeklySpecificSets > 24 && best.family === "base_strength") {
      lines.push("Tambien ya hay suficiente carga especifica reciente, asi que hoy conviene que el trabajo sume y no estorbe.");
    }
    return lines.join(" ");
  }
  function buildMissingDataHint(state2) {
    const hints = [];
    if (!state2.lastTableSession) {
      hints.push("faltan datos de mesa recientes");
    }
    if (state2.weeklyExerciseCount === 0) {
      hints.push("registrar ejercicios reales mejoraria mucho la precision");
    }
    if (state2.availableTimeMin <= 45) {
      hints.push("si hoy tienes menos de 45 minutos, convendria una sesion mas corta");
    }
    if (state2.medialPainToday === 0 && state2.recentMedialPainPeak >= 4) {
      hints.push("confirmar si el dolor actual ya no aparece antes del calentamiento");
    }
    if (hints.length === 0) {
      hints.push("saber si la proxima exposicion competitiva es esta semana podria afinar la prioridad");
    }
    return hints[0];
  }
  function buildNextPriority(best, state2) {
    if (best.family === "base_strength" && state2.deepLowDependency) {
      return "rising + hook alto + transicion de parar a mover";
    }
    if (best.family === "recovery") {
      return "bajar irritabilidad y volver a cargar rising con control";
    }
    if (best.targetPatterns.includes("rising")) {
      return "mantener side pressure tecnico sin robar volumen a rising";
    }
    return "construir transferencia sin sobrecargar fortalezas ya dominantes";
  }
  function buildCurrentState(profile, sessions, checkin, exerciseEntries = []) {
    const referenceDate = checkin?.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const sortedSessions = sessions.slice().sort((left, right) => String(right.date).localeCompare(String(left.date)));
    const sortedExercises = exerciseEntries.slice().sort((left, right) => String(right.date).localeCompare(String(left.date)));
    const recentSessions = getWindowEntries(sortedSessions, referenceDate, 21);
    const weeklySessions = getWindowEntries(sortedSessions, referenceDate, 7);
    const recentExerciseEntries = getWindowEntries(sortedExercises, referenceDate, 21);
    const weeklyExerciseEntries = getWindowEntries(sortedExercises, referenceDate, 7);
    const lastSession = recentSessions[0] || null;
    const lastTableSession = recentSessions.find((session) => isTableSession(session)) || null;
    const recentMedialPainPeak = recentSessions.reduce((peak, session) => Math.max(peak, getSessionPainPeak(session)), 0);
    const weaknessMap = buildWeaknessMap(profile);
    const strengths = buildStrengthSet(profile);
    const lastTableHours = lastTableSession ? hoursBetween(referenceDate, lastTableSession.date) : Number.POSITIVE_INFINITY;
    const hadHardTableIn24h = Boolean(
      lastTableSession && lastTableHours <= 24 && Number(lastTableSession.effort_rpe_session || 0) >= 8
    );
    const stopNoFinish = Boolean(lastTableSession?.results?.could_stop && !lastTableSession?.results?.could_finish);
    const gripText = String(lastTableSession?.results?.best_grip_condition || "").toLowerCase();
    const deepLowDependency = gripText.includes("profundo") || gripText.includes("bajo");
    const medialPainToday = Number(checkin?.pain?.medial_elbow_right || 0);
    const patternExposure = computePatternExposure(sortedSessions, sortedExercises, referenceDate);
    const patternPainMap = computePatternPainMap(sortedExercises, referenceDate);
    const maxRecentSessionGapDays = computeMaxGapDays(recentSessions, referenceDate);
    const weeklySpecificSets = sum(
      weeklyExerciseEntries.filter((entry) => entry.category === "specific_aw").map((entry) => Number(entry.sets) || 0)
    );
    return {
      referenceDate,
      readiness: Number(checkin?.readiness || 0),
      availableTimeMin: Number(checkin?.available_time_min || 0),
      medialPainToday,
      globalFatigue: Number(checkin?.fatigue?.global || 0),
      forearmFatigue: Number(checkin?.fatigue?.forearm_hand || 0),
      backFatigue: Number(checkin?.fatigue?.back || 0),
      legsFatigue: Number(checkin?.fatigue?.legs || 0),
      recentSessions,
      recentExerciseEntries,
      lastSession,
      lastTableSession,
      lastTableHours,
      hadHardTableIn24h,
      lastTableWithin72h: lastTableHours <= 72,
      stopNoFinish,
      deepLowDependency,
      maxRecentSessionGapDays,
      recentSessionCount7d: weeklySessions.length,
      continuityBroken: maxRecentSessionGapDays >= 3 || weeklySessions.length <= 1,
      recentMedialPainPeak,
      elbowIrritable: medialPainToday >= 1 || recentMedialPainPeak >= 3,
      weaknessMap,
      strengths,
      patternExposure,
      patternPainMap,
      weeklyExerciseCount: weeklyExerciseEntries.length,
      weeklySpecificSets
    };
  }
  function recommendSession(profile, sessions, checkin, exerciseEntries = []) {
    const state2 = buildCurrentState(profile, sessions, checkin, exerciseEntries);
    const ranked = CANDIDATES.map((candidate) => evaluateCandidate(candidate, state2)).sort((left, right) => right.score - left.score);
    const best = ranked[0];
    return {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      state: state2,
      ranking: ranked.slice(0, 4),
      session_recommendation: {
        type: best.type,
        label: best.label,
        reason: buildReasons(best, state2),
        main_exercises: best.mainExercises,
        limit_or_avoid: buildAvoidList(best, state2),
        monitor: best.monitor,
        next_priority: buildNextPriority(best, state2),
        what_changes_recommendation: buildMissingDataHint(state2),
        explanation: buildHumanExplanation(best, state2)
      }
    };
  }
  function buildSessionInsight(profile, session, exerciseEntries = []) {
    if (!session) {
      return null;
    }
    const sessionEntries = exerciseEntries.filter((entry) => entry.session_id === session.session_id);
    const totalSets = sum(sessionEntries.map((entry) => Number(entry.sets) || 0));
    const avgPain = average(sessionEntries.map((entry) => Number(entry.pain_during) || 0));
    const avgTechnique = average(sessionEntries.map((entry) => Number(entry.technique_quality) || 0));
    const avgVector = average(sessionEntries.map((entry) => Number(entry.vector_quality) || 0));
    const bestExercise = sessionEntries.slice().sort((left, right) => {
      const leftScore = (Number(left.vector_quality) || 0) + (Number(left.technique_quality) || 0) - (Number(left.pain_during) || 0) / 10;
      const rightScore = (Number(right.vector_quality) || 0) + (Number(right.technique_quality) || 0) - (Number(right.pain_during) || 0) / 10;
      return rightScore - leftScore;
    })[0] || null;
    const riskiestExercise = sessionEntries.slice().sort((left, right) => (Number(right.pain_during) || 0) - (Number(left.pain_during) || 0))[0] || null;
    const profileStrengths = buildStrengthSet(profile);
    const wins = [];
    const limits = [];
    const avoid = /* @__PURE__ */ new Set();
    let rootLimitation = session?.results?.main_limitation || "sin_limite_claro";
    if (session?.results?.could_stop) {
      wins.push("hubo capacidad de parar en mesa");
    }
    if (bestExercise) {
      wins.push(`mejor ejercicio util: ${bestExercise.exercise_name}`);
    }
    if (session?.results?.best_pattern) {
      wins.push(`mejor patron expresado: ${session.results.best_pattern}`);
    }
    if (session?.results?.best_grip_condition) {
      limits.push(`la produccion depende de ${session.results.best_grip_condition}`);
    }
    if (session?.results?.could_stop && !session?.results?.could_finish) {
      rootLimitation = "finalizacion";
      limits.push("se contuvo mejor de lo que se finalizo");
    }
    if (String(session?.results?.best_grip_condition || "").toLowerCase().includes("profundo")) {
      rootLimitation = session?.results?.main_limitation || "rising";
      limits.push("sigue faltando rango util en agarres medios y altos");
    }
    if ((Number(riskiestExercise?.pain_during) || 0) >= 4 || getSessionPainPeak(session) >= 4) {
      avoid.add("hook_pesado");
      avoid.add("cup_pesado");
      avoid.add("pronacion_pesada");
    }
    if (riskiestExercise?.pattern === "side_pressure") {
      avoid.add("side_pressure_bruto");
    }
    if (bestExercise && profileStrengths.has(bestExercise.pattern)) {
      limits.push(`ojo con sobrevolumen en una fortaleza ya alta: ${bestExercise.pattern}`);
    }
    const nextPriority = rootLimitation === "finalizacion" ? "transicion de parar a mover y finalizar" : rootLimitation === "rising" ? "rising + hook alto + control de nudillos" : rootLimitation;
    return {
      sessionId: session.session_id,
      date: session.date,
      title: "Lectura post-sesion",
      overview: `Sesion ${session.session_type} con RPE ${session.effort_rpe_session}. El sistema ve ${totalSets} sets registrados y una lectura media de dolor ${avgPain.toFixed(1)}/10.`,
      metrics: {
        totalSets,
        exerciseCount: sessionEntries.length,
        avgPain: Number(avgPain.toFixed(1)),
        avgTechnique: Number(avgTechnique.toFixed(2)),
        avgVector: Number(avgVector.toFixed(2))
      },
      wins,
      limits,
      rootLimitation,
      nextPriority,
      avoid: [...avoid],
      bestExercise,
      riskiestExercise
    };
  }
  function buildWeeklyDashboard(profile, checkins, sessions, exerciseEntries, referenceDate) {
    const baseDate = referenceDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const weeklyCheckins = getWindowEntries(checkins, baseDate, 7);
    const weeklySessions = getWindowEntries(sessions, baseDate, 7);
    const weeklyExerciseEntries = getWindowEntries(exerciseEntries, baseDate, 7);
    const checkinContinuity = computeCaptureContinuity(checkins, baseDate, 6);
    const sessionContinuity = computeCaptureContinuity(sessions, baseDate, 6);
    const avgReadiness = average(weeklyCheckins.map((entry) => Number(entry.readiness) || 0));
    const avgMedialPain = average(weeklyCheckins.map((entry) => Number(entry?.pain?.medial_elbow_right) || 0));
    const avgSessionRpe = average(weeklySessions.map((entry) => Number(entry.effort_rpe_session) || 0));
    const totalSets = sum(weeklyExerciseEntries.map((entry) => Number(entry.sets) || 0));
    const tableSessions = weeklySessions.filter((session) => isTableSession(session));
    const patternSetMap = weeklyExerciseEntries.reduce((map, entry) => {
      if (!entry.pattern) {
        return map;
      }
      map[entry.pattern] = (map[entry.pattern] || 0) + (Number(entry.sets) || 0);
      return map;
    }, {});
    const topPatterns = Object.entries(patternSetMap).sort((left, right) => right[1] - left[1]).slice(0, 4).map(([pattern, setCount]) => ({ pattern, setCount }));
    const exerciseMap = weeklyExerciseEntries.reduce((map, entry) => {
      if (!map[entry.exercise_name]) {
        map[entry.exercise_name] = {
          exerciseName: entry.exercise_name,
          occurrences: 0,
          totalSets: 0,
          painValues: [],
          techniqueValues: [],
          vectorValues: []
        };
      }
      const bucket = map[entry.exercise_name];
      bucket.occurrences += 1;
      bucket.totalSets += Number(entry.sets) || 0;
      bucket.painValues.push(Number(entry.pain_during) || 0);
      bucket.techniqueValues.push(Number(entry.technique_quality) || 0);
      bucket.vectorValues.push(Number(entry.vector_quality) || 0);
      return map;
    }, {});
    const effectiveExercises = Object.values(exerciseMap).map((entry) => {
      const avgPainEntry = average(entry.painValues);
      const avgTechniqueEntry = average(entry.techniqueValues);
      const avgVectorEntry = average(entry.vectorValues);
      const score = avgTechniqueEntry * 0.45 + avgVectorEntry * 0.45 - avgPainEntry / 10 * 0.35 + entry.occurrences * 0.05;
      return {
        exerciseName: entry.exerciseName,
        score: Number(score.toFixed(2)),
        avgPain: Number(avgPainEntry.toFixed(1)),
        avgTechnique: Number(avgTechniqueEntry.toFixed(2)),
        avgVector: Number(avgVectorEntry.toFixed(2)),
        totalSets: entry.totalSets
      };
    }).sort((left, right) => right.score - left.score).slice(0, 3);
    const riskFlags = [];
    const positiveSignals = [];
    const risingSets = patternSetMap.rising || 0;
    const strengthBiasSets = (patternSetMap.back_pressure || 0) + (patternSetMap.cupping || 0);
    if (weeklyCheckins.filter((entry) => Number(entry?.pain?.medial_elbow_right) >= 4).length >= 2) {
      riskFlags.push("irritabilidad medial repetida esta semana");
    }
    if (tableSessions.length >= 2 && avgMedialPain >= 3) {
      riskFlags.push("mucha mesa para el dolor medial actual");
    }
    if (strengthBiasSets > risingSets * 1.5 && buildWeaknessMap(profile).rising) {
      riskFlags.push("demasiado mantenimiento de fortalezas y poco rising");
    }
    if (risingSets === 0 && buildWeaknessMap(profile).rising) {
      riskFlags.push("falta exposicion directa a rising esta semana");
    }
    if (checkinContinuity.capturedDays <= 3 || checkinContinuity.maxGapDays >= 2) {
      riskFlags.push("faltan capturas recientes; el contexto ya pierde precision");
    }
    if (sessionContinuity.maxGapDays >= 3 && weeklySessions.length > 0) {
      riskFlags.push("hay huecos grandes entre sesiones; la progresion puede sobreestimar continuidad");
    }
    if (avgReadiness >= 7 && avgMedialPain <= 2) {
      positiveSignals.push("la ventana semanal tolera progresion conservadora");
    }
    if (effectiveExercises[0] && effectiveExercises[0].avgPain <= 2) {
      positiveSignals.push(`ejercicio mas rentable: ${effectiveExercises[0].exerciseName}`);
    }
    if (checkinContinuity.capturedDays >= 5 && checkinContinuity.maxGapDays <= 1) {
      positiveSignals.push("captura diaria consistente; el sistema esta decidiendo con buen contexto");
    }
    const recommendedFocus = riskFlags.includes("irritabilidad medial repetida esta semana") ? "bajar agresion local y priorizar fuerza base o tejido" : riskFlags.includes("faltan capturas recientes; el contexto ya pierde precision") ? "primero recuperar continuidad de check-ins y despues forzar progresion" : risingSets === 0 && buildWeaknessMap(profile).rising ? "subir exposicion especifica a rising sin cargar de mas cupping" : "mantener la mejor respuesta y seguir midiendo transferencia";
    return {
      date: baseDate,
      metrics: {
        sessionCount: weeklySessions.length,
        tableCount: tableSessions.length,
        exerciseCount: weeklyExerciseEntries.length,
        totalSets,
        avgReadiness: Number(avgReadiness.toFixed(1)),
        avgMedialPain: Number(avgMedialPain.toFixed(1)),
        avgSessionRpe: Number(avgSessionRpe.toFixed(1)),
        checkinDaysCaptured: checkinContinuity.capturedDays,
        checkinCoverage: checkinContinuity.coverage,
        maxCheckinGapDays: checkinContinuity.maxGapDays,
        sessionDaysCaptured: sessionContinuity.capturedDays,
        maxSessionGapDays: sessionContinuity.maxGapDays
      },
      topPatterns,
      effectiveExercises,
      riskFlags,
      positiveSignals,
      recommendedFocus
    };
  }
  function getEntryQualityScore(entry) {
    return (Number(entry.vector_quality) || 0) * 0.45 + (Number(entry.technique_quality) || 0) * 0.45 - (Number(entry.pain_during) || 0) / 10 * 0.35 + (Number(entry.rpe) || 0) * 0.03;
  }
  function getNormalizedLoad(entry) {
    const load = Number(entry.load) || 0;
    const unit = String(entry.load_unit || "").toLowerCase();
    if (unit === "lbs") {
      return load * 0.453592;
    }
    if (unit === "kg") {
      return load;
    }
    return 0;
  }
  function getEffortType(entry = {}) {
    const rawType = String(entry.effort_type || "").trim().toLowerCase();
    if (rawType) {
      return rawType;
    }
    return Number(entry.duration_seconds) > 0 ? "isometric_hold" : "dynamic";
  }
  function getDurationSeconds(entry = {}) {
    return Math.max(0, Number(entry.duration_seconds) || 0);
  }
  function roundNumber(value, digits = 1) {
    if (!Number.isFinite(value)) {
      return null;
    }
    return Number(value.toFixed(digits));
  }
  function roundToStep(value, step) {
    if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) {
      return roundNumber(value, 1);
    }
    return roundNumber(Math.round(value / step) * step, 1);
  }
  function getLoadStepKg(loadKg) {
    if (!Number.isFinite(loadKg) || loadKg <= 0) {
      return 0.5;
    }
    if (loadKg >= 25) {
      return 2.5;
    }
    if (loadKg >= 10) {
      return 1;
    }
    return 0.5;
  }
  function getRepsInReserve(entry) {
    const rpe = Number(entry.rpe);
    if (!Number.isFinite(rpe)) {
      return 0;
    }
    return Math.max(0, Math.min(5, 10 - rpe));
  }
  function getEstimatedFailureReps(entry) {
    const reps = Math.max(1, Number(entry.reps) || 0);
    return Math.min(12, reps + getRepsInReserve(entry));
  }
  function buildExerciseRecordKey(entry) {
    const exerciseName = String(entry.exercise_name || "sin_ejercicio").trim().toLowerCase();
    const side = String(entry.side || "unspecified").trim().toLowerCase();
    return `${exerciseName}::${side}`;
  }
  function buildEntryStrengthMetrics(entry = {}) {
    const loadKg = getNormalizedLoad(entry);
    const reps = Math.max(1, Number(entry.reps) || 0);
    const confirmedFlag = Boolean(entry.confirmed_rm) && reps === 1 && loadKg > 0;
    const effortType = getEffortType(entry);
    if (effortType === "isometric_hold") {
      return {
        loadKg: roundNumber(loadKg, 1),
        confirmedRmKg: null,
        theoreticalRmKg: null,
        currentRmKg: null,
        rmSourceType: "not_available",
        estimatedFailureReps: null
      };
    }
    if (loadKg <= 0) {
      return {
        loadKg: 0,
        confirmedRmKg: null,
        theoreticalRmKg: null,
        currentRmKg: null,
        rmSourceType: "not_available",
        estimatedFailureReps: null
      };
    }
    const estimatedFailureReps = getEstimatedFailureReps(entry);
    const theoreticalRmKg = reps === 1 ? loadKg * (1 + getRepsInReserve(entry) * 0.015) : loadKg * (1 + estimatedFailureReps / 30);
    const confirmedRmKg = confirmedFlag ? loadKg : null;
    const currentRmKg = confirmedRmKg || theoreticalRmKg;
    return {
      loadKg: roundNumber(loadKg, 1),
      confirmedRmKg: roundNumber(confirmedRmKg, 1),
      theoreticalRmKg: roundNumber(theoreticalRmKg, 1),
      currentRmKg: roundNumber(currentRmKg, 1),
      rmSourceType: confirmedRmKg ? "confirmed" : "theoretical",
      estimatedFailureReps: roundNumber(estimatedFailureReps, 1)
    };
  }
  function buildDynamicTargetLabel(entry, action, targetLoadKg, targetReps) {
    const originalUnit = String(entry.load_unit || "kg").toLowerCase();
    const targetLoad = originalUnit === "lbs" ? roundNumber(targetLoadKg / 0.453592, 1) : targetLoadKg;
    const unitLabel = originalUnit === "lbs" ? "lbs" : "kg";
    return `${targetLoad} ${unitLabel} x ${targetReps} Reps`;
  }
  function buildIsometricTargetLabel(entry, action, targetLoadKg, targetDurationSeconds) {
    const originalUnit = String(entry.load_unit || "kg").toLowerCase();
    const targetLoad = originalUnit === "lbs" ? roundNumber(targetLoadKg / 0.453592, 1) : targetLoadKg;
    const unitLabel = originalUnit === "lbs" ? "lbs" : "kg";
    if (targetLoad > 0) {
      return `${targetLoad} ${unitLabel} x ${targetDurationSeconds} S`;
    }
    return `${targetDurationSeconds} S Por Hold`;
  }
  function buildFallbackProgressionDirective(entry) {
    const effortType = getEffortType(entry);
    const loadKg = getNormalizedLoad(entry);
    const reps = Math.max(1, Number(entry.reps) || 0);
    const rpe = Number(entry.rpe) || 0;
    const pain = Number(entry.pain_during) || 0;
    const step = getLoadStepKg(loadKg);
    const durationSeconds = getDurationSeconds(entry);
    if (effortType === "isometric_hold") {
      if (pain > 4) {
        const targetLoadKg2 = roundToStep(Math.max(step, loadKg - step), step);
        const targetDurationSeconds = Math.max(10, durationSeconds - 5);
        return {
          action: "modify",
          label: buildIsometricTargetLabel(entry, "modify", targetLoadKg2, targetDurationSeconds),
          reason: "Dolor alto: conviene bajar agresion local y sostener calidad."
        };
      }
      if (rpe < 8) {
        const targetLoadKg2 = roundToStep(loadKg + step, step);
        return {
          action: "increase",
          label: buildIsometricTargetLabel(entry, "increase", targetLoadKg2, Math.max(10, durationSeconds)),
          reason: "RPE bajo: toca subir carga manteniendo el tiempo util."
        };
      }
      if (rpe < 9.5) {
        return {
          action: "hold",
          label: buildIsometricTargetLabel(entry, "hold", roundNumber(loadKg, 1), Math.max(10, durationSeconds + 5)),
          reason: "RPE medio-alto: manten carga y gana segundos de control."
        };
      }
      return {
        action: "hold",
        label: buildIsometricTargetLabel(entry, "hold", roundNumber(loadKg, 1), Math.max(10, durationSeconds + 3)),
        reason: "Hold maximo con dolor controlado: se mantiene carga y se busca mas tiempo."
      };
    }
    if (pain > 4) {
      const targetLoadKg2 = roundToStep(Math.max(step, loadKg - step), step);
      return {
        action: "modify",
        label: buildDynamicTargetLabel(entry, "modify", targetLoadKg2, reps),
        reason: "Dolor mayor a 4: modifica la carga antes de perseguir PR."
      };
    }
    if (rpe < 8) {
      const targetLoadKg2 = roundToStep(loadKg + step, step);
      return {
        action: "increase",
        label: buildDynamicTargetLabel(entry, "increase", targetLoadKg2, reps),
        reason: "RPE menor a 8: corresponde subir la carga."
      };
    }
    if (rpe <= 9) {
      return {
        action: "hold",
        label: buildDynamicTargetLabel(entry, "hold", roundNumber(loadKg, 1), reps),
        reason: "RPE entre 8 y 9: manten la carga y consolida la salida."
      };
    }
    const targetLoadKg = roundToStep(Math.max(step, loadKg - step), step);
    const targetReps = reps === 1 ? 3 : reps;
    return {
      action: "reduce",
      label: buildDynamicTargetLabel(entry, "reduce", targetLoadKg, targetReps),
      reason: "RPE maximo: baja un escalon y reconstruye sobre base util."
    };
  }
  function getEntryStressScore(entry = {}) {
    const effortType = getEffortType(entry);
    const loadKg = getNormalizedLoad(entry);
    const sets = Math.max(1, Number(entry.sets) || 0);
    const rpeFactor = 0.7 + (Number(entry.rpe) || 0) / 10;
    const painFactor = 1 + (Number(entry.pain_during) || 0) / 20;
    if (effortType === "isometric_hold") {
      const durationBlocks = Math.max(1, getDurationSeconds(entry) / 20);
      const baseLoad2 = loadKg > 0 ? loadKg : 1;
      return baseLoad2 * sets * durationBlocks * rpeFactor * painFactor;
    }
    const reps = Math.max(1, Number(entry.reps) || 0);
    const baseLoad = loadKg > 0 ? loadKg : 1;
    return baseLoad * reps * sets * rpeFactor * painFactor;
  }
  function getProgressionReferenceDate(entry = {}, exerciseEntries = [], options = {}) {
    return options.referenceDate || options.latestCheckin?.date || options.context?.referenceDate || entry.date || exerciseEntries[0]?.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  function buildExerciseProgressionContext(entry, exerciseEntries = [], options = {}) {
    const referenceDate = getProgressionReferenceDate(entry, exerciseEntries, options);
    const entryKey = buildExerciseRecordKey(entry);
    const sameExerciseEntries = exerciseEntries.filter((candidate) => candidate?.date && buildExerciseRecordKey(candidate) === entryKey).filter((candidate) => normalizeDate(candidate.date).getTime() <= normalizeDate(referenceDate).getTime());
    const samePatternEntries = entry.pattern ? exerciseEntries.filter((candidate) => candidate?.date && candidate.pattern === entry.pattern).filter((candidate) => normalizeDate(candidate.date).getTime() <= normalizeDate(referenceDate).getTime()) : [];
    const recentExercise7d = getWindowEntries(sameExerciseEntries, referenceDate, 7);
    const recentExercise21d = getWindowEntries(sameExerciseEntries, referenceDate, 21);
    const recentPattern7d = getWindowEntries(samePatternEntries, referenceDate, 7);
    const lastSeenDate = sameExerciseEntries.slice().sort((left, right) => String(right.date).localeCompare(String(left.date)))[0]?.date || entry.date || null;
    const daysSinceLastExposure = lastSeenDate ? wholeDaysBetween(lastSeenDate, referenceDate) : Number.POSITIVE_INFINITY;
    const exerciseSets7d = sum(recentExercise7d.map((candidate) => Number(candidate.sets) || 0));
    const patternSets7d = sum(recentPattern7d.map((candidate) => Number(candidate.sets) || 0));
    const recentAvgPain = average(recentExercise7d.map((candidate) => Number(candidate.pain_during) || 0));
    const recentAvgRpe = average(recentExercise7d.map((candidate) => Number(candidate.rpe) || 0));
    const acuteStress = sum(recentExercise7d.map(getEntryStressScore));
    const chronicStress = sum(recentExercise21d.map(getEntryStressScore));
    const baselineWeeklyStress = chronicStress > 0 ? chronicStress / 3 : 0;
    const acuteChronicRatio = baselineWeeklyStress > 0 ? acuteStress / baselineWeeklyStress : acuteStress > 0 ? 1 : 0;
    const latestCheckin = options.latestCheckin || null;
    const context = options.context || {};
    const weeklyMetrics = options.weeklyDashboard?.metrics || {};
    const readiness = Number(latestCheckin?.readiness ?? context.readiness ?? 0);
    const globalFatigue = Number(latestCheckin?.fatigue?.global ?? context.globalFatigue ?? 0);
    const forearmFatigue = Number(latestCheckin?.fatigue?.forearm_hand ?? context.forearmFatigue ?? 0);
    const medialPainToday = Number(latestCheckin?.pain?.medial_elbow_right ?? context.medialPainToday ?? 0);
    const weeklyAvgSessionRpe = Number(weeklyMetrics.avgSessionRpe || 0);
    const weeklyAvgMedialPain = Number(weeklyMetrics.avgMedialPain || 0);
    const weeklyTotalSets = Number(weeklyMetrics.totalSets || 0);
    const flags = [];
    let pressure = 0;
    if (readiness > 0) {
      if (readiness <= 5) {
        pressure += 0.2;
        flags.push("readiness bajo");
      } else if (readiness <= 6) {
        pressure += 0.1;
        flags.push("readiness contenido");
      } else if (readiness >= 8) {
        pressure -= 0.04;
      }
    }
    if (globalFatigue >= 7) {
      pressure += 0.18;
      flags.push("fatiga global alta");
    } else if (globalFatigue >= 6) {
      pressure += 0.1;
    }
    if (forearmFatigue >= 7) {
      pressure += 0.18;
      flags.push("antebrazo muy cargado");
    } else if (forearmFatigue >= 6) {
      pressure += 0.1;
      flags.push("antebrazo cargado");
    }
    if (medialPainToday >= 4) {
      pressure += 0.24;
      flags.push("dolor medial activo");
    } else if (medialPainToday >= 3) {
      pressure += 0.14;
      flags.push("dolor medial presente");
    }
    if (weeklyAvgSessionRpe >= 8.5) {
      pressure += 0.12;
      flags.push("semana muy exigente");
    } else if (weeklyAvgSessionRpe >= 7.8) {
      pressure += 0.06;
    }
    if (weeklyAvgMedialPain >= 3.5) {
      pressure += 0.12;
    } else if (weeklyAvgMedialPain >= 2.5) {
      pressure += 0.06;
    }
    if (weeklyTotalSets >= 32) {
      pressure += 0.08;
    } else if (weeklyTotalSets >= 24) {
      pressure += 0.04;
    }
    if (recentAvgPain >= 3.5) {
      pressure += 0.18;
      flags.push("dolor reciente del ejercicio");
    } else if (recentAvgPain >= 2.5) {
      pressure += 0.08;
    }
    if (recentAvgRpe >= 9) {
      pressure += 0.12;
      flags.push("salidas recientes muy altas");
    } else if (recentAvgRpe >= 8.5) {
      pressure += 0.06;
    }
    if (exerciseSets7d >= 10) {
      pressure += 0.16;
      flags.push("mucho volumen reciente del mismo ejercicio");
    } else if (exerciseSets7d >= 6) {
      pressure += 0.08;
    }
    if (patternSets7d >= 16) {
      pressure += 0.12;
      flags.push("patron muy cargado esta semana");
    } else if (patternSets7d >= 10) {
      pressure += 0.06;
    }
    if (acuteChronicRatio >= 1.3) {
      pressure += 0.18;
      flags.push("carga acumulada por encima de la base");
    } else if (acuteChronicRatio >= 1.1) {
      pressure += 0.1;
      flags.push("carga acumulada al alza");
    }
    if (Number.isFinite(daysSinceLastExposure)) {
      if (daysSinceLastExposure <= 1) {
        pressure += 0.14;
        flags.push("muy cerca de la ultima exposicion");
      } else if (daysSinceLastExposure === 2) {
        pressure += 0.06;
        flags.push("todavia cerca de la ultima exposicion");
      }
    }
    pressure = clamp01(Math.max(0, pressure));
    return {
      referenceDate,
      readiness,
      globalFatigue,
      forearmFatigue,
      medialPainToday,
      weeklyAvgSessionRpe,
      weeklyAvgMedialPain,
      weeklyTotalSets,
      exerciseSets7d,
      patternSets7d,
      recentAvgPain: roundNumber(recentAvgPain, 1) || 0,
      recentAvgRpe: roundNumber(recentAvgRpe, 1) || 0,
      acuteStress: roundNumber(acuteStress, 1) || 0,
      acuteChronicRatio: roundNumber(acuteChronicRatio, 2) || 0,
      daysSinceLastExposure,
      pressure,
      fatigueBand: pressure >= 0.58 ? "high" : pressure >= 0.3 ? "moderate" : "low",
      fresh: readiness >= 8 && globalFatigue <= 5 && forearmFatigue <= 5 && medialPainToday <= 2 && exerciseSets7d <= 4 && patternSets7d <= 8 && (!Number.isFinite(daysSinceLastExposure) || daysSinceLastExposure >= 3) && acuteChronicRatio <= 1.05,
      localOverload: exerciseSets7d >= 8 || patternSets7d >= 14 || acuteChronicRatio >= 1.15,
      flags: [...new Set(flags)].slice(0, 4)
    };
  }
  function estimateTargetLoadFromRm(currentRmKg, targetReps, targetRpe, step, fallbackLoadKg = 0) {
    if (!Number.isFinite(currentRmKg) || currentRmKg <= 0) {
      return roundToStep(Math.max(step, fallbackLoadKg || step), step);
    }
    const reps = Math.max(1, Number(targetReps) || 1);
    const rpe = Math.max(6, Math.min(9.5, Number(targetRpe) || 7.5));
    const rir = Math.max(0, 10 - rpe);
    const failureReps = reps + rir;
    const targetLoadKg = currentRmKg / (1 + failureReps / 30);
    return roundToStep(Math.max(step, targetLoadKg), step);
  }
  function buildContextualReason(baseReason, progressionContext) {
    const contextNotes = progressionContext.flags.slice(0, 2);
    if (!contextNotes.length) {
      return baseReason;
    }
    return `${baseReason} Contexto: ${contextNotes.join(" y ")}.`;
  }
  function buildDynamicContextualDirective(entry, progressionContext) {
    const loadKg = getNormalizedLoad(entry);
    const reps = Math.max(1, Number(entry.reps) || 0);
    const rpe = Number(entry.rpe) || 0;
    const pain = Number(entry.pain_during) || 0;
    const step = getLoadStepKg(loadKg);
    const strengthMetrics = buildEntryStrengthMetrics(entry);
    const currentRmKg = Math.max(strengthMetrics.currentRmKg || 0, loadKg);
    const isMaxSingle = reps === 1 && (Boolean(entry.confirmed_rm) || rpe >= 9.5);
    if (loadKg <= 0 || currentRmKg <= 0) {
      return buildFallbackProgressionDirective(entry);
    }
    let mode = "consolidate";
    let targetReps = reps;
    let targetRpe = 8;
    let reason = "Conviene repetir con margen tecnico y consolidar la salida.";
    if (pain > 4 || progressionContext.medialPainToday >= 5 || progressionContext.recentAvgPain >= 4) {
      mode = "protect";
      targetReps = isMaxSingle ? 3 : reps;
      targetRpe = 6.5;
      reason = "Dolor y fatiga local piden proteger tejido y volver a una base util.";
    } else if (rpe < 8) {
      if (progressionContext.fatigueBand === "low" && progressionContext.fresh) {
        mode = "push";
        targetRpe = 8;
        reason = "Hay margen real para subir la carga sin salirte de base util.";
      } else {
        mode = "controlled_push";
        targetRpe = progressionContext.fatigueBand === "high" ? 7 : 7.5;
        reason = "Habia margen, pero la fatiga actual pide una progresion conservadora.";
      }
    } else if (rpe <= 9) {
      mode = "consolidate";
      targetRpe = progressionContext.fatigueBand === "high" ? 7 : progressionContext.fatigueBand === "moderate" || progressionContext.localOverload ? 7.5 : 8;
      reason = progressionContext.fatigueBand === "high" || progressionContext.localOverload ? "Conviene consolidar con un poco menos de agresion." : "Conviene repetir con margen tecnico y consolidar la salida.";
    } else {
      mode = "rebuild";
      targetReps = isMaxSingle ? 3 : reps;
      targetRpe = progressionContext.fatigueBand === "high" ? 6.5 : progressionContext.fatigueBand === "moderate" || progressionContext.localOverload ? 7 : 7.5;
      reason = isMaxSingle ? "Single maximo reciente: la siguiente sesion debe volver a una base util." : "La ultima salida fue muy alta; toca reconstruir con mas margen.";
    }
    let targetLoadKg = estimateTargetLoadFromRm(currentRmKg, targetReps, targetRpe, step, loadKg);
    if (mode === "push") {
      targetLoadKg = Math.max(targetLoadKg, roundToStep(loadKg + step, step));
    } else if (mode === "controlled_push") {
      if (progressionContext.fatigueBand === "high" || progressionContext.localOverload) {
        targetLoadKg = Math.min(targetLoadKg, roundToStep(loadKg, step));
      } else {
        targetLoadKg = Math.min(Math.max(targetLoadKg, roundToStep(loadKg, step)), roundToStep(loadKg + step, step));
      }
    } else if (mode === "consolidate") {
      if (progressionContext.fatigueBand === "high") {
        targetLoadKg = Math.min(targetLoadKg, roundToStep(Math.max(step, loadKg - step), step));
      } else if (progressionContext.fatigueBand === "moderate" || progressionContext.localOverload) {
        targetLoadKg = Math.min(targetLoadKg, roundToStep(loadKg, step));
      } else {
        targetLoadKg = Math.min(Math.max(targetLoadKg, roundToStep(loadKg, step)), roundToStep(loadKg + step, step));
      }
    } else if (mode === "rebuild") {
      const reductionSteps = progressionContext.fatigueBand === "high" || progressionContext.localOverload ? isMaxSingle ? 2 : 1 : 1;
      const rebuildCap = roundToStep(Math.max(step, loadKg - step * reductionSteps), step);
      targetLoadKg = Math.min(targetLoadKg, rebuildCap);
    } else if (mode === "protect") {
      targetLoadKg = Math.min(targetLoadKg, roundToStep(Math.max(step, loadKg - step), step));
    }
    let action = "hold";
    if (mode === "protect") {
      action = "modify";
    } else if (mode === "rebuild") {
      action = "reduce";
    } else if (targetLoadKg >= loadKg + step * 0.5) {
      action = "increase";
    } else if (targetLoadKg <= loadKg - step * 0.5) {
      action = "reduce";
    }
    return {
      action,
      label: buildDynamicTargetLabel(entry, action, targetLoadKg, targetReps),
      reason: buildContextualReason(reason, progressionContext)
    };
  }
  function buildIsometricContextualDirective(entry, progressionContext) {
    const loadKg = getNormalizedLoad(entry);
    const rpe = Number(entry.rpe) || 0;
    const pain = Number(entry.pain_during) || 0;
    const step = getLoadStepKg(loadKg);
    const durationSeconds = getDurationSeconds(entry);
    let targetLoadKg = roundNumber(loadKg, 1);
    let targetDurationSeconds = Math.max(10, durationSeconds);
    let action = "hold";
    let reason = "Se mantiene el hold dentro de una base util.";
    if (pain > 4 || progressionContext.medialPainToday >= 5 || progressionContext.recentAvgPain >= 4) {
      action = "modify";
      targetLoadKg = loadKg > 0 ? roundToStep(Math.max(step, loadKg - step), step) : 0;
      targetDurationSeconds = Math.max(10, durationSeconds - 5);
      reason = "Dolor alto: conviene bajar agresion local y sostener calidad.";
    } else if (rpe < 8) {
      if (progressionContext.fatigueBand === "low" && progressionContext.fresh && !progressionContext.localOverload) {
        action = "increase";
        targetLoadKg = loadKg > 0 ? roundToStep(loadKg + step, step) : 0;
        targetDurationSeconds = Math.max(10, durationSeconds);
        reason = "Habia margen y la fatiga actual permite subir la carga del hold.";
      } else {
        action = "hold";
        targetLoadKg = loadKg > 0 ? roundToStep(loadKg, step) : 0;
        targetDurationSeconds = progressionContext.fatigueBand === "high" ? Math.max(10, durationSeconds) : Math.max(10, durationSeconds + 3);
        reason = "Habia margen, pero la carga acumulada pide sostener antes de subir.";
      }
    } else if (rpe < 9.5) {
      action = "hold";
      targetLoadKg = loadKg > 0 ? roundToStep(loadKg, step) : 0;
      targetDurationSeconds = progressionContext.fatigueBand === "high" || progressionContext.localOverload ? Math.max(10, durationSeconds) : Math.max(10, durationSeconds + 3);
      reason = progressionContext.fatigueBand === "high" || progressionContext.localOverload ? "Conviene consolidar el hold sin sumar mas agresion." : "Manten la carga y gana segundos de control.";
    } else {
      if (progressionContext.fatigueBand === "high" || progressionContext.localOverload) {
        action = loadKg > 0 ? "reduce" : "hold";
        targetLoadKg = loadKg > 0 ? roundToStep(Math.max(step, loadKg - step), step) : 0;
        targetDurationSeconds = Math.max(10, durationSeconds);
        reason = "Hold maximo reciente: conviene volver con una base mas estable.";
      } else {
        action = "hold";
        targetLoadKg = loadKg > 0 ? roundToStep(loadKg, step) : 0;
        targetDurationSeconds = Math.max(10, durationSeconds + 2);
        reason = "Hold maximo con dolor controlado: se mantiene carga y se busca mas tiempo.";
      }
    }
    return {
      action,
      label: buildIsometricTargetLabel(entry, action, targetLoadKg, targetDurationSeconds),
      reason: buildContextualReason(reason, progressionContext)
    };
  }
  function buildProgressionDirective(entry, exerciseEntries = [], options = {}) {
    const effortType = getEffortType(entry);
    const progressionContext = buildExerciseProgressionContext(entry, exerciseEntries, options);
    if (effortType === "isometric_hold") {
      return buildIsometricContextualDirective(entry, progressionContext);
    }
    return buildDynamicContextualDirective(entry, progressionContext);
  }
  function compareRecordEntries(left, right) {
    if (getEffortType(left) === "isometric_hold" || getEffortType(right) === "isometric_hold") {
      const loadDiff2 = getNormalizedLoad(right) - getNormalizedLoad(left);
      if (loadDiff2 !== 0) {
        return loadDiff2;
      }
      const durationDiff = getDurationSeconds(right) - getDurationSeconds(left);
      if (durationDiff !== 0) {
        return durationDiff;
      }
      return getEntryQualityScore(right) - getEntryQualityScore(left);
    }
    const rmDiff = (buildEntryStrengthMetrics(right).currentRmKg || 0) - (buildEntryStrengthMetrics(left).currentRmKg || 0);
    if (rmDiff !== 0) {
      return rmDiff;
    }
    const loadDiff = getNormalizedLoad(right) - getNormalizedLoad(left);
    if (loadDiff !== 0) {
      return loadDiff;
    }
    const volumeDiff = (Number(right.sets) || 0) * (Number(right.reps) || 0) - (Number(left.sets) || 0) * (Number(left.reps) || 0);
    if (volumeDiff !== 0) {
      return volumeDiff;
    }
    return getEntryQualityScore(right) - getEntryQualityScore(left);
  }
  function buildRecordLabel(entry) {
    const load = Number(entry.load) || 0;
    const unit = entry.load_unit || "";
    const reps = Number(entry.reps) || 0;
    const sets = Number(entry.sets) || 0;
    const durationSeconds = getDurationSeconds(entry);
    const effortType = getEffortType(entry);
    if (effortType === "isometric_hold") {
      if (load > 0 && ["kg", "lbs"].includes(unit)) {
        return `${load} ${unit} x ${durationSeconds} S (${sets} Holds)`;
      }
      return `${durationSeconds} S x ${sets} Holds`;
    }
    if (load > 0 && ["kg", "lbs"].includes(unit)) {
      return `${load} ${unit} x ${reps} Reps (${sets} Sets)`;
    }
    if (unit === "seconds") {
      return `${sets} Sets x ${reps} S`;
    }
    return `${sets} Sets x ${reps} Reps`;
  }
  function buildMissingSidePlaceholder(baseRecord, missingSide) {
    const sideLabel = missingSide === "right" ? "derecho" : "izquierdo";
    return {
      exerciseKey: `${String(baseRecord.exerciseName || "sin_ejercicio").trim().toLowerCase()}::${missingSide}`,
      exerciseName: baseRecord.exerciseName,
      side: missingSide,
      displayName: `${baseRecord.exerciseName} (${sideLabel})`,
      category: baseRecord.category,
      pattern: baseRecord.pattern,
      effortType: baseRecord.effortType,
      durationSeconds: null,
      recordLabel: "Sin Captura",
      rmSourceType: "not_available",
      currentRmKg: null,
      confirmedRmKg: null,
      theoreticalRmKg: null,
      estimatedFailureReps: null,
      capacityLabel: null,
      nextTargetLabel: "Registrar Primer Dato",
      progressionAction: "capture",
      progressionReason: `Falta capturar el lado ${sideLabel}.`,
      bestSet: null,
      lastSeenDate: null,
      occurrences: 0,
      totalSets: 0,
      avgPain: null,
      avgTechnique: null,
      avgVector: null,
      maxLoadKg: 0,
      qualityScore: null,
      placeholder: true
    };
  }
  function buildExerciseRecords(exerciseEntries = [], options = {}) {
    const buckets = exerciseEntries.reduce((map, entry) => {
      if (!entry.exercise_name) {
        return map;
      }
      const key = buildExerciseRecordKey(entry);
      if (!map[key]) {
        map[key] = {
          exerciseKey: key,
          exerciseName: entry.exercise_name,
          side: entry.side || "unspecified",
          entries: []
        };
      }
      map[key].entries.push(entry);
      return map;
    }, {});
    const records = Object.values(buckets).map(({ exerciseKey, exerciseName, side, entries }) => {
      const sorted = entries.slice().sort(compareRecordEntries);
      const best = sorted[0];
      const bestMetrics = buildEntryStrengthMetrics(best);
      const avgPain = average(entries.map((entry) => Number(entry.pain_during) || 0));
      const avgTechnique = average(entries.map((entry) => Number(entry.technique_quality) || 0));
      const avgVector = average(entries.map((entry) => Number(entry.vector_quality) || 0));
      const totalSets = sum(entries.map((entry) => Number(entry.sets) || 0));
      const maxLoadKg = Math.max(...entries.map((entry) => getNormalizedLoad(entry)), 0);
      const theoreticalRmKg = Math.max(...entries.map((entry) => buildEntryStrengthMetrics(entry).theoreticalRmKg || 0), 0);
      const confirmedRmKg = Math.max(...entries.map((entry) => buildEntryStrengthMetrics(entry).confirmedRmKg || 0), 0);
      const currentRmKg = confirmedRmKg || theoreticalRmKg || null;
      const rmSourceType = confirmedRmKg ? "confirmed" : currentRmKg ? "theoretical" : "not_available";
      const effortType = getEffortType(best);
      const durationSeconds = getDurationSeconds(best);
      const progressionDirective = buildProgressionDirective(best, exerciseEntries, options);
      return {
        exerciseKey,
        exerciseName,
        side,
        displayName: side && side !== "bilateral" && side !== "unspecified" ? `${exerciseName} (${side === "right" ? "derecho" : "izquierdo"})` : exerciseName,
        category: best.category,
        pattern: best.pattern,
        effortType,
        durationSeconds,
        recordLabel: buildRecordLabel(best),
        rmSourceType,
        currentRmKg: roundNumber(currentRmKg, 1),
        confirmedRmKg: roundNumber(confirmedRmKg || null, 1),
        theoreticalRmKg: roundNumber(theoreticalRmKg || null, 1),
        estimatedFailureReps: bestMetrics.estimatedFailureReps,
        capacityLabel: effortType === "isometric_hold" ? buildRecordLabel(best) : null,
        nextTargetLabel: progressionDirective.label,
        progressionAction: progressionDirective.action,
        progressionReason: progressionDirective.reason,
        bestSet: {
          load: Number(best.load) || 0,
          loadUnit: best.load_unit || "",
          reps: Number(best.reps) || 0,
          sets: Number(best.sets) || 0,
          rpe: Number(best.rpe) || 0,
          effortType,
          durationSeconds,
          confirmedRm: Boolean(best.confirmed_rm),
          date: best.date || null
        },
        lastSeenDate: entries.slice().sort((left, right) => String(right.date).localeCompare(String(left.date)))[0]?.date || null,
        occurrences: entries.length,
        totalSets,
        avgPain: Number(avgPain.toFixed(1)),
        avgTechnique: Number(avgTechnique.toFixed(2)),
        avgVector: Number(avgVector.toFixed(2)),
        maxLoadKg: Number(maxLoadKg.toFixed(1)),
        qualityScore: Number(getEntryQualityScore(best).toFixed(2))
      };
    });
    const unilateralGroups = records.reduce((map, record) => {
      if (!["right", "left"].includes(record.side)) {
        return map;
      }
      if (!map[record.exerciseName]) {
        map[record.exerciseName] = [];
      }
      map[record.exerciseName].push(record);
      return map;
    }, {});
    const placeholders = Object.values(unilateralGroups).flatMap((group) => {
      const hasRight = group.some((record) => record.side === "right");
      const hasLeft = group.some((record) => record.side === "left");
      const baseRecord = group[0];
      if (hasRight && !hasLeft) {
        return [buildMissingSidePlaceholder(baseRecord, "left")];
      }
      if (hasLeft && !hasRight) {
        return [buildMissingSidePlaceholder(baseRecord, "right")];
      }
      return [];
    });
    return [...records, ...placeholders].sort((left, right) => {
      const nameDiff = left.exerciseName.localeCompare(right.exerciseName, "es");
      if (nameDiff !== 0) {
        return nameDiff;
      }
      return String(left.side).localeCompare(String(right.side), "es");
    });
  }
  function buildPerformanceSnapshot(profile, latestCheckin, context, recommendation, weeklyDashboard, sessionInsight, exerciseEntries = [], persistedRecords = []) {
    const records = Array.isArray(exerciseEntries) && exerciseEntries.length > 0 ? buildExerciseRecords(exerciseEntries, {
      latestCheckin,
      context,
      weeklyDashboard,
      referenceDate: latestCheckin?.date || context?.referenceDate
    }) : persistedRecords;
    const bodyweight = Number(latestCheckin?.bodyweight || 0);
    const targetWeight = Number(profile?.bodyweight_class_target_kg || 0);
    const weightGap = targetWeight > 0 ? Number((targetWeight - bodyweight).toFixed(1)) : 0;
    const riskHeadline = weeklyDashboard?.riskFlags?.[0] || "sin alerta dominante";
    const positiveHeadline = weeklyDashboard?.positiveSignals?.[0] || "todavia sin una senal fuerte acumulada";
    return {
      finalObjective: {
        label: profile?.primary_goal || "",
        support: `${targetWeight} kg objetivo competitivo`
      },
      nextSessionObjective: {
        label: recommendation?.session_recommendation?.label || "sin recomendacion definida",
        support: recommendation?.session_recommendation?.next_priority || "sin prioridad afinada"
      },
      currentBlockObjective: {
        label: weeklyDashboard?.recommendedFocus || "seguir acumulando datos utiles",
        support: sessionInsight?.nextPriority || "sin lectura post-sesion"
      },
      currentData: [
        {
          label: "Peso actual",
          value: bodyweight > 0 ? `${bodyweight} kg` : "sin dato",
          note: targetWeight > 0 ? `diferencia vs objetivo: ${weightGap > 0 ? `+${weightGap}` : weightGap} kg` : "sin clase objetivo"
        },
        {
          label: "Readiness",
          value: latestCheckin ? `${latestCheckin.readiness}/10` : "sin dato",
          note: weeklyDashboard ? `promedio semanal ${weeklyDashboard.metrics.avgReadiness}/10` : "sin promedio"
        },
        {
          label: "Dolor medial",
          value: latestCheckin ? `${latestCheckin?.pain?.medial_elbow_right || 0}/10` : "sin dato",
          note: weeklyDashboard ? `media semanal ${weeklyDashboard.metrics.avgMedialPain}/10` : "sin promedio"
        },
        {
          label: "Cuello de botella",
          value: sessionInsight?.rootLimitation || "sin limite claro",
          note: context?.deepLowDependency ? "todavia dependes de agarre profundo / bajo" : "sin dependencia marcada"
        },
        {
          label: "Sets especificos 7d",
          value: context ? String(context.weeklySpecificSets) : "0",
          note: context ? `${context.weeklyExerciseCount} ejercicios registrados` : "sin exposicion"
        },
        {
          label: "Riesgo dominante",
          value: riskHeadline,
          note: positiveHeadline
        },
        {
          label: "Continuidad de captura",
          value: weeklyDashboard ? `${weeklyDashboard.metrics.checkinDaysCaptured}/7 dias` : "sin dato",
          note: weeklyDashboard ? `hueco maximo ${weeklyDashboard.metrics.maxCheckinGapDays} dias` : "sin lectura"
        }
      ],
      records
    };
  }

  // src/simulation/simulation-types.js
  var REAL_STATE_PATTERN_KEYS = [
    "rising",
    "pronation",
    "fingers",
    "cupping",
    "backPressure",
    "sidePressure",
    "hookDefense",
    "topRollOffense",
    "finishing",
    "generalStrength",
    "tissueTolerance"
  ];
  function createEmptyTissueState() {
    return {
      medialPain: 0,
      lateralPain: 0,
      forearmFatigue: 0,
      sncFatigue: 0,
      backFatigue: 0,
      globalFatigue: 0,
      legsFatigue: 0,
      tissueIrritability: 0,
      tableLoad7d: 0
    };
  }
  function createEmptyPatternScores() {
    return REAL_STATE_PATTERN_KEYS.reduce((scores, key) => {
      scores[key] = 0;
      return scores;
    }, {});
  }
  function createEmptyPatternScoreDetails() {
    return REAL_STATE_PATTERN_KEYS.reduce((details, key) => {
      details[key] = {
        prior: 0,
        observed: 0,
        final: 0,
        evidenceCount: 0,
        confidence: 0,
        sourcePatterns: []
      };
      return details;
    }, {});
  }
  function createEmptyRealState(nowDate = "") {
    return {
      generatedAt: nowDate,
      dataConfidence: 0,
      modelConfidence: 0,
      contextConfidence: 0,
      continuityScore: 0,
      tissueState: createEmptyTissueState(),
      patternScores: createEmptyPatternScores(),
      patternScoreDetails: createEmptyPatternScoreDetails(),
      exerciseStates: {},
      limitingFactors: [],
      positiveSignals: [],
      riskFlags: [],
      metadata: {
        recordCount: 0,
        checkinCount14d: 0,
        sessionCount21d: 0,
        tableSessions7d: 0,
        lastCheckinDate: null,
        lastSessionDate: null,
        lastTableDate: null
      }
    };
  }
  function createEmptyExerciseState(overrides = {}) {
    return {
      exerciseKey: "",
      exerciseName: "",
      side: "unspecified",
      category: "",
      pattern: "",
      effortType: "dynamic",
      anchorSet: null,
      currentRecordLabel: null,
      nextTargetLabel: null,
      progressionAction: "hold",
      progressionReason: "",
      rmSourceType: "not_available",
      currentRmKg: null,
      capacityLabel: null,
      qualityScore: 0,
      avgPain: 0,
      occurrences: 0,
      totalSets: 0,
      lastSeenDate: null,
      daysSinceSeen: null,
      localConfidence: 0,
      usageDensity: 0,
      stateFlags: [],
      ...overrides
    };
  }

  // src/simulation/simulation-utils.js
  var HIGH_LEVEL_SCORE_MAP = {
    rising: ["rising", "topRollOffense"],
    pronation: ["pronation", "topRollOffense"],
    cupping: ["cupping", "hookDefense"],
    back_pressure: ["backPressure", "topRollOffense", "generalStrength"],
    side_pressure: ["sidePressure", "finishing"],
    containment: ["fingers", "hookDefense"],
    finish: ["finishing"],
    high_hook: ["hookDefense", "finishing"],
    deep_hook: ["hookDefense", "finishing"],
    vertical_pull: ["generalStrength", "backPressure"],
    horizontal_pull: ["generalStrength", "backPressure"],
    horizontal_push: ["generalStrength", "finishing"],
    vertical_push: ["generalStrength", "finishing"],
    flexor_pronator_isometric: ["tissueTolerance", "fingers"],
    extensor_balance: ["tissueTolerance"],
    wrist_control: ["tissueTolerance", "cupping"],
    tendon_tolerance: ["tissueTolerance"]
  };
  function clamp012(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
  }
  function safeNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function average2(values = []) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    return values.reduce((total, value) => total + safeNumber(value), 0) / values.length;
  }
  function sum2(values = []) {
    return (Array.isArray(values) ? values : []).reduce((total, value) => total + safeNumber(value), 0);
  }
  function normalizeDate2(dateText) {
    return /* @__PURE__ */ new Date(`${dateText}T12:00:00`);
  }
  function wholeDaysBetween2(leftDateText, rightDateText) {
    if (!leftDateText || !rightDateText) {
      return Number.POSITIVE_INFINITY;
    }
    return Math.round(
      Math.abs(normalizeDate2(leftDateText).getTime() - normalizeDate2(rightDateText).getTime()) / (24 * 60 * 60 * 1e3)
    );
  }
  function sortByDateDescending(entries = []) {
    return entries.slice().sort((left, right) => String(right?.date || "").localeCompare(String(left?.date || "")));
  }
  function getLatestByDate(entries = []) {
    return sortByDateDescending(entries)[0] || null;
  }
  function getRecentWindow(entries = [], nowDate, days) {
    const reference = normalizeDate2(nowDate).getTime();
    const windowMs = days * 24 * 60 * 60 * 1e3;
    return (Array.isArray(entries) ? entries : []).filter((entry) => {
      if (!entry?.date) {
        return false;
      }
      const delta = reference - normalizeDate2(entry.date).getTime();
      return delta >= 0 && delta <= windowMs;
    });
  }
  function uniqueDates(entries = []) {
    return [...new Set((Array.isArray(entries) ? entries : []).map((entry) => entry?.date).filter(Boolean))];
  }
  function buildCoverageScore(entries = [], nowDate, days) {
    const dates = uniqueDates(getRecentWindow(entries, nowDate, days));
    return clamp012(dates.length / Math.max(days, 1));
  }
  function buildGapPenalty(entries = [], nowDate, days) {
    const dates = uniqueDates(getRecentWindow(entries, nowDate, days)).sort((left, right) => String(left).localeCompare(String(right)));
    if (dates.length === 0) {
      return 1;
    }
    let maxGap = Math.max(0, wholeDaysBetween2(dates[0], nowDate) - 1);
    for (let index = 1; index < dates.length; index += 1) {
      maxGap = Math.max(maxGap, Math.max(0, wholeDaysBetween2(dates[index - 1], dates[index]) - 1));
    }
    return clamp012(maxGap / Math.max(days, 1));
  }
  function buildRecencyScore(lastSeenDate, nowDate, freshnessDays = 21) {
    const daysSince = wholeDaysBetween2(lastSeenDate, nowDate);
    if (!Number.isFinite(daysSince)) {
      return 0;
    }
    return clamp012(1 - daysSince / Math.max(freshnessDays, 1));
  }
  function inferScoreKeysForRecord(record = {}) {
    const keys = new Set(HIGH_LEVEL_SCORE_MAP[String(record.pattern || "").trim()] || []);
    const exerciseName = String(record.exerciseName || record.exercise_name || "").toLowerCase();
    if (exerciseName.includes("rising")) {
      keys.add("rising");
      keys.add("topRollOffense");
    }
    if (exerciseName.includes("pronacion") || exerciseName.includes("pronation")) {
      keys.add("pronation");
      keys.add("topRollOffense");
    }
    if (exerciseName.includes("dominada") || exerciseName.includes("pull")) {
      keys.add("generalStrength");
      keys.add("backPressure");
    }
    if (exerciseName.includes("back_pressure") || exerciseName.includes("back pressure")) {
      keys.add("backPressure");
      keys.add("topRollOffense");
    }
    if (exerciseName.includes("contain")) {
      keys.add("fingers");
      keys.add("hookDefense");
    }
    if (exerciseName.includes("finish")) {
      keys.add("finishing");
    }
    if (exerciseName.includes("hook")) {
      keys.add("hookDefense");
      keys.add("finishing");
    }
    if (exerciseName.includes("dedo") || exerciseName.includes("finger")) {
      keys.add("fingers");
    }
    return [...keys].filter((key) => REAL_STATE_PATTERN_KEYS.includes(key));
  }
  function strengthTagToPrior(value) {
    if (value === "fuerte") {
      return 0.78;
    }
    if (value === "fuerte_secundaria") {
      return 0.68;
    }
    if (value === "debil") {
      return 0.34;
    }
    if (value === "debil_secundaria") {
      return 0.45;
    }
    return 0.52;
  }
  function getProfilePriorByScoreKey(profile = {}, scoreKey = "") {
    const strengths = profile.current_strength_profile || {};
    const basePrior = (patternKey) => strengthTagToPrior(strengths[patternKey]);
    switch (scoreKey) {
      case "rising":
        return basePrior("rising");
      case "pronation":
        return basePrior("pronation");
      case "fingers":
        return average2([basePrior("cupping"), basePrior("flexor_pronator_isometric")]);
      case "cupping":
        return basePrior("cupping");
      case "backPressure":
        return basePrior("back_pressure");
      case "sidePressure":
        return basePrior("side_pressure");
      case "hookDefense":
        return average2([basePrior("cupping"), basePrior("side_pressure"), basePrior("flexor_pronator_isometric")]);
      case "topRollOffense":
        return average2([basePrior("rising"), basePrior("pronation"), basePrior("back_pressure")]);
      case "finishing":
        return average2([basePrior("side_pressure"), basePrior("back_pressure")]);
      case "generalStrength":
        return average2([basePrior("back_pressure"), basePrior("pronation"), 0.58]);
      case "tissueTolerance":
        return average2([basePrior("flexor_pronator_isometric"), basePrior("cupping")]);
      default:
        return 0.5;
    }
  }
  function getPriorityWeightByScoreKey(profile = {}, scoreKey = "") {
    const priorities = profile.priority_distribution || {};
    const weight = (patternKey) => safeNumber(priorities[patternKey], 0);
    switch (scoreKey) {
      case "rising":
        return weight("rising");
      case "pronation":
        return weight("pronation");
      case "fingers":
        return average2([weight("cupping"), weight("flexor_pronator_isometric")]);
      case "cupping":
        return weight("cupping");
      case "backPressure":
        return weight("back_pressure");
      case "sidePressure":
        return weight("side_pressure");
      case "hookDefense":
        return average2([weight("cupping"), weight("side_pressure")]);
      case "topRollOffense":
        return average2([weight("rising"), weight("pronation"), weight("back_pressure")]);
      case "finishing":
        return average2([weight("side_pressure"), weight("back_pressure")]);
      case "generalStrength":
        return average2([weight("back_pressure"), 1.5]);
      case "tissueTolerance":
        return average2([weight("flexor_pronator_isometric"), 2]);
      default:
        return 0;
    }
  }
  function buildIsometricCapacityScore(record = {}) {
    const load = safeNumber(record.maxLoadKg || record.bestSet?.load, 0);
    const seconds = safeNumber(record.bestSet?.durationSeconds || record.best_set?.duration_seconds, 0);
    return load * seconds;
  }
  function formatStartCase(value) {
    return String(value || "").replaceAll("_", " ").replace(/\s+/g, " ").trim().replace(/(^|[\s(])([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
  }
  function buildExerciseAnchorSet(record = {}) {
    const bestSet = record.bestSet || record.best_set;
    if (!bestSet) {
      return null;
    }
    return {
      load: safeNumber(bestSet.load, 0),
      loadUnit: bestSet.loadUnit || bestSet.load_unit || "kg",
      reps: safeNumber(bestSet.reps, 0),
      sets: safeNumber(bestSet.sets, 0),
      rpe: safeNumber(bestSet.rpe, 0),
      durationSeconds: safeNumber(bestSet.durationSeconds || bestSet.duration_seconds, 0),
      effortType: bestSet.effortType || bestSet.effort_type || record.effortType || record.effort_type || "dynamic",
      confirmedRm: Boolean(bestSet.confirmedRm ?? bestSet.confirmed_rm),
      date: bestSet.date || record.lastSeenDate || record.last_seen_date || null
    };
  }

  // src/simulation/real-state-engine.js
  function getRecordField(record, camelKey, snakeKey) {
    return record?.[camelKey] ?? record?.[snakeKey];
  }
  function getSessionPainPeak2(session) {
    return Math.max(
      ...Array.isArray(session?.pain_events) ? session.pain_events.map((event) => safeNumber(event?.severity, 0)) : [0]
    );
  }
  function isTableSession2(session) {
    return String(session?.session_type || "").includes("mesa");
  }
  function buildContinuityScore({ checkins, sessions, nowDate }) {
    const checkinCoverage = buildCoverageScore(checkins, nowDate, 14);
    const sessionCoverage = buildCoverageScore(sessions, nowDate, 21);
    const checkinGapPenalty = buildGapPenalty(checkins, nowDate, 14);
    const sessionGapPenalty = buildGapPenalty(sessions, nowDate, 21);
    return clamp012(
      checkinCoverage * 0.38 + sessionCoverage * 0.32 + (1 - checkinGapPenalty) * 0.17 + (1 - sessionGapPenalty) * 0.13
    );
  }
  function buildDataConfidence({ checkins, sessions, exerciseEntries, exerciseRecords, nowDate }) {
    const checkinCoverage = buildCoverageScore(checkins, nowDate, 14);
    const sessionCoverage = buildCoverageScore(sessions, nowDate, 21);
    const entryDensity = clamp012(getRecentWindow(exerciseEntries, nowDate, 21).length / 24);
    const recordDensity = clamp012((Array.isArray(exerciseRecords) ? exerciseRecords.length : 0) / 10);
    const lastCheckin = getLatestByDate(checkins);
    const lastSession = getLatestByDate(sessions);
    const checkinRecency = buildRecencyScore(lastCheckin?.date, nowDate, 7);
    const sessionRecency = buildRecencyScore(lastSession?.date, nowDate, 10);
    return clamp012(
      checkinCoverage * 0.24 + sessionCoverage * 0.22 + entryDensity * 0.16 + recordDensity * 0.16 + checkinRecency * 0.12 + sessionRecency * 0.1
    );
  }
  function buildModelConfidence({ dataConfidence, exerciseRecords }) {
    const confirmedFraction = clamp012(
      (Array.isArray(exerciseRecords) ? exerciseRecords : []).filter(
        (record) => getRecordField(record, "rmSourceType", "rm_source_type") === "confirmed"
      ).length / Math.max((exerciseRecords || []).length, 1)
    );
    const recordCountScore = clamp012((exerciseRecords || []).length / 8);
    return clamp012(
      dataConfidence * 0.62 + recordCountScore * 0.23 + confirmedFraction * 0.15
    );
  }
  function buildTissueState({ checkins, sessions, nowDate }) {
    const latestCheckin = getLatestByDate(checkins);
    const recentCheckins = getRecentWindow(checkins, nowDate, 14);
    const recentSessions = getRecentWindow(sessions, nowDate, 7);
    const tableSessions7d = recentSessions.filter(isTableSession2);
    const medialPainHistory = recentCheckins.map((checkin) => safeNumber(checkin?.pain?.medial_elbow_right, 0));
    const lateralPainHistory = recentCheckins.map((checkin) => safeNumber(checkin?.pain?.lateral_elbow_right, 0));
    const sessionPainHistory = recentSessions.map(getSessionPainPeak2);
    const medialPain = Math.max(
      safeNumber(latestCheckin?.pain?.medial_elbow_right, 0),
      average2(medialPainHistory),
      average2(sessionPainHistory)
    );
    const lateralPain = Math.max(
      safeNumber(latestCheckin?.pain?.lateral_elbow_right, 0),
      average2(lateralPainHistory)
    );
    const globalFatigue = safeNumber(latestCheckin?.fatigue?.global, average2(recentCheckins.map((checkin) => safeNumber(checkin?.fatigue?.global, 0))));
    const forearmFatigue = safeNumber(latestCheckin?.fatigue?.forearm_hand, average2(recentCheckins.map((checkin) => safeNumber(checkin?.fatigue?.forearm_hand, 0))));
    const backFatigue = safeNumber(latestCheckin?.fatigue?.back, average2(recentCheckins.map((checkin) => safeNumber(checkin?.fatigue?.back, 0))));
    const legsFatigue = safeNumber(latestCheckin?.fatigue?.legs, average2(recentCheckins.map((checkin) => safeNumber(checkin?.fatigue?.legs, 0))));
    const sncFatigue = clamp012((globalFatigue * 0.7 + (safeNumber(latestCheckin?.readiness, 5) < 6 ? 3 : 0)) / 10) * 10;
    const tableLoad7d = sum2(tableSessions7d.map((session) => safeNumber(session?.effort_rpe_session, 0))) / 10;
    const tissueIrritability = clamp012(
      medialPain / 10 * 0.45 + lateralPain / 10 * 0.1 + forearmFatigue / 10 * 0.2 + clamp012(tableLoad7d / 4) * 0.25
    ) * 10;
    return {
      ...createEmptyTissueState(),
      medialPain: Number(medialPain.toFixed(2)),
      lateralPain: Number(lateralPain.toFixed(2)),
      forearmFatigue: Number(forearmFatigue.toFixed(2)),
      sncFatigue: Number(sncFatigue.toFixed(2)),
      backFatigue: Number(backFatigue.toFixed(2)),
      globalFatigue: Number(globalFatigue.toFixed(2)),
      legsFatigue: Number(legsFatigue.toFixed(2)),
      tissueIrritability: Number(tissueIrritability.toFixed(2)),
      tableLoad7d: Number(tableLoad7d.toFixed(2))
    };
  }
  function buildObservedRecordScore(record, context) {
    const rmSourceType = getRecordField(record, "rmSourceType", "rm_source_type");
    const currentRmKg = safeNumber(getRecordField(record, "currentRmKg", "current_rm_kg"), 0);
    const maxLoadKg = safeNumber(getRecordField(record, "maxLoadKg", "max_load_kg"), 0);
    const qualityScore = clamp012(safeNumber(getRecordField(record, "qualityScore", "quality_score"), 0));
    const avgPain = safeNumber(getRecordField(record, "avgPain", "avg_pain"), 0);
    const occurrences = safeNumber(getRecordField(record, "occurrences", "occurrences"), 0);
    const lastSeenDate = getRecordField(record, "lastSeenDate", "last_seen_date");
    const effortType = getRecordField(record, "effortType", "effort_type");
    const recencyScore = buildRecencyScore(lastSeenDate, context.nowDate, 28);
    const evidenceScore = clamp012(occurrences / 3);
    const reliabilityScore = rmSourceType === "confirmed" ? 1 : rmSourceType === "theoretical" ? 0.84 : 0.68;
    const painPenalty = clamp012(avgPain / 10);
    let strengthScore = 0;
    if (effortType === "isometric_hold" || rmSourceType === "not_available") {
      const isoCapacity = buildIsometricCapacityScore(record);
      strengthScore = context.maxIsoCapacity > 0 ? clamp012(isoCapacity / context.maxIsoCapacity) : 0.35;
    } else if (currentRmKg > 0) {
      strengthScore = context.maxDynamicRm > 0 ? clamp012(currentRmKg / context.maxDynamicRm) : 0.35;
    } else if (maxLoadKg > 0) {
      strengthScore = context.maxDynamicLoad > 0 ? clamp012(maxLoadKg / context.maxDynamicLoad) : 0.3;
    }
    return clamp012(
      strengthScore * 0.46 + qualityScore * 0.18 + recencyScore * 0.16 + evidenceScore * 0.1 + reliabilityScore * 0.1 - painPenalty * 0.08
    );
  }
  function buildExerciseStates({ exerciseRecords, nowDate, dataConfidence }) {
    return (Array.isArray(exerciseRecords) ? exerciseRecords : []).reduce((states, record) => {
      const exerciseKey = getRecordField(record, "exerciseKey", "exercise_key");
      const avgPain = safeNumber(getRecordField(record, "avgPain", "avg_pain"), 0);
      const occurrences = safeNumber(getRecordField(record, "occurrences", "occurrences"), 0);
      const totalSets = safeNumber(getRecordField(record, "totalSets", "total_sets"), 0);
      const qualityScore = clamp012(safeNumber(getRecordField(record, "qualityScore", "quality_score"), 0));
      const lastSeenDate = getRecordField(record, "lastSeenDate", "last_seen_date");
      const daysSinceSeen = Number.isFinite(wholeDaysBetween2(lastSeenDate, nowDate)) ? wholeDaysBetween2(lastSeenDate, nowDate) : null;
      const stateFlags = [];
      if (avgPain >= 4) {
        stateFlags.push("local_pain_risk");
      }
      if (daysSinceSeen !== null && daysSinceSeen > 21) {
        stateFlags.push("stale_exposure");
      }
      if (String(getRecordField(record, "progressionAction", "progression_action")) === "reduce") {
        stateFlags.push("rebuild_required");
      }
      if (String(getRecordField(record, "rmSourceType", "rm_source_type")) === "confirmed") {
        stateFlags.push("confirmed_anchor");
      }
      states[exerciseKey] = createEmptyExerciseState({
        exerciseKey,
        exerciseName: getRecordField(record, "exerciseName", "exercise_name"),
        side: getRecordField(record, "side", "side") || "unspecified",
        category: getRecordField(record, "category", "category") || "",
        pattern: getRecordField(record, "pattern", "pattern") || "",
        effortType: getRecordField(record, "effortType", "effort_type") || "dynamic",
        anchorSet: buildExerciseAnchorSet(record),
        currentRecordLabel: getRecordField(record, "recordLabel", "record_label") || getRecordField(record, "capacityLabel", "capacity_label"),
        nextTargetLabel: getRecordField(record, "nextTargetLabel", "next_target_label") || null,
        progressionAction: getRecordField(record, "progressionAction", "progression_action") || "hold",
        progressionReason: getRecordField(record, "progressionReason", "progression_reason") || "",
        rmSourceType: getRecordField(record, "rmSourceType", "rm_source_type") || "not_available",
        currentRmKg: getRecordField(record, "currentRmKg", "current_rm_kg") ?? null,
        capacityLabel: getRecordField(record, "capacityLabel", "capacity_label") || null,
        qualityScore,
        avgPain,
        occurrences,
        totalSets,
        lastSeenDate,
        daysSinceSeen,
        localConfidence: Number(clamp012(dataConfidence * 0.55 + clamp012(occurrences / 3) * 0.25 + qualityScore * 0.2).toFixed(2)),
        usageDensity: Number(clamp012(totalSets / 6).toFixed(2)),
        stateFlags
      });
      return states;
    }, {});
  }
  function buildPatternScores({ athleteProfile, exerciseRecords, nowDate, dataConfidence }) {
    const maxDynamicRm = Math.max(
      0,
      ...(exerciseRecords || []).map((record) => safeNumber(getRecordField(record, "currentRmKg", "current_rm_kg"), 0))
    );
    const maxDynamicLoad = Math.max(
      0,
      ...(exerciseRecords || []).map((record) => safeNumber(getRecordField(record, "maxLoadKg", "max_load_kg"), 0))
    );
    const maxIsoCapacity = Math.max(
      0,
      ...(exerciseRecords || []).map((record) => buildIsometricCapacityScore(record))
    );
    const aggregation = REAL_STATE_PATTERN_KEYS.reduce((map, key) => {
      map[key] = [];
      return map;
    }, {});
    const details = createEmptyPatternScoreDetails();
    (exerciseRecords || []).forEach((record) => {
      const scoreKeys = inferScoreKeysForRecord(record);
      const observedScore = buildObservedRecordScore(record, {
        nowDate,
        maxDynamicRm,
        maxDynamicLoad,
        maxIsoCapacity
      });
      scoreKeys.forEach((scoreKey) => {
        aggregation[scoreKey].push({
          score: observedScore,
          sourcePattern: getRecordField(record, "pattern", "pattern") || "unknown"
        });
      });
    });
    const patternScores = createEmptyPatternScores();
    REAL_STATE_PATTERN_KEYS.forEach((scoreKey) => {
      const evidence = aggregation[scoreKey] || [];
      const observed = average2(evidence.map((item) => item.score));
      const prior = getProfilePriorByScoreKey(athleteProfile, scoreKey);
      const blendWeight = clamp012(0.28 + dataConfidence * 0.57);
      const finalScore = evidence.length > 0 ? clamp012(prior * (1 - blendWeight) + observed * blendWeight) : clamp012(prior * 0.92);
      patternScores[scoreKey] = Number(finalScore.toFixed(2));
      details[scoreKey] = {
        prior: Number(prior.toFixed(2)),
        observed: Number(observed.toFixed(2)),
        final: Number(finalScore.toFixed(2)),
        evidenceCount: evidence.length,
        confidence: Number(clamp012(dataConfidence * 0.65 + clamp012(evidence.length / 2) * 0.35).toFixed(2)),
        sourcePatterns: [...new Set(evidence.map((item) => item.sourcePattern))]
      };
    });
    return {
      patternScores,
      patternScoreDetails: details
    };
  }
  function buildLimitingFactors({ athleteProfile, patternScores, tissueState }) {
    return REAL_STATE_PATTERN_KEYS.map((scoreKey) => {
      const patternScore = safeNumber(patternScores[scoreKey], 0);
      const priorityWeight = getPriorityWeightByScoreKey(athleteProfile, scoreKey);
      const urgency = clamp012(
        (1 - patternScore) * 0.58 + clamp012(priorityWeight / 4) * 0.24 + (scoreKey === "tissueTolerance" ? tissueState.tissueIrritability / 10 : 0) * 0.18
      );
      return {
        label: scoreKey,
        urgency
      };
    }).sort((left, right) => right.urgency - left.urgency).slice(0, 4).map((item) => item.label);
  }
  function buildPositiveSignals({ exerciseRecords, patternScores, tissueState, latestCheckin, continuityScore }) {
    const signals = [];
    if ((exerciseRecords || []).some((record) => getRecordField(record, "rmSourceType", "rm_source_type") === "confirmed")) {
      signals.push("confirmed_rm_present");
    }
    if (safeNumber(patternScores.backPressure, 0) >= 0.65) {
      signals.push("back_pressure_positive");
    }
    if (safeNumber(patternScores.pronation, 0) >= 0.65) {
      signals.push("pronation_positive");
    }
    if (safeNumber(latestCheckin?.readiness, 0) >= 7) {
      signals.push("readiness_good");
    }
    if (tissueState.medialPain <= 3 && tissueState.tissueIrritability <= 4) {
      signals.push("pain_under_control");
    }
    if (continuityScore >= 0.6) {
      signals.push("continuity_stable");
    }
    return signals;
  }
  function buildRiskFlags({ dataConfidence, continuityScore, tissueState, latestCheckin, sessions, nowDate }) {
    const recentSessions = getRecentWindow(sessions, nowDate, 7);
    const riskFlags = [];
    if (dataConfidence < 0.4) {
      riskFlags.push("low_data_density");
    }
    if (continuityScore < 0.35) {
      riskFlags.push("low_session_continuity");
    }
    if (tissueState.medialPain >= 4) {
      riskFlags.push("medial_pain_active");
    }
    if (tissueState.forearmFatigue >= 7) {
      riskFlags.push("forearm_fatigue_high");
    }
    if (tissueState.tissueIrritability >= 5.5) {
      riskFlags.push("tissue_irritability_rising");
    }
    if (tissueState.tableLoad7d >= 2.2) {
      riskFlags.push("high_recent_table_load");
    }
    if (safeNumber(latestCheckin?.available_time_min, 0) > 0 && safeNumber(latestCheckin?.available_time_min, 0) < 60) {
      riskFlags.push("low_availability");
    }
    if (recentSessions.some((session) => safeNumber(session?.effort_rpe_session, 0) >= 9.5 && isTableSession2(session))) {
      riskFlags.push("recent_table_session_was_heavy");
    }
    return riskFlags;
  }
  function buildRealState({
    athleteProfile,
    checkins = [],
    sessions = [],
    exerciseEntries = [],
    exerciseRecords = [],
    nowDate
  }) {
    const normalizedNowDate = nowDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const latestCheckin = getLatestByDate(checkins);
    const latestSession = getLatestByDate(sessions);
    const continuityScore = buildContinuityScore({
      checkins,
      sessions,
      nowDate: normalizedNowDate
    });
    const dataConfidence = buildDataConfidence({
      checkins,
      sessions,
      exerciseEntries,
      exerciseRecords,
      nowDate: normalizedNowDate
    });
    const modelConfidence = buildModelConfidence({
      dataConfidence,
      exerciseRecords
    });
    const tissueState = buildTissueState({
      checkins,
      sessions,
      nowDate: normalizedNowDate
    });
    const { patternScores, patternScoreDetails } = buildPatternScores({
      athleteProfile,
      exerciseRecords,
      nowDate: normalizedNowDate,
      dataConfidence
    });
    const limitingFactors = buildLimitingFactors({
      athleteProfile,
      patternScores,
      tissueState
    });
    const positiveSignals = buildPositiveSignals({
      exerciseRecords,
      patternScores,
      tissueState,
      latestCheckin,
      continuityScore
    });
    const riskFlags = buildRiskFlags({
      dataConfidence,
      continuityScore,
      tissueState,
      latestCheckin,
      sessions,
      nowDate: normalizedNowDate
    });
    const contextConfidence = clamp012(
      dataConfidence * 0.52 + modelConfidence * 0.24 + continuityScore * 0.24
    );
    const sortedSessions = sortByDateDescending(sessions);
    const lastTableSession = sortedSessions.find(isTableSession2) || null;
    return {
      ...createEmptyRealState(normalizedNowDate),
      generatedAt: normalizedNowDate,
      dataConfidence: Number(dataConfidence.toFixed(2)),
      modelConfidence: Number(modelConfidence.toFixed(2)),
      contextConfidence: Number(contextConfidence.toFixed(2)),
      continuityScore: Number(continuityScore.toFixed(2)),
      tissueState,
      patternScores,
      patternScoreDetails,
      exerciseStates: buildExerciseStates({
        exerciseRecords,
        nowDate: normalizedNowDate,
        dataConfidence
      }),
      limitingFactors,
      positiveSignals,
      riskFlags,
      metadata: {
        recordCount: Array.isArray(exerciseRecords) ? exerciseRecords.length : 0,
        checkinCount14d: getRecentWindow(checkins, normalizedNowDate, 14).length,
        sessionCount21d: getRecentWindow(sessions, normalizedNowDate, 21).length,
        tableSessions7d: getRecentWindow(sessions, normalizedNowDate, 7).filter(isTableSession2).length,
        lastCheckinDate: latestCheckin?.date || null,
        lastSessionDate: latestSession?.date || null,
        lastTableDate: lastTableSession?.date || null,
        summary: [
          `Data confidence ${Number(dataConfidence.toFixed(2))}`,
          `Model confidence ${Number(modelConfidence.toFixed(2))}`,
          `Continuity ${Number(continuityScore.toFixed(2))}`,
          `Top limiter ${formatStartCase(limitingFactors[0] || "sin_dato")}`
        ]
      }
    };
  }

  // src/simulation/scenario-library.js
  function getScenarioLibrary() {
    return [
      {
        id: "ideal_progress",
        label: "Progreso Ideal",
        category: "progress",
        description: "Buena continuidad, dolor bajo y respuesta por encima de lo esperado.",
        modifiers: {
          offensiveGainMultiplier: 1.15,
          defensiveGainMultiplier: 1.1,
          tissueRiskMultiplier: 0.82,
          fatigueRiskMultiplier: 0.84,
          continuityDependency: 0.55
        }
      },
      {
        id: "medium_progress",
        label: "Progreso Medio",
        category: "progress",
        description: "Respuesta realista con continuidad suficiente y mejora gradual.",
        modifiers: {
          offensiveGainMultiplier: 1,
          defensiveGainMultiplier: 1,
          tissueRiskMultiplier: 1,
          fatigueRiskMultiplier: 1,
          continuityDependency: 0.62
        }
      },
      {
        id: "slow_progress",
        label: "Progreso Lento",
        category: "progress",
        description: "El bloque suma, pero con adaptacion lenta o poca transferencia inmediata.",
        modifiers: {
          offensiveGainMultiplier: 0.82,
          defensiveGainMultiplier: 0.88,
          tissueRiskMultiplier: 1.08,
          fatigueRiskMultiplier: 1.04,
          continuityDependency: 0.68
        }
      },
      {
        id: "technical_stall",
        label: "Estancamiento Tecnico",
        category: "risk",
        description: "Hay practica pero la ejecucion no se traduce en salida util o transferencia ofensiva.",
        modifiers: {
          offensiveGainMultiplier: 0.7,
          defensiveGainMultiplier: 0.78,
          tissueRiskMultiplier: 0.96,
          fatigueRiskMultiplier: 0.92,
          continuityDependency: 0.58
        }
      },
      {
        id: "fatigue_stall",
        label: "Fatiga Acumulada",
        category: "risk",
        description: "La carga reciente limita adaptacion y obliga a bloquear parte de la progresion.",
        modifiers: {
          offensiveGainMultiplier: 0.62,
          defensiveGainMultiplier: 0.7,
          tissueRiskMultiplier: 1.18,
          fatigueRiskMultiplier: 1.28,
          continuityDependency: 0.66
        }
      },
      {
        id: "medial_pain_rising",
        label: "Dolor Medial Creciente",
        category: "risk",
        description: "El tejido flexor-pronador esta mas irritable y fuerza a rutas mas robustas.",
        modifiers: {
          offensiveGainMultiplier: 0.58,
          defensiveGainMultiplier: 0.72,
          tissueRiskMultiplier: 1.35,
          fatigueRiskMultiplier: 1.1,
          continuityDependency: 0.64
        }
      },
      {
        id: "low_continuity",
        label: "Baja Continuidad",
        category: "context",
        description: "Hay huecos de captura o asistencia que reducen la confianza y la agresividad.",
        modifiers: {
          offensiveGainMultiplier: 0.76,
          defensiveGainMultiplier: 0.82,
          tissueRiskMultiplier: 1.05,
          fatigueRiskMultiplier: 1,
          continuityDependency: 0.9
        }
      },
      {
        id: "high_table_load",
        label: "Alta Carga De Mesa",
        category: "context",
        description: "La exposicion reciente en mesa eleva el costo local y penaliza rutas fragiles.",
        modifiers: {
          offensiveGainMultiplier: 0.88,
          defensiveGainMultiplier: 0.92,
          tissueRiskMultiplier: 1.22,
          fatigueRiskMultiplier: 1.16,
          continuityDependency: 0.72
        }
      },
      {
        id: "low_availability",
        label: "Baja Disponibilidad",
        category: "context",
        description: "Menos tiempo disponible obliga a elegir bloques eficientes y menos complejos.",
        modifiers: {
          offensiveGainMultiplier: 0.74,
          defensiveGainMultiplier: 0.79,
          tissueRiskMultiplier: 0.96,
          fatigueRiskMultiplier: 0.94,
          continuityDependency: 0.86
        }
      },
      {
        id: "finger_limiter",
        label: "Dedos Limitantes",
        category: "structural",
        description: "La contencion y el cierre de dedos limitan la ruta ofensiva o de defensa.",
        modifiers: {
          offensiveGainMultiplier: 0.8,
          defensiveGainMultiplier: 0.86,
          tissueRiskMultiplier: 1.04,
          fatigueRiskMultiplier: 1.06,
          continuityDependency: 0.62
        }
      },
      {
        id: "rising_limiter",
        label: "Rising Limitante",
        category: "structural",
        description: "El cuello de botella principal esta en la salida y elevacion de nudillos.",
        modifiers: {
          offensiveGainMultiplier: 0.83,
          defensiveGainMultiplier: 0.78,
          tissueRiskMultiplier: 1,
          fatigueRiskMultiplier: 1.03,
          continuityDependency: 0.61
        }
      },
      {
        id: "asymmetry_persists",
        label: "Asimetria Persistente",
        category: "structural",
        description: "Sigue habiendo diferencia relevante entre lados y se favorecen rutas de equilibrio.",
        modifiers: {
          offensiveGainMultiplier: 0.84,
          defensiveGainMultiplier: 0.9,
          tissueRiskMultiplier: 1.02,
          fatigueRiskMultiplier: 0.98,
          continuityDependency: 0.63
        }
      },
      {
        id: "finishing_limiter",
        label: "Falta De Finishing",
        category: "structural",
        description: "La entrada existe, pero la conversion final sigue siendo el cuello de botella.",
        modifiers: {
          offensiveGainMultiplier: 0.86,
          defensiveGainMultiplier: 0.84,
          tissueRiskMultiplier: 1.01,
          fatigueRiskMultiplier: 1.02,
          continuityDependency: 0.6
        }
      }
    ];
  }

  // src/simulation/block-definitions.js
  function getBlockDefinitions() {
    return [
      {
        blockId: "base_structural",
        label: "Base Estructural",
        durationWeeks: 4,
        primaryGoal: "Construir base estructural y fuerza util con bajo costo local.",
        emphasis: {
          rising: 0.08,
          pronation: 0.12,
          fingers: 0.06,
          cupping: 0.08,
          backPressure: 0.12,
          sidePressure: 0.05,
          hookDefense: 0.06,
          topRollOffense: 0.08,
          finishing: 0.05,
          generalStrength: 0.2,
          tissueTolerance: 0.1
        },
        riskProfile: {
          tissueRisk: 0.24,
          fatigueRisk: 0.32,
          continuityDependency: 0.52
        },
        improves: ["generalStrength", "backPressure", "tissueTolerance"],
        entryCriteria: ["data_confidence_min_0_35"],
        exitCriteria: ["mejora_base_util", "sin_irritabilidad_creciente"]
      },
      {
        blockId: "rising_pronation",
        label: "Rising Y Pronacion",
        durationWeeks: 4,
        primaryGoal: "Elevar salida ofensiva y control de mano para toproll.",
        emphasis: {
          rising: 0.22,
          pronation: 0.22,
          fingers: 0.08,
          cupping: 0.04,
          backPressure: 0.14,
          sidePressure: 0.02,
          hookDefense: 0.02,
          topRollOffense: 0.18,
          finishing: 0.03,
          generalStrength: 0.03,
          tissueTolerance: 0.02
        },
        riskProfile: {
          tissueRisk: 0.38,
          fatigueRisk: 0.36,
          continuityDependency: 0.66
        },
        improves: ["rising", "pronation", "topRollOffense"],
        entryCriteria: ["medial_pain_below_4", "forearm_fatigue_below_7"],
        exitCriteria: ["salida_mejora", "pronacion_transferible"]
      },
      {
        blockId: "fingers_containment",
        label: "Dedos Y Containment",
        durationWeeks: 4,
        primaryGoal: "Mejorar contencion, dedos y control fino bajo agarre real.",
        emphasis: {
          rising: 0.04,
          pronation: 0.08,
          fingers: 0.22,
          cupping: 0.12,
          backPressure: 0.06,
          sidePressure: 0.03,
          hookDefense: 0.17,
          topRollOffense: 0.08,
          finishing: 0.04,
          generalStrength: 0.04,
          tissueTolerance: 0.12
        },
        riskProfile: {
          tissueRisk: 0.42,
          fatigueRisk: 0.33,
          continuityDependency: 0.64
        },
        improves: ["fingers", "hookDefense", "cupping"],
        entryCriteria: ["tissue_irritability_below_5_5"],
        exitCriteria: ["containment_mejora", "agarre_mas_estable"]
      },
      {
        blockId: "side_finishing",
        label: "Side Pressure Y Finishing",
        durationWeeks: 4,
        primaryGoal: "Mejorar cierre ofensivo y capacidad de convertir ventaja en finish.",
        emphasis: {
          rising: 0.02,
          pronation: 0.04,
          fingers: 0.04,
          cupping: 0.06,
          backPressure: 0.08,
          sidePressure: 0.24,
          hookDefense: 0.05,
          topRollOffense: 0.04,
          finishing: 0.23,
          generalStrength: 0.08,
          tissueTolerance: 0.12
        },
        riskProfile: {
          tissueRisk: 0.5,
          fatigueRisk: 0.41,
          continuityDependency: 0.62
        },
        improves: ["sidePressure", "finishing"],
        entryCriteria: ["medial_pain_below_3_5"],
        exitCriteria: ["finish_mas_consistente", "sin_spike_de_dolor"]
      },
      {
        blockId: "tissue_tolerance",
        label: "Tolerancia De Tejido",
        durationWeeks: 4,
        primaryGoal: "Bajar irritabilidad y reconstruir tolerancia local sin perder demasiada funcion.",
        emphasis: {
          rising: 0.03,
          pronation: 0.04,
          fingers: 0.08,
          cupping: 0.06,
          backPressure: 0.04,
          sidePressure: 0.02,
          hookDefense: 0.05,
          topRollOffense: 0.02,
          finishing: 0.02,
          generalStrength: 0.08,
          tissueTolerance: 0.56
        },
        riskProfile: {
          tissueRisk: 0.12,
          fatigueRisk: 0.14,
          continuityDependency: 0.48
        },
        improves: ["tissueTolerance", "hookDefense"],
        entryCriteria: ["medial_pain_above_3_or_low_continuity"],
        exitCriteria: ["dolor_baja", "tejido_responde_mejor"]
      },
      {
        blockId: "table_transfer",
        label: "Transferencia A Mesa",
        durationWeeks: 4,
        primaryGoal: "Convertir ganancias estructurales en salidas y decisiones utiles en mesa.",
        emphasis: {
          rising: 0.12,
          pronation: 0.14,
          fingers: 0.08,
          cupping: 0.08,
          backPressure: 0.12,
          sidePressure: 0.08,
          hookDefense: 0.08,
          topRollOffense: 0.16,
          finishing: 0.08,
          generalStrength: 0.03,
          tissueTolerance: 0.03
        },
        riskProfile: {
          tissueRisk: 0.44,
          fatigueRisk: 0.39,
          continuityDependency: 0.74
        },
        improves: ["topRollOffense", "hookDefense", "finishing"],
        entryCriteria: ["context_confidence_min_0_45", "medial_pain_below_4"],
        exitCriteria: ["mejor_transferencia", "mesa_sin_spike"]
      },
      {
        blockId: "peak_competition",
        label: "Peak Competitivo",
        durationWeeks: 4,
        primaryGoal: "Afinar salida especifica y readiness competitivo cerca de evento.",
        emphasis: {
          rising: 0.14,
          pronation: 0.14,
          fingers: 0.08,
          cupping: 0.06,
          backPressure: 0.12,
          sidePressure: 0.08,
          hookDefense: 0.06,
          topRollOffense: 0.16,
          finishing: 0.11,
          generalStrength: 0.02,
          tissueTolerance: 0.03
        },
        riskProfile: {
          tissueRisk: 0.48,
          fatigueRisk: 0.43,
          continuityDependency: 0.8
        },
        improves: ["topRollOffense", "finishing", "rising"],
        entryCriteria: ["context_confidence_min_0_55", "continuity_score_min_0_5"],
        exitCriteria: ["readiness_competitiva", "sin_colapso_tisular"]
      }
    ];
  }
  function getBlockDefinitionById(blockId) {
    return getBlockDefinitions().find((block) => block.blockId === blockId) || null;
  }

  // src/simulation/block-simulator.js
  var OFFENSIVE_KEYS = /* @__PURE__ */ new Set(["rising", "pronation", "backPressure", "sidePressure", "topRollOffense", "finishing"]);
  var DEFENSIVE_KEYS = /* @__PURE__ */ new Set(["fingers", "cupping", "hookDefense", "tissueTolerance"]);
  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function clampRange(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, Number(value) || 0));
  }
  function average3(values = []) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    return values.reduce((total, value) => total + safeNumber(value, 0), 0) / values.length;
  }
  function evaluateCriterion(realState, criterion) {
    switch (criterion) {
      case "data_confidence_min_0_35":
        return realState.dataConfidence >= 0.35;
      case "context_confidence_min_0_45":
        return realState.contextConfidence >= 0.45;
      case "context_confidence_min_0_55":
        return realState.contextConfidence >= 0.55;
      case "continuity_score_min_0_5":
        return realState.continuityScore >= 0.5;
      case "medial_pain_below_4":
        return safeNumber(realState.tissueState?.medialPain, 0) < 4;
      case "medial_pain_below_3_5":
        return safeNumber(realState.tissueState?.medialPain, 0) < 3.5;
      case "forearm_fatigue_below_7":
        return safeNumber(realState.tissueState?.forearmFatigue, 0) < 7;
      case "tissue_irritability_below_5_5":
        return safeNumber(realState.tissueState?.tissueIrritability, 0) < 5.5;
      case "medial_pain_above_3_or_low_continuity":
        return safeNumber(realState.tissueState?.medialPain, 0) >= 3 || realState.continuityScore < 0.45;
      default:
        return true;
    }
  }
  function describeCriterion(criterion) {
    switch (criterion) {
      case "data_confidence_min_0_35":
        return "Data confidence insuficiente";
      case "context_confidence_min_0_45":
        return "Context confidence todavia baja";
      case "context_confidence_min_0_55":
        return "Context confidence todavia baja para peak";
      case "continuity_score_min_0_5":
        return "Continuidad insuficiente";
      case "medial_pain_below_4":
        return "Dolor medial por encima del umbral";
      case "medial_pain_below_3_5":
        return "Dolor medial demasiado alto para side pressure";
      case "forearm_fatigue_below_7":
        return "Fatiga de antebrazo demasiado alta";
      case "tissue_irritability_below_5_5":
        return "Irritabilidad tisular demasiado alta";
      case "medial_pain_above_3_or_low_continuity":
        return "Todavia no hay indicacion fuerte para bloque de tejido";
      default:
        return formatStartCase(criterion);
    }
  }
  function buildEntryAssessment(realState, blockDefinition) {
    const criteria = Array.isArray(blockDefinition?.entryCriteria) ? blockDefinition.entryCriteria : [];
    const blockers = criteria.filter((criterion) => !evaluateCriterion(realState, criterion)).map(describeCriterion);
    const readinessScore = criteria.length === 0 ? 1 : clamp012((criteria.length - blockers.length) / criteria.length);
    return {
      criteria,
      blockers,
      satisfied: blockers.length === 0,
      readinessScore
    };
  }
  function getScoreCategoryMultiplier(scoreKey, scenario) {
    if (OFFENSIVE_KEYS.has(scoreKey)) {
      return safeNumber(scenario?.modifiers?.offensiveGainMultiplier, 1);
    }
    if (DEFENSIVE_KEYS.has(scoreKey)) {
      return safeNumber(scenario?.modifiers?.defensiveGainMultiplier, 1);
    }
    return average3([
      safeNumber(scenario?.modifiers?.offensiveGainMultiplier, 1),
      safeNumber(scenario?.modifiers?.defensiveGainMultiplier, 1)
    ]);
  }
  function buildPatternScoreDelta(scoreKey, realState, blockDefinition, scenario, entryAssessment) {
    const emphasis = safeNumber(blockDefinition?.emphasis?.[scoreKey], 0);
    if (emphasis <= 0) {
      return 0;
    }
    const currentScore = safeNumber(realState.patternScores?.[scoreKey], 0);
    const need = 1 - currentScore;
    const limiterBoost = realState.limitingFactors?.includes(scoreKey) ? 1.16 : 1;
    const confidenceDampener = 0.55 + safeNumber(realState.contextConfidence, 0) * 0.45;
    const entryDampener = 0.55 + entryAssessment.readinessScore * 0.45;
    const categoryMultiplier = getScoreCategoryMultiplier(scoreKey, scenario);
    const diminishingReturns = currentScore >= 0.8 ? 0.55 : currentScore >= 0.65 ? 0.78 : 1;
    const baseGain = emphasis * (0.18 + need * 0.45);
    return Number(
      clampRange(
        baseGain * limiterBoost * confidenceDampener * entryDampener * categoryMultiplier * diminishingReturns,
        0,
        0.16
      ).toFixed(3)
    );
  }
  function buildPatternScoreDeltas(realState, blockDefinition, scenario, entryAssessment) {
    const deltas = createEmptyPatternScores();
    REAL_STATE_PATTERN_KEYS.forEach((scoreKey) => {
      deltas[scoreKey] = buildPatternScoreDelta(scoreKey, realState, blockDefinition, scenario, entryAssessment);
    });
    return deltas;
  }
  function buildTissueStateDelta(realState, blockDefinition, scenario) {
    const tissue = realState.tissueState || {};
    const emphasis = blockDefinition.emphasis || {};
    const riskProfile = blockDefinition.riskProfile || {};
    const tissueRiskBase = safeNumber(riskProfile.tissueRisk, 0) * safeNumber(scenario?.modifiers?.tissueRiskMultiplier, 1);
    const fatigueRiskBase = safeNumber(riskProfile.fatigueRisk, 0) * safeNumber(scenario?.modifiers?.fatigueRiskMultiplier, 1);
    const localLoadFocus = safeNumber(emphasis.rising, 0) + safeNumber(emphasis.pronation, 0) + safeNumber(emphasis.fingers, 0) + safeNumber(emphasis.cupping, 0) + safeNumber(emphasis.backPressure, 0) + safeNumber(emphasis.sidePressure, 0);
    const strengthLoadFocus = safeNumber(emphasis.generalStrength, 0) + safeNumber(emphasis.backPressure, 0);
    const offensiveLoadFocus = safeNumber(emphasis.topRollOffense, 0) + safeNumber(emphasis.finishing, 0) + safeNumber(emphasis.sidePressure, 0);
    const recoveryFocus = safeNumber(emphasis.tissueTolerance, 0);
    const irritability = safeNumber(tissue.tissueIrritability, 0) / 10;
    const medialPainDelta = clampRange(
      tissueRiskBase * (0.72 + localLoadFocus) + irritability * 0.6 - recoveryFocus * 0.7 - safeNumber(realState.patternScores?.tissueTolerance, 0) * 0.1,
      -1.4,
      1.35
    );
    const lateralPainDelta = clampRange(medialPainDelta * 0.42 + tissueRiskBase * 0.08, -0.8, 0.85);
    const forearmFatigueDelta = clampRange(
      fatigueRiskBase * (0.68 + localLoadFocus) + irritability * 0.25 - recoveryFocus * 0.18,
      -0.6,
      2.3
    );
    const sncFatigueDelta = clampRange(
      fatigueRiskBase * (0.65 + strengthLoadFocus + offensiveLoadFocus * 0.28) - recoveryFocus * 0.1,
      -0.4,
      1.8
    );
    const backFatigueDelta = clampRange(
      fatigueRiskBase * (0.24 + safeNumber(emphasis.generalStrength, 0) * 1.15 + safeNumber(emphasis.backPressure, 0) * 0.35),
      -0.2,
      1.25
    );
    const legsFatigueDelta = clampRange(safeNumber(emphasis.generalStrength, 0) * 0.9, 0, 0.8);
    const globalFatigueDelta = clampRange(average3([forearmFatigueDelta, sncFatigueDelta, backFatigueDelta]) * 0.86, -0.3, 1.75);
    const tissueIrritabilityDelta = clampRange(
      average3([
        medialPainDelta,
        forearmFatigueDelta * 0.35,
        tissueRiskBase * 0.8 - recoveryFocus * 0.4
      ]),
      -0.8,
      1.15
    );
    const tableLoad7dDelta = blockDefinition.blockId === "table_transfer" ? 0.45 : blockDefinition.blockId === "peak_competition" ? 0.55 : blockDefinition.blockId === "tissue_tolerance" ? -0.18 : 0;
    return {
      ...createEmptyTissueState(),
      medialPain: Number(medialPainDelta.toFixed(2)),
      lateralPain: Number(lateralPainDelta.toFixed(2)),
      forearmFatigue: Number(forearmFatigueDelta.toFixed(2)),
      sncFatigue: Number(sncFatigueDelta.toFixed(2)),
      backFatigue: Number(backFatigueDelta.toFixed(2)),
      globalFatigue: Number(globalFatigueDelta.toFixed(2)),
      legsFatigue: Number(legsFatigueDelta.toFixed(2)),
      tissueIrritability: Number(tissueIrritabilityDelta.toFixed(2)),
      tableLoad7d: Number(tableLoad7dDelta.toFixed(2))
    };
  }
  function buildContinuityImpact(realState, blockDefinition, scenario) {
    const continuityDependency = safeNumber(blockDefinition?.riskProfile?.continuityDependency, 0) * safeNumber(scenario?.modifiers?.continuityDependency, 1);
    const recoveryFocus = safeNumber(blockDefinition?.emphasis?.tissueTolerance, 0);
    const robustnessBonus = recoveryFocus * 0.05 + (blockDefinition?.blockId === "base_structural" ? 0.02 : 0);
    const complexityPenalty = continuityDependency * 0.06;
    const continuityPenalty = (1 - safeNumber(realState.continuityScore, 0)) * continuityDependency * 0.04;
    return Number(clampRange(robustnessBonus - complexityPenalty - continuityPenalty, -0.12, 0.04).toFixed(3));
  }
  function sumSelected(deltas, keys) {
    return keys.reduce((total, key) => total + safeNumber(deltas?.[key], 0), 0);
  }
  function buildExpectedRisks(patternScoreDeltas, tissueStateDelta, continuityImpact, entryAssessment) {
    const risks = [];
    if (entryAssessment.blockers.length > 0) {
      risks.push("entry_criteria_not_clean");
    }
    if (safeNumber(tissueStateDelta.medialPain, 0) >= 0.45) {
      risks.push("medial_pain_may_rise");
    }
    if (safeNumber(tissueStateDelta.forearmFatigue, 0) >= 0.8) {
      risks.push("forearm_fatigue_may_accumulate");
    }
    if (safeNumber(tissueStateDelta.sncFatigue, 0) >= 0.75) {
      risks.push("systemic_fatigue_may_rise");
    }
    if (continuityImpact <= -0.055) {
      risks.push("high_continuity_dependency");
    }
    if (sumSelected(patternScoreDeltas, ["sidePressure", "finishing"]) >= 0.12 && safeNumber(tissueStateDelta.medialPain, 0) > 0.2) {
      risks.push("finish_block_cost_is_meaningful");
    }
    return risks;
  }
  function buildTopDeltaLabel(patternScoreDeltas) {
    return Object.entries(patternScoreDeltas || {}).sort((left, right) => safeNumber(right[1], 0) - safeNumber(left[1], 0))[0]?.[0] || "sin_dato";
  }
  function buildSummary(blockDefinition, scenario, predictedEffects, expectedRisks) {
    const topDelta = buildTopDeltaLabel(predictedEffects.patternScoresDelta);
    const riskNote = expectedRisks.length > 0 ? `Riesgo principal: ${formatStartCase(expectedRisks[0])}.` : "Sin riesgo dominante previsto.";
    return `${blockDefinition.label}: mejora probable en ${formatStartCase(topDelta)} con escenario ${scenario.label}. ${riskNote}`;
  }
  function buildModelStabilityImpact(realState, predictedEffects, confidence) {
    return Number(clampRange(
      confidence * 0.08 - safeNumber(predictedEffects.tissueRisk, 0) * 0.05 - Math.abs(safeNumber(predictedEffects.continuityImpact, 0)) * 0.2,
      -0.08,
      0.06
    ).toFixed(3));
  }
  function deriveLimitingFactors(patternScores, tissueState) {
    return Object.entries(patternScores || {}).map(([key, value]) => {
      const urgency = key === "tissueTolerance" ? clamp012((1 - safeNumber(value, 0)) * 0.7 + safeNumber(tissueState?.tissueIrritability, 0) / 10 * 0.3) : 1 - safeNumber(value, 0);
      return {
        key,
        urgency
      };
    }).sort((left, right) => right.urgency - left.urgency).slice(0, 4).map((item) => item.key);
  }
  function derivePositiveSignals(patternScores, tissueState, continuityScore) {
    const signals = [];
    if (safeNumber(patternScores?.backPressure, 0) >= 0.65) {
      signals.push("back_pressure_positive");
    }
    if (safeNumber(patternScores?.pronation, 0) >= 0.65) {
      signals.push("pronation_positive");
    }
    if (safeNumber(patternScores?.tissueTolerance, 0) >= 0.6 && safeNumber(tissueState?.tissueIrritability, 0) <= 4) {
      signals.push("tissue_tolerance_stable");
    }
    if (safeNumber(continuityScore, 0) >= 0.6) {
      signals.push("continuity_stable");
    }
    return signals;
  }
  function deriveRiskFlags(dataConfidence, continuityScore, tissueState) {
    const flags = [];
    if (safeNumber(dataConfidence, 0) < 0.4) {
      flags.push("low_data_density");
    }
    if (safeNumber(continuityScore, 0) < 0.35) {
      flags.push("low_session_continuity");
    }
    if (safeNumber(tissueState?.medialPain, 0) >= 4) {
      flags.push("medial_pain_active");
    }
    if (safeNumber(tissueState?.forearmFatigue, 0) >= 7) {
      flags.push("forearm_fatigue_high");
    }
    if (safeNumber(tissueState?.tissueIrritability, 0) >= 5.5) {
      flags.push("tissue_irritability_rising");
    }
    if (safeNumber(tissueState?.tableLoad7d, 0) >= 2.2) {
      flags.push("high_recent_table_load");
    }
    return flags;
  }
  function simulateBlock({
    realState,
    blockDefinition,
    scenario,
    startWeekIndex
  }) {
    const entryAssessment = buildEntryAssessment(realState, blockDefinition);
    const patternScoresDelta = buildPatternScoreDeltas(realState, blockDefinition, scenario, entryAssessment);
    const tissueStateDelta = buildTissueStateDelta(realState, blockDefinition, scenario);
    const continuityImpact = buildContinuityImpact(realState, blockDefinition, scenario);
    const offensiveImprovement = Number(sumSelected(patternScoresDelta, [...OFFENSIVE_KEYS]).toFixed(3));
    const defensiveImprovement = Number(sumSelected(patternScoresDelta, [...DEFENSIVE_KEYS]).toFixed(3));
    const generalStrengthImprovement = Number(sumSelected(patternScoresDelta, ["generalStrength"]).toFixed(3));
    const tissueToleranceImprovement = Number(sumSelected(patternScoresDelta, ["tissueTolerance"]).toFixed(3));
    const tissueRisk = Number(clamp012(
      safeNumber(blockDefinition?.riskProfile?.tissueRisk, 0) * safeNumber(scenario?.modifiers?.tissueRiskMultiplier, 1)
    ).toFixed(3));
    const fatigueRisk = Number(clamp012(
      safeNumber(blockDefinition?.riskProfile?.fatigueRisk, 0) * safeNumber(scenario?.modifiers?.fatigueRiskMultiplier, 1)
    ).toFixed(3));
    const continuityDependency = Number(clamp012(
      safeNumber(blockDefinition?.riskProfile?.continuityDependency, 0) * safeNumber(scenario?.modifiers?.continuityDependency, 1)
    ).toFixed(3));
    const confidence = Number(clamp012(
      safeNumber(realState?.contextConfidence, 0) * 0.42 + safeNumber(realState?.modelConfidence, 0) * 0.26 + entryAssessment.readinessScore * 0.18 + (1 - tissueRisk) * 0.14
    ).toFixed(3));
    const predictedEffects = {
      patternScoresDelta,
      tissueStateDelta,
      continuityImpact,
      offensiveImprovement,
      defensiveImprovement,
      generalStrengthImprovement,
      tissueToleranceImprovement,
      tissueRisk,
      fatigueRisk,
      continuityDependency
    };
    predictedEffects.modelStabilityImpact = buildModelStabilityImpact(realState, predictedEffects, confidence);
    const expectedRisks = buildExpectedRisks(patternScoresDelta, tissueStateDelta, continuityImpact, entryAssessment);
    return {
      blockId: blockDefinition.blockId,
      blockLabel: blockDefinition.label,
      scenarioId: scenario.id,
      scenarioLabel: scenario.label,
      startWeekIndex,
      endWeekIndex: startWeekIndex + safeNumber(blockDefinition.durationWeeks, 4) - 1,
      entryAssessment,
      predictedEffects,
      expectedRisks,
      confidence,
      summary: buildSummary(blockDefinition, scenario, predictedEffects, expectedRisks)
    };
  }
  function applyPredictedEffects(realState, blockResult) {
    const nextState = cloneJson(realState);
    const predictedEffects = blockResult?.predictedEffects || {};
    const nextPatternScores = cloneJson(realState?.patternScores || {});
    const nextTissueState = cloneJson(realState?.tissueState || {});
    REAL_STATE_PATTERN_KEYS.forEach((scoreKey) => {
      nextPatternScores[scoreKey] = Number(clamp012(
        safeNumber(realState?.patternScores?.[scoreKey], 0) + safeNumber(predictedEffects?.patternScoresDelta?.[scoreKey], 0)
      ).toFixed(3));
      if (nextState.patternScoreDetails?.[scoreKey]) {
        nextState.patternScoreDetails[scoreKey].final = nextPatternScores[scoreKey];
        nextState.patternScoreDetails[scoreKey].confidence = Number(clamp012(
          safeNumber(nextState.patternScoreDetails[scoreKey].confidence, 0) * 0.88 + safeNumber(blockResult?.confidence, 0) * 0.12
        ).toFixed(3));
      }
    });
    Object.keys(nextTissueState).forEach((key) => {
      nextTissueState[key] = Number(clampRange(
        safeNumber(realState?.tissueState?.[key], 0) + safeNumber(predictedEffects?.tissueStateDelta?.[key], 0),
        0,
        10
      ).toFixed(2));
    });
    const nextContinuityScore = Number(clamp012(
      safeNumber(realState?.continuityScore, 0) + safeNumber(predictedEffects?.continuityImpact, 0)
    ).toFixed(3));
    const nextDataConfidence = Number(clamp012(
      safeNumber(realState?.dataConfidence, 0) - 0.015 + Math.max(safeNumber(predictedEffects?.continuityImpact, 0), 0) * 0.12
    ).toFixed(3));
    const nextModelConfidence = Number(clamp012(
      safeNumber(realState?.modelConfidence, 0) * 0.94 + safeNumber(blockResult?.confidence, 0) * 0.06 + safeNumber(predictedEffects?.modelStabilityImpact, 0)
    ).toFixed(3));
    const nextContextConfidence = Number(clamp012(
      nextDataConfidence * 0.46 + nextModelConfidence * 0.32 + nextContinuityScore * 0.22
    ).toFixed(3));
    const nextRiskFlags = deriveRiskFlags(nextDataConfidence, nextContinuityScore, nextTissueState);
    const nextPositiveSignals = derivePositiveSignals(nextPatternScores, nextTissueState, nextContinuityScore);
    nextState.patternScores = nextPatternScores;
    nextState.tissueState = nextTissueState;
    nextState.continuityScore = nextContinuityScore;
    nextState.dataConfidence = nextDataConfidence;
    nextState.modelConfidence = nextModelConfidence;
    nextState.contextConfidence = nextContextConfidence;
    nextState.limitingFactors = deriveLimitingFactors(nextPatternScores, nextTissueState);
    nextState.positiveSignals = nextPositiveSignals;
    nextState.riskFlags = nextRiskFlags;
    nextState.metadata = {
      ...nextState.metadata || {},
      simulatedBlockCount: safeNumber(realState?.metadata?.simulatedBlockCount, 0) + 1,
      lastSimulatedBlockId: blockResult?.blockId || null,
      lastScenarioId: blockResult?.scenarioId || null,
      lastEndWeekIndex: blockResult?.endWeekIndex || null
    };
    return nextState;
  }

  // src/simulation/route-planner.js
  function cloneJson2(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function getScenarioById(scenarios, scenarioId) {
    return scenarios.find((scenario) => scenario.id === scenarioId) || scenarios.find((scenario) => scenario.id === "medium_progress") || scenarios[0];
  }
  function buildRouteTemplates() {
    return [
      {
        templateId: "route_balanced_offense",
        label: "Ruta Balanceada Ofensiva",
        blockIds: ["base_structural", "rising_pronation", "fingers_containment", "table_transfer", "side_finishing", "peak_competition"]
      },
      {
        templateId: "route_tissue_first",
        label: "Ruta Robusta De Tejido",
        blockIds: ["tissue_tolerance", "base_structural", "rising_pronation", "fingers_containment", "table_transfer", "peak_competition"]
      },
      {
        templateId: "route_finish_bias",
        label: "Ruta Con Bias A Finishing",
        blockIds: ["base_structural", "rising_pronation", "side_finishing", "fingers_containment", "table_transfer", "peak_competition"]
      },
      {
        templateId: "route_containment_first",
        label: "Ruta De Containment Primero",
        blockIds: ["base_structural", "fingers_containment", "rising_pronation", "table_transfer", "side_finishing", "peak_competition"]
      }
    ];
  }
  function hasAsymmetry(realState) {
    const grouped = Object.values(realState?.exerciseStates || {}).reduce((map, exerciseState) => {
      const name = String(exerciseState.exerciseName || "").trim();
      if (!name) {
        return map;
      }
      if (!map[name]) {
        map[name] = {};
      }
      map[name][exerciseState.side] = exerciseState;
      return map;
    }, {});
    return Object.values(grouped).some((group) => {
      if (!group.left || !group.right) {
        return false;
      }
      const leftValue = safeNumber(group.left.currentRmKg, 0);
      const rightValue = safeNumber(group.right.currentRmKg, 0);
      const maxValue = Math.max(leftValue, rightValue, 1);
      return Math.abs(rightValue - leftValue) / maxValue >= 0.1;
    });
  }
  function selectScenarioForBlock(currentState, blockDefinition, scenarioLibrary = getScenarioLibrary()) {
    const tissue = currentState?.tissueState || {};
    const riskFlags = currentState?.riskFlags || [];
    const limitingFactors = currentState?.limitingFactors || [];
    const hasSideAsymmetry = hasAsymmetry(currentState);
    const getScenario = (scenarioId) => getScenarioById(scenarioLibrary, scenarioId);
    if (safeNumber(tissue.medialPain, 0) >= 4 || safeNumber(tissue.tissueIrritability, 0) >= 5.5) {
      return getScenario("medial_pain_rising");
    }
    if (riskFlags.includes("low_session_continuity") || safeNumber(currentState?.continuityScore, 0) < 0.35) {
      return getScenario("low_continuity");
    }
    if (riskFlags.includes("low_availability")) {
      return getScenario("low_availability");
    }
    if (riskFlags.includes("high_recent_table_load") && blockDefinition?.blockId !== "tissue_tolerance") {
      return getScenario("high_table_load");
    }
    if (riskFlags.includes("forearm_fatigue_high") || safeNumber(tissue.globalFatigue, 0) >= 7) {
      return getScenario("fatigue_stall");
    }
    if (hasSideAsymmetry && (safeNumber(blockDefinition?.emphasis?.sidePressure, 0) >= 0.12 || safeNumber(blockDefinition?.emphasis?.fingers, 0) >= 0.12)) {
      return getScenario("asymmetry_persists");
    }
    if (limitingFactors.includes("fingers") && safeNumber(blockDefinition?.emphasis?.fingers, 0) >= 0.15) {
      return getScenario("finger_limiter");
    }
    if (limitingFactors.includes("rising") && safeNumber(blockDefinition?.emphasis?.rising, 0) >= 0.15) {
      return getScenario("rising_limiter");
    }
    if (limitingFactors.includes("finishing") && safeNumber(blockDefinition?.emphasis?.finishing, 0) >= 0.15) {
      return getScenario("finishing_limiter");
    }
    if (safeNumber(currentState?.contextConfidence, 0) >= 0.65 && safeNumber(tissue.medialPain, 0) <= 2.5 && safeNumber(currentState?.continuityScore, 0) >= 0.6) {
      return getScenario("ideal_progress");
    }
    if (safeNumber(currentState?.contextConfidence, 0) < 0.35) {
      return getScenario("slow_progress");
    }
    return getScenario("medium_progress");
  }
  function buildBlocksById(blockDefinitions) {
    return blockDefinitions.reduce((map, block) => {
      map[block.blockId] = block;
      return map;
    }, {});
  }
  function summarizeRoute(finalState, simulatedBlocks, routeTemplate) {
    const totalOffensiveGain = simulatedBlocks.reduce((total, block) => total + safeNumber(block?.predictedEffects?.offensiveImprovement, 0), 0);
    const totalDefensiveGain = simulatedBlocks.reduce((total, block) => total + safeNumber(block?.predictedEffects?.defensiveImprovement, 0), 0);
    const totalGeneralStrengthGain = simulatedBlocks.reduce((total, block) => total + safeNumber(block?.predictedEffects?.generalStrengthImprovement, 0), 0);
    const totalTissueToleranceGain = simulatedBlocks.reduce((total, block) => total + safeNumber(block?.predictedEffects?.tissueToleranceImprovement, 0), 0);
    const averageTissueRisk = average4(simulatedBlocks.map((block) => safeNumber(block?.predictedEffects?.tissueRisk, 0)));
    const averageFatigueRisk = average4(simulatedBlocks.map((block) => safeNumber(block?.predictedEffects?.fatigueRisk, 0)));
    const averageBlockConfidence = average4(simulatedBlocks.map((block) => safeNumber(block?.confidence, 0)));
    const continuityOutcome = safeNumber(finalState?.continuityScore, 0);
    const routeRobustness = Number(clamp012(
      averageBlockConfidence * 0.42 + (1 - averageTissueRisk) * 0.24 + (1 - averageFatigueRisk) * 0.14 + continuityOutcome * 0.2
    ).toFixed(3));
    const weakestPredictedFactors = Object.entries(finalState?.patternScores || {}).sort((left, right) => safeNumber(left[1], 0) - safeNumber(right[1], 0)).slice(0, 3).map(([key]) => key);
    return {
      routeLabel: routeTemplate.label,
      totalOffensiveGain: Number(totalOffensiveGain.toFixed(3)),
      totalDefensiveGain: Number(totalDefensiveGain.toFixed(3)),
      totalGeneralStrengthGain: Number(totalGeneralStrengthGain.toFixed(3)),
      totalTissueToleranceGain: Number(totalTissueToleranceGain.toFixed(3)),
      averageTissueRisk: Number(averageTissueRisk.toFixed(3)),
      averageFatigueRisk: Number(averageFatigueRisk.toFixed(3)),
      averageBlockConfidence: Number(averageBlockConfidence.toFixed(3)),
      continuityOutcome: Number(continuityOutcome.toFixed(3)),
      contextConfidenceOutcome: Number(safeNumber(finalState?.contextConfidence, 0).toFixed(3)),
      routeRobustness,
      weakestPredictedFactors,
      summary: `${routeTemplate.label}: ofensiva ${Number(totalOffensiveGain.toFixed(2))}, defensa ${Number(totalDefensiveGain.toFixed(2))}, robustez ${routeRobustness}.`
    };
  }
  function average4(values = []) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    return values.reduce((total, value) => total + safeNumber(value, 0), 0) / values.length;
  }
  function buildCandidateRoutes({
    realState,
    blockDefinitions = getBlockDefinitions(),
    scenarioLibrary = getScenarioLibrary(),
    horizonWeeks = 24
  }) {
    const weeksPerBlock = 4;
    const targetBlockCount = Math.max(1, Math.ceil(horizonWeeks / weeksPerBlock));
    const blocksById = buildBlocksById(blockDefinitions);
    const routeTemplates = buildRouteTemplates();
    return routeTemplates.map((routeTemplate, routeIndex) => {
      let currentState = cloneJson2(realState);
      let weekIndex = 1;
      const simulatedBlocks = [];
      const scenarioMix = [];
      routeTemplate.blockIds.slice(0, targetBlockCount).forEach((blockId) => {
        const blockDefinition = blocksById[blockId];
        if (!blockDefinition) {
          return;
        }
        const scenario = selectScenarioForBlock(currentState, blockDefinition, scenarioLibrary);
        const blockResult = simulateBlock({
          realState: currentState,
          blockDefinition,
          scenario,
          startWeekIndex: weekIndex
        });
        simulatedBlocks.push(blockResult);
        scenarioMix.push({
          blockId: blockDefinition.blockId,
          blockLabel: blockDefinition.label,
          scenarioId: scenario.id,
          scenarioLabel: scenario.label
        });
        currentState = applyPredictedEffects(currentState, blockResult);
        weekIndex += safeNumber(blockDefinition.durationWeeks, 4);
      });
      return {
        routeId: `route_${routeIndex + 1}`,
        templateId: routeTemplate.templateId,
        label: routeTemplate.label,
        blocks: simulatedBlocks,
        scenarioMix,
        finalState: currentState,
        predictedSummary: summarizeRoute(currentState, simulatedBlocks, routeTemplate),
        routeNotes: [
          `Primera debilidad prevista: ${formatStartCase(currentState?.limitingFactors?.[0] || "sin_dato")}`,
          `Escenario inicial: ${scenarioMix[0]?.scenarioLabel || "Sin dato"}`
        ]
      };
    });
  }

  // src/simulation/route-scorer.js
  var ROUTE_SCORE_WEIGHTS = {
    transferToTable: 0.3,
    offensiveImprovement: 0.25,
    tissueSustainability: 0.15,
    finishingImprovement: 0.1,
    continuityRobustness: 0.1,
    modelStability: 0.1
  };
  function average5(values = []) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    return values.reduce((total, value) => total + safeNumber(value, 0), 0) / values.length;
  }
  function buildRouteMetrics(route) {
    const routeSummary = route?.predictedSummary || {};
    const finalState = route?.finalState || {};
    const blocks = Array.isArray(route?.blocks) ? route.blocks : [];
    const averageTissueRisk = safeNumber(routeSummary.averageTissueRisk, 0);
    const averageFatigueRisk = safeNumber(routeSummary.averageFatigueRisk, 0);
    const averageBlockConfidence = safeNumber(routeSummary.averageBlockConfidence, 0);
    const averageContinuityDependency = average5(
      blocks.map((block) => safeNumber(block?.predictedEffects?.continuityDependency, 0))
    );
    const finalPatternScores = finalState.patternScores || {};
    const finalTissueState = finalState.tissueState || {};
    return {
      routeSummary,
      finalState,
      blocks,
      averageTissueRisk,
      averageFatigueRisk,
      averageBlockConfidence,
      averageContinuityDependency,
      finalPatternScores,
      finalTissueState
    };
  }
  function computeScoreBreakdown(route) {
    const metrics = buildRouteMetrics(route);
    const transferToTable = clamp012(
      safeNumber(metrics.finalPatternScores.topRollOffense, 0) * 0.38 + safeNumber(metrics.finalPatternScores.backPressure, 0) * 0.16 + safeNumber(metrics.finalPatternScores.pronation, 0) * 0.12 + safeNumber(metrics.finalPatternScores.hookDefense, 0) * 0.12 + safeNumber(metrics.routeSummary.continuityOutcome, 0) * 0.12 + safeNumber(metrics.routeSummary.contextConfidenceOutcome, 0) * 0.1
    );
    const offensiveImprovement = clamp012(
      clamp012(safeNumber(metrics.routeSummary.totalOffensiveGain, 0) / 0.45) * 0.55 + safeNumber(metrics.finalPatternScores.rising, 0) * 0.15 + safeNumber(metrics.finalPatternScores.pronation, 0) * 0.15 + safeNumber(metrics.finalPatternScores.finishing, 0) * 0.15
    );
    const tissueSustainability = clamp012(
      (1 - metrics.averageTissueRisk) * 0.32 + (1 - clamp012(safeNumber(metrics.finalTissueState.medialPain, 0) / 10)) * 0.22 + (1 - clamp012(safeNumber(metrics.finalTissueState.tissueIrritability, 0) / 10)) * 0.28 + (1 - clamp012(safeNumber(metrics.finalTissueState.forearmFatigue, 0) / 10)) * 0.18
    );
    const finishingImprovement = clamp012(
      safeNumber(metrics.finalPatternScores.finishing, 0) * 0.58 + safeNumber(metrics.finalPatternScores.sidePressure, 0) * 0.22 + clamp012(safeNumber(metrics.routeSummary.totalOffensiveGain, 0) / 0.45) * 0.2
    );
    const continuityRobustness = clamp012(
      safeNumber(metrics.routeSummary.continuityOutcome, 0) * 0.36 + safeNumber(metrics.routeSummary.contextConfidenceOutcome, 0) * 0.16 + (1 - metrics.averageContinuityDependency) * 0.28 + (1 - metrics.averageFatigueRisk) * 0.2
    );
    const modelStability = clamp012(
      metrics.averageBlockConfidence * 0.42 + safeNumber(metrics.finalState.modelConfidence, 0) * 0.28 + safeNumber(metrics.routeSummary.routeRobustness, 0) * 0.15 + (1 - metrics.averageTissueRisk) * 0.15
    );
    return {
      transferToTable: Number(transferToTable.toFixed(3)),
      offensiveImprovement: Number(offensiveImprovement.toFixed(3)),
      tissueSustainability: Number(tissueSustainability.toFixed(3)),
      finishingImprovement: Number(finishingImprovement.toFixed(3)),
      continuityRobustness: Number(continuityRobustness.toFixed(3)),
      modelStability: Number(modelStability.toFixed(3))
    };
  }
  function buildPenalties(route, breakdown) {
    const metrics = buildRouteMetrics(route);
    const penalties = [];
    let totalPenalty = 0;
    if (metrics.averageTissueRisk > 0.55) {
      penalties.push("La ruta exige demasiado al tejido.");
      totalPenalty += 0.08;
    }
    if (safeNumber(metrics.finalTissueState.medialPain, 0) >= 4) {
      penalties.push("La proyeccion termina con dolor medial alto.");
      totalPenalty += 0.1;
    }
    if (safeNumber(metrics.finalTissueState.tissueIrritability, 0) >= 5.5) {
      penalties.push("La irritabilidad final queda demasiado alta.");
      totalPenalty += 0.08;
    }
    if (metrics.averageContinuityDependency > 0.72 && breakdown.continuityRobustness < 0.45) {
      penalties.push("Depende demasiado de continuidad perfecta.");
      totalPenalty += 0.07;
    }
    if (safeNumber(route?.blocks?.[0]?.predictedEffects?.tissueRisk, 0) > 0.42 && safeNumber(route?.blocks?.[0]?.predictedEffects?.offensiveImprovement, 0) < 0.05) {
      penalties.push("El primer bloque cuesta mucho para lo que devuelve.");
      totalPenalty += 0.05;
    }
    return {
      totalPenalty: Number(totalPenalty.toFixed(3)),
      penalties
    };
  }
  function buildReasons2(route, breakdown, penalties) {
    const reasons = [];
    const finalPatternScores = route?.finalState?.patternScores || {};
    if (breakdown.transferToTable >= 0.62) {
      reasons.push("Buena proyeccion de transferencia a mesa.");
    }
    if (breakdown.offensiveImprovement >= 0.62) {
      reasons.push("Mejora ofensiva alta.");
    }
    if (breakdown.tissueSustainability >= 0.62) {
      reasons.push("Sostenibilidad tisular razonable.");
    }
    if (breakdown.continuityRobustness >= 0.55) {
      reasons.push("La ruta sigue siendo viable aunque la continuidad no sea perfecta.");
    }
    if (safeNumber(finalPatternScores.finishing, 0) >= 0.58) {
      reasons.push("La proyeccion mejora finishing.");
    }
    penalties.penalties.forEach((penalty) => reasons.push(`Penalty: ${penalty}`));
    return reasons;
  }
  function scoreRoute(route) {
    const scoreBreakdown = computeScoreBreakdown(route);
    const weightedBaseScore = Object.entries(ROUTE_SCORE_WEIGHTS).reduce((total, [scoreKey, weight]) => {
      return total + safeNumber(scoreBreakdown[scoreKey], 0) * weight;
    }, 0);
    const penaltySummary = buildPenalties(route, scoreBreakdown);
    const totalScore = Number(clamp012(weightedBaseScore - penaltySummary.totalPenalty).toFixed(3));
    const reasons = buildReasons2(route, scoreBreakdown, penaltySummary);
    return {
      routeId: route.routeId,
      label: route.label,
      totalScore,
      scoreBreakdown,
      weightedBaseScore: Number(weightedBaseScore.toFixed(3)),
      penaltyScore: penaltySummary.totalPenalty,
      penalties: penaltySummary.penalties,
      reasons,
      route
    };
  }
  function scoreRoutes(routes = []) {
    return routes.map(scoreRoute).sort((left, right) => right.totalScore - left.totalScore);
  }

  // src/simulation/adaptive-recommender.js
  function getTopEmphasisKeys(blockDefinition, limit = 4) {
    const ranked = Object.entries(blockDefinition?.emphasis || {}).sort((left, right) => safeNumber(right[1], 0) - safeNumber(left[1], 0)).filter(([, value]) => safeNumber(value, 0) > 0.03).map(([key]) => key);
    if (blockDefinition?.blockId === "tissue_tolerance") {
      return ranked.filter((key) => key !== "generalStrength").slice(0, limit);
    }
    return ranked.slice(0, limit);
  }
  function normalizeStrictEntry(entry = {}) {
    return {
      exercise_key: entry.exercise_key || entry.exerciseKey || "",
      exercise_name: entry.exercise_name || entry.exerciseName || "",
      side: entry.side || "unspecified",
      effort_type: entry.effort_type || entry.effortType || "dynamic",
      pattern: entry.pattern || "",
      progression_action: entry.progression_action || entry.progressionAction || "hold",
      base_target: entry.base_target || entry.baseTarget || null,
      current_record: entry.current_record || entry.currentRecord || null,
      prescribed_target: entry.prescribed_target || entry.prescribedTarget || null,
      allowed_today: Boolean(entry.allowed_today ?? entry.allowedToday),
      modulation: entry.modulation || "full_progression",
      restriction_reason: entry.restriction_reason || entry.restrictionReason || null,
      source_of_truth: entry.source_of_truth || entry.sourceOfTruth || "exercise_records"
    };
  }
  function buildSessionType(blockId, realState) {
    if (blockId === "tissue_tolerance" || realState?.riskFlags?.includes("medial_pain_active")) {
      return {
        sessionType: "recovery_tissue",
        label: "Recuperacion Y Tolerancia"
      };
    }
    if (blockId === "table_transfer") {
      return safeNumber(realState?.tissueState?.medialPain, 0) < 4 && safeNumber(realState?.continuityScore, 0) >= 0.4 ? { sessionType: "mesa_tecnica_controlada", label: "Mesa Tecnica Controlada" } : { sessionType: "specific_aw_tecnico", label: "Especifico AW Tecnico" };
    }
    if (blockId === "peak_competition") {
      return {
        sessionType: "specific_aw_competition",
        label: "Especifico Competitivo"
      };
    }
    if (blockId === "base_structural") {
      return {
        sessionType: "base_strength_transferible",
        label: "Base De Fuerza Transferible"
      };
    }
    return {
      sessionType: "specific_aw",
      label: "Especifico AW"
    };
  }
  function buildStrategicRank(entry, focusKeys, blockId = "") {
    const scoreKeys = inferScoreKeysForRecord({
      exercise_name: entry.exercise_name,
      pattern: entry.pattern
    });
    const overlapScore = focusKeys.reduce((total, key, index) => {
      return total + (scoreKeys.includes(key) ? focusKeys.length - index : 0);
    }, 0);
    const modulationBonus = entry.modulation === "full_progression" ? 1 : entry.modulation === "freeze_progression" ? 0.75 : entry.modulation === "technique_only" ? 0.55 : 0.2;
    const actionBonus = entry.progression_action === "increase" ? 1 : entry.progression_action === "hold" ? 0.78 : entry.progression_action === "reduce" ? 0.68 : 0.6;
    let blockBias = 0;
    if (blockId === "tissue_tolerance") {
      if (entry.effort_type === "isometric_hold") {
        blockBias += 1.1;
      }
      if (entry.progression_action === "hold" || entry.progression_action === "reduce") {
        blockBias += 0.8;
      }
      if (["rising", "pronation", "cupping", "flexor_pronator_isometric"].includes(entry.pattern)) {
        blockBias += 0.55;
      }
      if (entry.pattern === "back_pressure") {
        blockBias -= 0.25;
      }
      if (entry.pattern === "vertical_pull") {
        blockBias -= 0.35;
      }
    }
    return {
      scoreKeys,
      overlapScore,
      compositeScore: overlapScore * 1.15 + modulationBonus * 0.8 + actionBonus + blockBias + (entry.allowed_today ? 0.4 : 0)
    };
  }
  function buildRestrictions(realState, strictEntries) {
    const restrictions = [];
    strictEntries.filter((entry) => !entry.allowed_today && entry.restriction_reason).slice(0, 4).forEach((entry) => {
      restrictions.push(`${formatStartCase(entry.exercise_name)}: ${entry.restriction_reason}`);
    });
    if (realState?.riskFlags?.includes("low_session_continuity")) {
      restrictions.push("Continuidad baja: conviene no elegir una sesion demasiado compleja.");
    }
    if (realState?.riskFlags?.includes("low_data_density")) {
      restrictions.push("Densidad de datos baja: el sistema favorece rutas robustas.");
    }
    if (realState?.riskFlags?.includes("high_recent_table_load")) {
      restrictions.push("Carga reciente de mesa alta: no duplicar exposicion agresiva.");
    }
    return [...new Set(restrictions)];
  }
  function buildPrimaryExercises(strictEntries, focusKeys, blockId = "") {
    const ranked = strictEntries.map((entry) => ({
      ...entry,
      strategicRank: buildStrategicRank(entry, focusKeys, blockId)
    })).sort((left, right) => right.strategicRank.compositeScore - left.strategicRank.compositeScore);
    const allowed = ranked.filter((entry) => entry.allowed_today);
    return {
      primaryExercises: allowed.slice(0, 4).map((entry) => ({
        exerciseKey: entry.exercise_key,
        exerciseName: entry.exercise_name,
        side: entry.side,
        target: entry.prescribed_target || entry.base_target || entry.current_record || "Sin objetivo",
        modulation: entry.modulation,
        progressionAction: entry.progression_action,
        why: entry.strategicRank.scoreKeys.length > 0 ? `Alineado con ${entry.strategicRank.scoreKeys.map(formatStartCase).join(", ")}` : "Alineado con el bloque actual"
      })),
      supportiveExercises: allowed.slice(4, 6).map((entry) => ({
        exerciseKey: entry.exercise_key,
        exerciseName: entry.exercise_name,
        side: entry.side,
        target: entry.prescribed_target || entry.base_target || entry.current_record || "Sin objetivo",
        modulation: entry.modulation,
        progressionAction: entry.progression_action
      }))
    };
  }
  function chooseContingencyRoute(scoredRoutes, primaryRouteId) {
    const candidates = scoredRoutes.filter((route) => route.routeId !== primaryRouteId);
    return candidates.sort((left, right) => {
      const leftRobustness = safeNumber(left?.scoreBreakdown?.tissueSustainability, 0) + safeNumber(left?.scoreBreakdown?.continuityRobustness, 0);
      const rightRobustness = safeNumber(right?.scoreBreakdown?.tissueSustainability, 0) + safeNumber(right?.scoreBreakdown?.continuityRobustness, 0);
      return rightRobustness - leftRobustness;
    })[0] || null;
  }
  function buildAdaptiveRecommendation({
    realState,
    strictSessionPlan,
    scoredRoutes = []
  }) {
    const normalizedEntries = Array.isArray(strictSessionPlan?.entries) ? strictSessionPlan.entries.map(normalizeStrictEntry) : [];
    const primaryRoute = scoredRoutes[0] || null;
    const alternativeRoute = scoredRoutes[1] || null;
    const contingencyRoute = primaryRoute ? chooseContingencyRoute(scoredRoutes, primaryRoute.routeId) : null;
    const currentBlock = primaryRoute?.route?.blocks?.[0] || null;
    const blockDefinition = getBlockDefinitionById(currentBlock?.blockId || "");
    const focusKeys = getTopEmphasisKeys(blockDefinition);
    const { primaryExercises, supportiveExercises } = buildPrimaryExercises(normalizedEntries, focusKeys, currentBlock?.blockId || "");
    const restrictions = buildRestrictions(realState, normalizedEntries);
    const sessionType = buildSessionType(currentBlock?.blockId, realState);
    const currentBlockRecommendation = blockDefinition ? {
      suggestedBlockId: blockDefinition.blockId,
      suggestedBlockLabel: blockDefinition.label,
      scenarioId: currentBlock?.scenarioId || null,
      scenarioLabel: currentBlock?.scenarioLabel || null,
      emphasisKeys: focusKeys,
      reason: primaryRoute?.reasons?.[0] || "Es la ruta con mejor balance actual."
    } : null;
    return {
      nextSessionRecommendation: {
        sessionType: sessionType.sessionType,
        sessionLabel: sessionType.label,
        focus: focusKeys,
        primaryExercises,
        supportiveExercises,
        restrictions,
        rationale: [
          "La base segura sale del strict-planner.",
          "La prioridad estrategica sale de la ruta ganadora.",
          currentBlockRecommendation ? `El bloque actual favorece ${focusKeys.map(formatStartCase).join(", ")}.` : "No hay bloque simulado suficiente."
        ]
      },
      currentBlockRecommendation,
      primaryRoute,
      alternativeRoute,
      contingencyRoute,
      explanation: [
        "Strict-planner define lo que hoy si se puede hacer.",
        "La simulacion prioriza lo que mejor sirve a la ruta ganadora.",
        "La recomendacion final reconcilia seguridad inmediata y valor estrategico."
      ]
    };
  }

  // src/seed.js
  var sessionTypeLabels = {
    mesa: "Mesa",
    mesa_sparring: "Mesa / sparring",
    mesa_tecnica: "Mesa tecnica",
    specific_aw: "Especifico AW",
    multiarticular: "Multiarticular",
    multiarticular_fuerza: "Multiarticular fuerza",
    recovery: "Recuperacion",
    recovery_tissue: "Recuperacion / tejido"
  };
  var exerciseCategoryLabels = {
    specific_aw: "Especifico AW",
    multiarticular: "Multiarticular",
    tissue: "Tejido / tolerancia",
    accessory: "Accesorio"
  };
  var exercisePatternOptions = [
    "rising",
    "cupping",
    "back_pressure",
    "side_pressure",
    "pronation",
    "supination",
    "drag",
    "high_hook",
    "deep_hook",
    "containment",
    "finish",
    "squat",
    "hinge",
    "horizontal_push",
    "vertical_push",
    "horizontal_pull",
    "vertical_pull",
    "unilateral_leg",
    "trunk_bracing",
    "antirotation",
    "flexor_pronator_isometric",
    "extensor_balance",
    "wrist_control",
    "tendon_tolerance"
  ];
  var exerciseSideOptions = [
    { value: "right", label: "Derecho" },
    { value: "left", label: "Izquierdo" },
    { value: "bilateral", label: "Bilateral" }
  ];
  var patternLabels = {
    rising: "Rising",
    cupping: "Cupping",
    back_pressure: "Back pressure",
    side_pressure: "Side pressure",
    pronation: "Pronacion",
    supination: "Supinacion",
    drag: "Drag",
    high_hook: "Hook alto",
    deep_hook: "Hook profundo",
    containment: "Contencion",
    finish: "Finalizacion",
    squat: "Sentadilla",
    hinge: "Bisagra",
    horizontal_push: "Empuje horizontal",
    vertical_push: "Empuje vertical",
    horizontal_pull: "Tiron horizontal",
    vertical_pull: "Tiron vertical",
    unilateral_leg: "Pierna unilateral",
    trunk_bracing: "Bracing",
    antirotation: "Antirotacion",
    flexor_pronator_isometric: "Flexor-pronador isometrico",
    extensor_balance: "Balance extensor",
    wrist_control: "Control de muneca",
    tendon_tolerance: "Tolerancia tendinosa"
  };
  var exerciseDisplayLabels = {
    back_pressure: "Back Pressure",
    dominada_neutra_grip_grueso: "Dominada Neutra con Grip Grueso",
    mesa_hook_contencion_tecnica: "Mesa Hook de Contencion Tecnica",
    pronacion_extendida: "Pronacion Extendida",
    pronacion_media: "Pronacion Media",
    rising_dinamico_correa_pulgar: "Rising Dinamico con Correa al Pulgar",
    rising_isometrico: "Rising Isometrico",
    row_con_straps_y_pecho_apoyado: "Remo con Straps y Pecho Apoyado"
  };
  var defaultAthleteProfile = {
    athlete_id: "demo_athlete_strict_fixture",
    display_name: "Atleta Demo",
    bodyweight_class_target_kg: 80,
    sport: "armwrestling",
    experience_strength_years: 5,
    experience_armwrestling_months_serious: 8,
    primary_goal: "demo_progression_goal",
    secondary_goal: "demo_transfer_goal",
    constraints: ["modo_demo", "fatiga_articular_medial_codo"],
    current_strength_profile: {
      back_pressure: "fuerte",
      pronation: "fuerte",
      cupping: "fuerte",
      rising: "debil",
      flexor_pronator_isometric: "debil_secundaria",
      side_pressure: "debil_secundaria"
    },
    priority_distribution: {
      rising: 4,
      flexor_pronator_isometric: 3,
      side_pressure: 2.5,
      back_pressure: 2,
      pronation: 1.5,
      cupping: 1
    },
    equipment_available: [
      "mesa",
      "correas",
      "banca",
      "sentadilla",
      "remo_con_straps"
    ]
  };
  var seedCheckin = {
    date: "2026-03-29",
    sleep_hours: 7.5,
    readiness: 8.5,
    bodyweight: 80,
    pain: {
      medial_elbow_right: 2.5,
      lateral_elbow_right: 0,
      shoulder_right: 0,
      wrist_right: 0
    },
    fatigue: {
      global: 5,
      forearm_hand: 4,
      back: 4,
      legs: 2
    },
    available_time_min: 110,
    session_type_planned: "specific_aw"
  };
  var seedSession = {
    session_id: "2026-03-29-specific-aw-01",
    date: "2026-03-29",
    session_type: "specific_aw",
    goal_of_session: "toproll_pesado_evaluacion_real",
    effort_rpe_session: 9.2,
    results: {
      best_pattern: "back_pressure_y_pronacion",
      best_grip_condition: "medio_neutro_grueso",
      main_limitation: "flexor_pronator_isometric",
      could_stop: false,
      could_move: false,
      could_finish: false
    },
    pain_events: [
      {
        zone: "medial_elbow_right",
        type: "irritability",
        severity: 2.5,
        during: "specific_aw",
        resolved_with: "no_necesario"
      }
    ],
    exercise_entry_count: 12
  };
  var seedExerciseEntries = [
    {
      entry_id: "2026-03-29-specific-aw-01-ex-01",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "dominada_neutra_grip_grueso",
      category: "multiarticular",
      pattern: "vertical_pull",
      side: "bilateral",
      load: 30,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 4,
      rpe: 9,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.88,
      technique_quality: 0.87,
      confirmed_rm: false,
      notes: "top set real; grip grueso; rendimiento alto"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-02",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "dominada_neutra_grip_grueso",
      category: "multiarticular",
      pattern: "vertical_pull",
      side: "bilateral",
      load: 25,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 5,
      rpe: 8,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.86,
      technique_quality: 0.87,
      confirmed_rm: false,
      notes: "base actual solida de trabajo"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-11",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "dominada_neutra_grip_grueso",
      category: "multiarticular",
      pattern: "vertical_pull",
      side: "bilateral",
      load: 45,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 1,
      rpe: 10,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.94,
      technique_quality: 0.93,
      confirmed_rm: true,
      notes: "RM confirmado real de dominada pesada"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-03",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "pronacion_media",
      category: "specific_aw",
      pattern: "pronation",
      side: "bilateral",
      load: 40,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 5,
      rpe: 9,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.9,
      technique_quality: 0.88,
      confirmed_rm: false,
      notes: "top set real de pronacion media"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-04",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "pronacion_media",
      category: "specific_aw",
      pattern: "pronation",
      side: "bilateral",
      load: 35,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 6,
      rpe: 8,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.87,
      technique_quality: 0.88,
      confirmed_rm: false,
      notes: "RIR 2 registrado como RPE 8"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-05",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "pronacion_extendida",
      category: "specific_aw",
      pattern: "pronation",
      side: "right",
      load: 33,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 10,
      rpe: 8,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.85,
      technique_quality: 0.86,
      confirmed_rm: false,
      notes: "derecho"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-06",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "pronacion_extendida",
      category: "specific_aw",
      pattern: "pronation",
      side: "left",
      load: 30,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 10,
      rpe: 8.5,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.82,
      technique_quality: 0.84,
      confirmed_rm: false,
      notes: "izquierdo"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-07",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "rising_isometrico",
      category: "specific_aw",
      pattern: "rising",
      side: "right",
      load: 25,
      load_unit: "kg",
      effort_type: "isometric_hold",
      sets: 1,
      reps: 1,
      rpe: 10,
      duration_seconds: 30,
      pain_during: 2,
      vector_quality: 0.9,
      technique_quality: 0.88,
      confirmed_rm: false,
      notes: "hold al fallo; ultima exposicion del dia cayo a 15 s"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-12",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "rising_isometrico",
      category: "specific_aw",
      pattern: "rising",
      side: "left",
      load: 30,
      load_unit: "kg",
      effort_type: "isometric_hold",
      sets: 1,
      reps: 1,
      rpe: 9.5,
      duration_seconds: 25,
      pain_during: 1,
      vector_quality: 0.88,
      technique_quality: 0.86,
      confirmed_rm: false,
      notes: "izquierdo; primera serie a 30 kg, 25 s maximos, vector correcto"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-08",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "back_pressure",
      category: "specific_aw",
      pattern: "back_pressure",
      side: "right",
      load: 35,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 5,
      rpe: 9,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.89,
      technique_quality: 0.88,
      confirmed_rm: false,
      notes: "derecho"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-09",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "back_pressure",
      category: "specific_aw",
      pattern: "back_pressure",
      side: "left",
      load: 35,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 3,
      rpe: 9.5,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.83,
      technique_quality: 0.82,
      confirmed_rm: false,
      notes: "izquierdo"
    },
    {
      entry_id: "2026-03-29-specific-aw-01-ex-10",
      session_id: "2026-03-29-specific-aw-01",
      date: "2026-03-29",
      exercise_name: "back_pressure",
      category: "specific_aw",
      pattern: "back_pressure",
      side: "right",
      load: 30,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 1,
      reps: 10,
      rpe: 8,
      duration_seconds: 0,
      pain_during: 2,
      vector_quality: 0.87,
      technique_quality: 0.86,
      confirmed_rm: false,
      notes: "derecho; izquierda tambien hizo 30 x 8"
    }
  ];
  function createSeedData() {
    return {
      version: 8,
      athleteProfile: JSON.parse(JSON.stringify(defaultAthleteProfile)),
      dailyCheckins: [JSON.parse(JSON.stringify(seedCheckin))],
      sessions: [JSON.parse(JSON.stringify(seedSession))],
      exerciseEntries: JSON.parse(JSON.stringify(seedExerciseEntries))
    };
  }

  // src/storage.js
  var API_ROOT = "/api";
  function buildNetworkErrorMessage(error) {
    const protocol = globalThis?.location?.protocol || "";
    if (protocol === "file:") {
      return "La app se abri\xF3 sin servidor local. Inicia .\\serve.ps1 y entra a http://localhost:8000.";
    }
    if (error instanceof TypeError) {
      return "No fue posible conectar con el servidor local. Verifica que .\\serve.ps1 siga encendido en http://localhost:8000.";
    }
    return "No fue posible conectar con la base de datos local.";
  }
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function sortByDateDescending2(entries) {
    return entries.slice().sort((left, right) => String(right.date).localeCompare(String(left.date)));
  }
  function ensureShape(data, storageOverrides = {}) {
    const seed = createSeedData();
    const storage = {
      mode: "demo",
      source: "seed",
      databasePath: "",
      lastSyncAt: null,
      strictAvailable: false,
      ...data?.storage,
      ...storageOverrides
    };
    return {
      version: data?.version || seed.version,
      athleteProfile: data?.athleteProfile || seed.athleteProfile,
      dailyCheckins: Array.isArray(data?.dailyCheckins) ? sortByDateDescending2(data.dailyCheckins) : seed.dailyCheckins,
      sessions: Array.isArray(data?.sessions) ? sortByDateDescending2(data.sessions) : seed.sessions,
      exerciseEntries: Array.isArray(data?.exerciseEntries) ? sortByDateDescending2(data.exerciseEntries) : seed.exerciseEntries,
      exerciseRecords: Array.isArray(data?.exerciseRecords) ? clone(data.exerciseRecords) : [],
      storage
    };
  }
  async function requestJson(path, options = {}) {
    let response;
    try {
      response = await fetch(`${API_ROOT}${path}`, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...options.headers || {}
        },
        ...options
      });
    } catch (error) {
      throw new Error(buildNetworkErrorMessage(error));
    }
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
  async function loadServerMeta() {
    return requestJson("/meta", { method: "GET" });
  }
  async function loadStrictConfig() {
    return requestJson("/codex-config/strict", { method: "GET" });
  }
  async function loadSimulationCycle() {
    return requestJson("/simulation-cycle", { method: "GET" });
  }
async function loadIPPCycle() {
  return requestJson("/ipp-cycle", { method: "GET" });
}
  async function loadAppData(serverMeta = null) {
    const meta = serverMeta || await loadServerMeta();
    try {
      const payload = await requestJson("/app-data", { method: "GET" });
      return ensureShape(payload, {
        mode: meta.mode,
        source: payload?.storage?.source || meta.source || "sqlite",
        strictAvailable: meta.strictAvailable,
        databasePath: payload?.storage?.databasePath || meta.databasePath || "",
        lastSyncAt: payload?.storage?.lastSyncAt || meta.lastSyncAt || null
      });
    } catch (error) {
      if (meta.mode === "strict") {
        throw error;
      }
      console.warn("No fue posible leer la base local. Se cargara la semilla temporal.", error);
      return ensureShape(createSeedData(), {
        mode: meta.mode || "demo",
        source: "seed",
        strictAvailable: false,
        databasePath: "",
        lastSyncAt: null
      });
    }
  }
  async function saveCheckin(checkin) {
    const payload = await requestJson("/checkins", {
      method: "POST",
      body: JSON.stringify(checkin)
    });
    return ensureShape(payload);
  }
  async function saveSession(session, exerciseEntries = []) {
    const payload = await requestJson("/sessions", {
      method: "POST",
      body: JSON.stringify({ session, exerciseEntries })
    });
    return ensureShape(payload);
  }
  function getLatestCheckin(data) {
    return ensureShape(data).dailyCheckins[0] || null;
  }
  function getLatestSession(data) {
    return ensureShape(data).sessions[0] || null;
  }
  function createSessionId(date, sessionType, index) {
    const fragment = sessionType.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    return `${date}-${fragment}-${String(index).padStart(2, "0")}`;
  }
  function createExerciseEntryId(sessionId, index) {
    return `${sessionId}-ex-${String(index).padStart(2, "0")}`;
  }

  // src/ui.js
  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function titleCaseToken(token) {
    return patternLabels[token] || token.replaceAll("_", " ");
  }
  function humanizeText(value) {
    return String(value || "").replaceAll("_", " ");
  }
  function startCase(value) {
    return String(value || "").replaceAll("_", " ").replace(/\s+/g, " ").trim().replace(/(^|[\s(])([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
  }
  function capitalizeFirst(value) {
    const text = String(value || "").trim();
    if (!text) {
      return "";
    }
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
  }
  function normalizeLookupKey(value) {
    return String(value || "").trim().toLowerCase();
  }
  function formatUiText(value) {
    const text = String(value ?? "").trim();
    if (!text) {
      return "Sin Dato";
    }
    const lookupKey = normalizeLookupKey(text);
    if (exerciseDisplayLabels[lookupKey]) {
      return exerciseDisplayLabels[lookupKey];
    }
    if (patternLabels[lookupKey]) {
      return capitalizeFirst(patternLabels[lookupKey]);
    }
    if (text.includes("_") || /^[a-z0-9/-]+$/i.test(text)) {
      return startCase(text);
    }
    return capitalizeFirst(text);
  }
  function formatDecimal(value, digits = 1) {
    if (value === null || value === void 0 || value === "") {
      return "Sin Dato";
    }
    return Number(value).toFixed(digits);
  }
  function formatKgValue(value) {
    return Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value).toFixed(1)} kg` : "sin dato";
  }
  function formatRmSourceType(value) {
    if (value === "confirmed") {
      return "confirmado";
    }
    if (value === "theoretical") {
      return "te\xF3rico";
    }
    return "no calculable";
  }
  function buildBestSetLabel(bestSet) {
    if (!bestSet) {
      return "Sin Set Util";
    }
    if (bestSet.effortType === "isometric_hold") {
      const loadValue2 = Number(bestSet.load) || 0;
      const loadUnit2 = bestSet.loadUnit || "";
      const durationSeconds = Number(bestSet.durationSeconds) || 0;
      const sets2 = Number(bestSet.sets) || 0;
      const loadLabel2 = loadValue2 > 0 ? `${loadValue2} ${loadUnit2}` : "Sin Carga Externa";
      return `${loadLabel2} x ${durationSeconds} S (${sets2} Holds)`;
    }
    const loadValue = Number(bestSet.load) || 0;
    const loadUnit = bestSet.loadUnit || "";
    const reps = Number(bestSet.reps) || 0;
    const sets = Number(bestSet.sets) || 0;
    const rpe = Number(bestSet.rpe) || 0;
    const loadLabel = loadValue > 0 ? `${loadValue} ${loadUnit}` : loadUnit || "Sin Carga Externa";
    return `${loadLabel} x ${reps} Reps (${sets} Sets) @ RPE ${rpe}`;
  }
  function buildRecordDatum(label, value, options = {}) {
    const toneClass = options.tone ? ` record-datum-${options.tone}` : "";
    const spanClass = options.full ? " record-datum-full" : "";
    return `
    <div class="record-datum${toneClass}${spanClass}">
      <span class="record-datum-label">${escapeHtml(startCase(label))}</span>
      <span class="record-datum-value">${escapeHtml(capitalizeFirst(value))}</span>
    </div>
  `;
  }
  function buildExerciseCardTitle(record) {
    const baseName = formatUiText(record.exerciseName || record.displayName || "sin ejercicio");
    if (record.side === "right") {
      return `${baseName} (Derecho)`;
    }
    if (record.side === "left") {
      return `${baseName} (Izquierdo)`;
    }
    return baseName;
  }
  function buildExerciseCountMap(exerciseEntries) {
    return exerciseEntries.reduce((map, entry) => {
      map[entry.session_id] = (map[entry.session_id] || 0) + 1;
      return map;
    }, {});
  }
  function buildCandidateBadgeLabel(index) {
    if (index === 0) {
      return "Mejor Ajuste Hoy";
    }
    if (index === 1) {
      return "Segunda Opcion";
    }
    return "Alternativa";
  }
  function buildCandidateSummary(candidate, index) {
    const breakdown = candidate?.breakdown || {};
    const positives = [];
    const cautions = [];
    if ((breakdown.objectiveMatch || 0) >= 0.75) {
      positives.push("Encaja bien con el objetivo de hoy");
    }
    if ((breakdown.weaknessTargeting || 0) >= 0.45) {
      positives.push("Ataca una debilidad importante");
    }
    if ((breakdown.toleranceFit || 0) >= 0.7) {
      positives.push("La tolerancia actual lo permite");
    }
    if ((breakdown.painRisk || 0) >= 0.28) {
      cautions.push("Carga local a vigilar");
    }
    if ((breakdown.interferenceCost || 0) >= 0.35) {
      cautions.push("Puede interferir con la siguiente sesion");
    }
    if ((breakdown.fatigueCost || 0) >= 0.35) {
      cautions.push("Puede dejar mas fatiga de la que conviene");
    }
    if ((breakdown.redundancyPenalty || 0) >= 0.3) {
      cautions.push("Se parece demasiado a lo que ya vienes haciendo");
    }
    const heuristicNotes = (candidate.notes || []).map((note) => formatUiText(note)).filter(Boolean);
    const parts = [];
    if (index === 0) {
      parts.push("Es la opcion con mejor ajuste para hoy.");
    } else if (index === 1) {
      parts.push("Se puede usar, pero queda un paso por detras de la principal.");
    } else {
      parts.push("Es viable, aunque hoy tiene menos prioridad.");
    }
    if (positives.length > 0) {
      parts.push(`${positives.slice(0, 2).join(". ")}.`);
    }
    if (cautions.length > 0) {
      parts.push(`Cuidado: ${cautions.slice(0, 2).join(" y ")}.`);
    }
    if (heuristicNotes.length > 0) {
      parts.push(heuristicNotes.slice(0, 2).join(" "));
    }
    return parts.join(" ");
  }
  function buildEffectiveExerciseSummary(item) {
    const parts = [];
    if (Number(item.totalSets) > 0) {
      parts.push(`${item.totalSets} sets utiles`);
    }
    if (Number.isFinite(Number(item.avgPain))) {
      parts.push(`dolor ${formatDecimal(item.avgPain)}/10`);
    }
    if (Number.isFinite(Number(item.occurrences)) && Number(item.occurrences) > 1) {
      parts.push(`${item.occurrences} exposiciones`);
    }
    return parts.join(" | ") || "Sin lectura suficiente";
  }
  function formatCompactNumber(value, digits = 1) {
    if (!Number.isFinite(Number(value))) {
      return "Sin Dato";
    }
    const rounded = Number(Number(value).toFixed(digits));
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }
  function formatCompactKgValue(value) {
    return Number.isFinite(Number(value)) && Number(value) > 0 ? `${formatCompactNumber(value)} kg` : "Sin Dato";
  }
  function formatSessionDay(dateText) {
    if (!dateText) {
      return "Sin Dato";
    }
    const date = /* @__PURE__ */ new Date(`${dateText}T12:00:00`);
    if (Number.isNaN(date.getTime())) {
      return dateText;
    }
    return capitalizeFirst(
      new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(date)
    );
  }
  function buildSessionIntensityLabel(session) {
    const rpe = Number(session?.effort_rpe_session || 0);
    if (!Number.isFinite(rpe) || rpe <= 0) {
      return "Sin Dato";
    }
    if (rpe >= 9) {
      return `Alta | RPE ${formatCompactNumber(rpe)}`;
    }
    if (rpe >= 7.5) {
      return `Media-Alta | RPE ${formatCompactNumber(rpe)}`;
    }
    if (rpe >= 6) {
      return `Media | RPE ${formatCompactNumber(rpe)}`;
    }
    return `Baja | RPE ${formatCompactNumber(rpe)}`;
  }
  function buildSessionLoadLabel(entries) {
    const loads = entries.map((entry) => buildEntryStrengthMetrics(entry).loadKg).filter((value) => Number.isFinite(value) && value > 0);
    if (!loads.length) {
      return "Sin Carga Externa";
    }
    const minLoad = Math.min(...loads);
    const maxLoad = Math.max(...loads);
    if (minLoad === maxLoad) {
      return formatCompactKgValue(maxLoad);
    }
    return `${formatCompactNumber(minLoad)}-${formatCompactNumber(maxLoad)} kg`;
  }
  function buildSessionRmLabel(entries) {
    const ranked = entries.map((entry) => {
      const metrics = buildEntryStrengthMetrics(entry);
      return {
        entry,
        rmKg: Number(metrics.currentRmKg) || 0
      };
    }).filter((item) => item.rmKg > 0).sort((left, right) => right.rmKg - left.rmKg);
    const best = ranked[0];
    if (!best) {
      return "Sin RM Util";
    }
    return `${formatCompactNumber(best.rmKg)} kg en ${formatUiText(best.entry.exercise_name)}`;
  }
  function buildPreviousSessionCards(sessions = [], exerciseEntries = [], limit = 6) {
    if (!sessions.length) {
      return '<div class="empty-note">Todavia no hay sesiones registradas.</div>';
    }
    const exerciseMap = exerciseEntries.reduce((map, entry) => {
      if (!map[entry.session_id]) {
        map[entry.session_id] = [];
      }
      map[entry.session_id].push(entry);
      return map;
    }, {});
    return sessions.slice(0, limit).map((session) => {
      const entries = exerciseMap[session.session_id] || [];
      const exerciseCount = entries.length;
      const sessionType = sessionTypeLabels[session.session_type] || formatUiText(session.session_type || "sin tipo");
      return `
        <article class="history-card">
          <h3>${escapeHtml(sessionType)}</h3>
          <div class="record-metrics-grid">
            ${buildRecordDatum("Dia", formatSessionDay(session.date), { tone: "accent" })}
            ${buildRecordDatum("Ejercicios", exerciseCount > 0 ? String(exerciseCount) : "Sin Dato", { tone: "soft" })}
            ${buildRecordDatum("Intensidad", buildSessionIntensityLabel(session), { tone: "success" })}
            ${buildRecordDatum("Pesos Utilizados", buildSessionLoadLabel(entries), { full: true })}
            ${buildRecordDatum("RM Del Dia", buildSessionRmLabel(entries), { full: true, tone: "accent" })}
          </div>
        </article>
      `;
    }).join("");
  }
  function renderProfileSummary(container, profile) {
    const strengths = Object.entries(profile.current_strength_profile).filter(([, value]) => String(value).includes("fuerte")).map(([pattern]) => titleCaseToken(pattern));
    const weaknesses = Object.entries(profile.current_strength_profile).filter(([, value]) => String(value).includes("debil")).map(([pattern]) => titleCaseToken(pattern));
    const distribution = Object.entries(profile.priority_distribution).map(([pattern, value]) => `<span class="pill">${escapeHtml(titleCaseToken(pattern))}: ${escapeHtml(value)}</span>`).join("");
    container.innerHTML = `
    <article class="stat-block">
      <h3>${escapeHtml(profile.display_name)}</h3>
      <p class="muted">Objetivo dominante: ${escapeHtml(formatUiText(profile.primary_goal))}</p>
      <p class="muted">Objetivo secundario: ${escapeHtml(formatUiText(profile.secondary_goal))}</p>
    </article>
    <article class="stat-block">
      <h3>Fortalezas en mantenimiento</h3>
      <div class="pill-row">${strengths.map((item) => `<span class="pill pill-muted">${escapeHtml(item)}</span>`).join("")}</div>
    </article>
    <article class="stat-block">
      <h3>Debilidades a priorizar</h3>
      <div class="pill-row">${weaknesses.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div>
    </article>
    <article class="stat-block">
      <h3>Distribucion inicial sugerida</h3>
      <div class="pill-row">${distribution}</div>
    </article>
  `;
  }
  function renderContextSummary(container, context, options = {}) {
    const sessions = Array.isArray(options.sessions) ? options.sessions : [];
    const exerciseEntries = Array.isArray(options.exerciseEntries) ? options.exerciseEntries : [];
    container.innerHTML = buildPreviousSessionCards(sessions, exerciseEntries, 6);
  }
  function getRuntimeUiBridge() {
  return typeof window !== "undefined" ? window.__ENTRENADOR_UI_BRIDGE__ || null : null;
}

function buildRuntimeUiHelpers() {
  return {
    escapeHtml,
    formatUiText,
    formatDecimal,
    buildRouteBreakdownSummary
  };
}

function renderBridgeFallback(container, scoringContainer, title, detail = "") {
  if (container) {
    container.innerHTML = `
      <div class="empty-note">
        ${escapeHtml(title)}
      </div>
    `;
  }

  if (scoringContainer) {
    scoringContainer.innerHTML = detail
      ? `
        <article class="stat-block">
          <h3>Fallback local</h3>
          <p class="muted">${escapeHtml(detail)}</p>
        </article>
      `
      : "";
  }
}

function renderRecommendation(container, scoringContainer, recommendation) {
  const bridge = getRuntimeUiBridge();

  if (bridge?.renderRecommendation) {
    return bridge.renderRecommendation(
      container,
      scoringContainer,
      recommendation,
      buildRuntimeUiHelpers()
    );
  }

  const payload = recommendation?.session_recommendation;

  if (!payload) {
    renderBridgeFallback(
      container,
      scoringContainer,
      "No hay recomendación heurística disponible."
    );
    return;
  }

  renderBridgeFallback(
    container,
    scoringContainer,
    "Bridge UI no disponible. Se omitió el render heurístico enriquecido.",
    `Etiqueta prevista: ${payload.label || "Sin dato"}`
  );
}

function buildRouteBreakdownSummary(route) {
  const breakdown = route?.scoreBreakdown || {};
  const parts = [];

  if (breakdown.transferToTable !== void 0) {
    parts.push(`mesa ${formatDecimal(breakdown.transferToTable, 2)}`);
  }
  if (breakdown.offensiveImprovement !== void 0) {
    parts.push(`ofensiva ${formatDecimal(breakdown.offensiveImprovement, 2)}`);
  }
  if (breakdown.tissueSustainability !== void 0) {
    parts.push(`tejido ${formatDecimal(breakdown.tissueSustainability, 2)}`);
  }
  if (breakdown.continuityRobustness !== void 0) {
    parts.push(`robustez ${formatDecimal(breakdown.continuityRobustness, 2)}`);
  }

  return parts.join(" | ");
}

function buildRouteRoleLabel(role) {
  const bridge = getRuntimeUiBridge();

  if (bridge?.buildRouteRoleLabel) {
    return bridge.buildRouteRoleLabel(role);
  }

  switch (role) {
    case "primary":
      return "Ruta Principal";
    case "alternative":
      return "Ruta Alternativa";
    case "contingency":
      return "Ruta de Contingencia";
    default:
      return "Ruta";
  }
}

function buildRouteCard(route, role) {
  if (!route) {
    return "";
  }

  const currentBlock = route?.route?.blocks?.[0] || null;
  const blockLabel = currentBlock?.blockLabel || "Sin bloque";
  const scenarioLabel = currentBlock?.scenarioLabel || "Sin escenario";
  const weakest = Array.isArray(route?.route?.predictedSummary?.weakestPredictedFactors)
    ? route.route.predictedSummary.weakestPredictedFactors.map((item) => formatUiText(item)).join(", ")
    : "Sin dato";

  return `
    <article class="stat-block">
      <div class="score-row-head">
        <h3>${escapeHtml(buildRouteRoleLabel(role))}</h3>
        <span class="pill ${role === "primary" ? "" : "pill-muted"}">
          Score ${escapeHtml(formatDecimal(route.totalScore, 2))}
        </span>
      </div>
      <p class="muted"><strong>${escapeHtml(route.label || route.routeId)}</strong></p>
      <p class="muted">Bloque actual: ${escapeHtml(blockLabel)} | Escenario: ${escapeHtml(scenarioLabel)}</p>
      <p class="muted">${escapeHtml(buildRouteBreakdownSummary(route))}</p>
      <p class="muted">Debilidades previstas: ${escapeHtml(weakest)}</p>
      <ul class="list">
        ${(route.reasons || []).slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderAdaptiveRecommendation(container, scoringContainer, recommendation) {
  const bridge = getRuntimeUiBridge();

  if (bridge?.renderAdaptiveRecommendation) {
    return bridge.renderAdaptiveRecommendation(
      container,
      scoringContainer,
      recommendation,
      buildRuntimeUiHelpers()
    );
  }

  if (!recommendation) {
    renderBridgeFallback(
      container,
      scoringContainer,
      "No hay recomendación adaptativa disponible todavía."
    );
    return;
  }

  const nextSession = recommendation?.nextSessionRecommendation || {};
  const currentBlock = recommendation?.currentBlockRecommendation || null;

  renderBridgeFallback(
    container,
    scoringContainer,
    "Bridge UI no disponible. Se omitió el render adaptativo enriquecido.",
    `Sesión prevista: ${nextSession.sessionLabel || "Sin dato"} | Bloque: ${currentBlock?.suggestedBlockLabel || "Sin dato"}`
  );
}

function renderSimulationRoutes(container, recommendation) {
  const bridge = getRuntimeUiBridge();

  if (bridge?.renderSimulationRoutes) {
    return bridge.renderSimulationRoutes(
      container,
      recommendation,
      buildRuntimeUiHelpers()
    );
  }

  if (!container) {
    return;
  }

  if (!recommendation) {
    container.innerHTML = '<div class="empty-note">Todavía no hay rutas simuladas disponibles.</div>';
    return;
  }

  container.innerHTML = `
    <div class="empty-note">
      Bridge UI no disponible. Se omitió el render detallado de rutas simuladas.
    </div>
  `;
}

  function renderPostSessionInsight(container, insight) {
    if (!insight) {
      container.innerHTML = '<div class="empty-note">Todav\xEDa no hay una sesi\xF3n suficiente para leer qu\xE9 funcion\xF3 y qu\xE9 se debe priorizar despu\xE9s.</div>';
      return;
    }
    container.innerHTML = `
    <article class="recommendation-card">
      <h3>${escapeHtml(insight.title)} - ${escapeHtml(insight.date)}</h3>
      <div class="recommendation-meta">
        <p>${escapeHtml(insight.overview)}</p>
        <div class="pill-row">
          <span class="pill pill-muted">sets ${escapeHtml(insight.metrics.totalSets)}</span>
          <span class="pill pill-muted">ejercicios ${escapeHtml(insight.metrics.exerciseCount)}</span>
          <span class="pill pill-muted">dolor medio ${escapeHtml(formatDecimal(insight.metrics.avgPain))}/10</span>
        </div>
        <div>
          <strong>Lo que si sumo</strong>
          <ul class="list">
            ${insight.wins.length > 0 ? insight.wins.map((item) => `<li>${escapeHtml(formatUiText(item))}</li>`).join("") : "<li>faltan mas datos para detectar una ganancia clara</li>"}
          </ul>
        </div>
        <div>
          <strong>Limitacion raiz detectada</strong>
          <ul class="list">
            ${insight.limits.length > 0 ? insight.limits.map((item) => `<li>${escapeHtml(formatUiText(item))}</li>`).join("") : "<li>sin limitacion dominante clara</li>"}
          </ul>
        </div>
        <p><strong>Siguiente prioridad:</strong> ${escapeHtml(formatUiText(insight.nextPriority))}</p>
        <p><strong>Limitar temporalmente:</strong> ${insight.avoid.length > 0 ? insight.avoid.map((item) => escapeHtml(formatUiText(item))).join(", ") : "sin vetos duros"}</p>
        <p><strong>Mejor ejercicio de la sesi\xF3n:</strong> ${escapeHtml(formatUiText(insight.bestExercise?.exercise_name || "sin dato"))}</p>
        <p><strong>Ejercicio mas agresivo hoy:</strong> ${escapeHtml(formatUiText(insight.riskiestExercise?.exercise_name || "sin dato"))}</p>
      </div>
    </article>
  `;
  }
  function renderWeeklyDashboard(container, dashboard) {
    if (!dashboard) {
      container.innerHTML = '<div class="empty-note">Falta contexto suficiente para construir la semana.</div>';
      return;
    }
    container.innerHTML = `
    <div class="summary-grid">
      <article class="stat-block">
        <h3>Metricas 7 dias</h3>
        <p class="muted">Sesiones: ${escapeHtml(dashboard.metrics.sessionCount)}</p>
        <p class="muted">Mesa: ${escapeHtml(dashboard.metrics.tableCount)}</p>
        <p class="muted">Ejercicios: ${escapeHtml(dashboard.metrics.exerciseCount)}</p>
        <p class="muted">Sets: ${escapeHtml(dashboard.metrics.totalSets)}</p>
        <p class="muted">Readiness medio: ${escapeHtml(formatDecimal(dashboard.metrics.avgReadiness))}</p>
        <p class="muted">Dolor medial medio: ${escapeHtml(formatDecimal(dashboard.metrics.avgMedialPain))}</p>
        <p class="muted">RPE medio de sesi\xF3n: ${escapeHtml(formatDecimal(dashboard.metrics.avgSessionRpe))}</p>
        <p class="muted">Check-ins capturados: ${escapeHtml(dashboard.metrics.checkinDaysCaptured)}/7</p>
        <p class="muted">Hueco maximo de captura: ${escapeHtml(dashboard.metrics.maxCheckinGapDays)} dias</p>
      </article>
      <article class="stat-block">
        <h3>Patrones m\xE1s expuestos</h3>
        <div class="pill-row">
          ${dashboard.topPatterns.length > 0 ? dashboard.topPatterns.map((item) => `<span class="pill">${escapeHtml(titleCaseToken(item.pattern))}: ${escapeHtml(item.setCount)} sets</span>`).join("") : '<span class="pill pill-muted">sin exposicion aun</span>'}
        </div>
      </article>
        <article class="stat-block">
          <h3>Ejercicios mas rentables</h3>
          <ul class="list">
            ${dashboard.effectiveExercises.length > 0 ? dashboard.effectiveExercises.map((item) => `<li><strong>${escapeHtml(formatUiText(item.exerciseName))}:</strong> ${escapeHtml(buildEffectiveExerciseSummary(item))}</li>`).join("") : "<li>todavia no hay datos suficientes</li>"}
          </ul>
        </article>
      <article class="stat-block">
        <h3>Enfoque sugerido</h3>
        <p class="muted">${escapeHtml(dashboard.recommendedFocus)}</p>
      </article>
    </div>
    <div class="summary-grid">
      <article class="stat-block">
        <h3>Flags de riesgo</h3>
        <ul class="list">
          ${dashboard.riskFlags.length > 0 ? dashboard.riskFlags.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>sin alertas duras esta semana</li>"}
        </ul>
      </article>
      <article class="stat-block">
        <h3>Se\xF1ales positivas</h3>
        <ul class="list">
          ${dashboard.positiveSignals.length > 0 ? dashboard.positiveSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>aun no hay una senal fuerte acumulada</li>"}
        </ul>
      </article>
    </div>
  `;
  }
  function renderSessionHistory(container, sessions, exerciseEntries) {
    if (!sessions.length) {
      container.innerHTML = '<div class="empty-note">Todav\xEDa no hay sesiones registradas.</div>';
      return;
    }
    const exerciseCountMap = buildExerciseCountMap(exerciseEntries);
    container.innerHTML = sessions.slice(0, 6).map((session) => {
      const painPeak = (session.pain_events || []).reduce((peak, event) => Math.max(peak, Number(event.severity) || 0), 0);
      const limitation = session.results?.main_limitation ? `<span class="pill">${escapeHtml(formatUiText(session.results.main_limitation))}</span>` : '<span class="pill pill-muted">sin limitacion registrada</span>';
      return `
        <article class="history-card">
          <h3>${escapeHtml(sessionTypeLabels[session.session_type] || session.session_type)}</h3>
        <p class="muted">${escapeHtml(session.date)} - Objetivo: ${escapeHtml(formatUiText(session.goal_of_session || "sin objetivo"))}</p>
          <p class="muted">RPE ${escapeHtml(session.effort_rpe_session || "-")} - Mejor patr\xF3n: ${escapeHtml(formatUiText(session.results?.best_pattern || "sin dato"))}</p>
          <div class="history-meta">
            <span class="pill pill-muted">dolor medial ${painPeak}/10</span>
            <span class="pill pill-muted">ejercicios ${exerciseCountMap[session.session_id] || 0}</span>
            ${limitation}
            <span class="pill pill-muted">${session.results?.could_finish ? "pudo finalizar" : "no finalizo"}</span>
          </div>
        </article>
      `;
    }).join("");
  }
  function renderPerformanceGoals(container, snapshot) {
    if (!snapshot) {
      container.innerHTML = '<div class="empty-note">Falta informacion para construir la vista de rendimiento.</div>';
      return;
    }
    const cards = [
      {
        title: "Objetivo final",
        label: humanizeText(snapshot.finalObjective.label),
        support: snapshot.finalObjective.support
      },
      {
        title: "Pr\xF3xima sesi\xF3n",
        label: snapshot.nextSessionObjective.label,
        support: snapshot.nextSessionObjective.support
      },
      {
        title: "Objetivo del bloque",
        label: snapshot.currentBlockObjective.label,
        support: snapshot.currentBlockObjective.support
      }
    ];
    container.innerHTML = `
    <div class="summary-grid">
      ${cards.map((card) => `
        <article class="stat-block metric-card">
          <p class="section-kicker">${escapeHtml(card.title)}</p>
          <h3>${escapeHtml(formatUiText(card.label))}</h3>
          <p class="muted">${escapeHtml(formatUiText(card.support))}</p>
        </article>
      `).join("")}
    </div>
  `;
  }
  function renderPerformanceData(container, snapshot) {
    if (!snapshot) {
      container.innerHTML = '<div class="empty-note">Todav\xEDa no hay datos suficientes.</div>';
      return;
    }
    container.innerHTML = `
    <div class="summary-grid">
      ${snapshot.currentData.map((item) => `
        <article class="stat-block">
          <p class="section-kicker">${escapeHtml(item.label)}</p>
          <h3 class="data-value">${escapeHtml(formatUiText(item.value))}</h3>
          <p class="muted">${escapeHtml(formatUiText(item.note))}</p>
        </article>
      `).join("")}
    </div>
  `;
  }
  function renderExerciseRecords(container, records) {
    if (!records || records.length === 0) {
      container.innerHTML = '<div class="empty-note">Aun no hay ejercicios suficientes para mostrar records actuales.</div>';
      return;
    }
    container.innerHTML = `
    <div class="records-grid">
      ${records.map((record) => `
        <article class="record-card">
          <div class="record-card-header">
            <div>
              <h3>${escapeHtml(buildExerciseCardTitle(record))}</h3>
              <p class="muted">${escapeHtml(formatUiText(record.pattern || "sin_patron"))} | ${escapeHtml(record.effortType === "isometric_hold" ? "Hold Isom\xE9trico" : `RM ${startCase(formatRmSourceType(record.rmSourceType))}`)}</p>
            </div>
            <span class="pill">${escapeHtml(record.recordLabel)}</span>
          </div>
          <div class="record-highlight-grid">
            ${record.effortType === "isometric_hold" ? buildRecordDatum("Capacidad Actual", record.capacityLabel || "Sin Dato", { tone: "accent" }) : buildRecordDatum("RM Actual", formatKgValue(record.currentRmKg), { tone: "accent" })}
            ${record.effortType === "isometric_hold" ? buildRecordDatum("Objetivo Pr\xF3xima Sesi\xF3n", record.nextTargetLabel || "Sin Objetivo", { tone: "success" }) : buildRecordDatum("RM Confirmado", formatKgValue(record.confirmedRmKg), { tone: "success" })}
            ${record.effortType === "isometric_hold" ? buildRecordDatum("Regla Aplicada", record.progressionReason || "Sin Regla", { full: true }) : buildRecordDatum("RM Te\xF3rico", formatKgValue(record.theoreticalRmKg))}
            ${record.effortType === "isometric_hold" ? "" : buildRecordDatum("Objetivo Pr\xF3xima Sesi\xF3n", record.nextTargetLabel || "Sin Objetivo", { full: true, tone: "accent" })}
            ${buildRecordDatum(record.effortType === "isometric_hold" ? "Mejor Hold" : "Mejor Set", buildBestSetLabel(record.bestSet), { full: true })}
          </div>
          <div class="record-metrics-grid">
            ${buildRecordDatum("Exposiciones", record.occurrences, { tone: "soft" })}
            ${buildRecordDatum("Sets Acumulados", record.totalSets, { tone: "soft" })}
            ${buildRecordDatum("Dolor Medio", `${formatDecimal(record.avgPain)}/10`, { tone: "soft" })}
            ${buildRecordDatum(
      record.effortType === "isometric_hold" ? "Tiempo Del Mejor Hold" : "Reps Estimadas Al Fallo",
      record.effortType === "isometric_hold" ? record.durationSeconds ? `${record.durationSeconds} S` : "Sin Dato" : record.estimatedFailureReps || "Sin Dato",
      { tone: "soft" }
    )}
            ${record.effortType === "isometric_hold" ? "" : buildRecordDatum("Regla", record.progressionReason || "Sin Regla", { full: true, tone: "soft" })}
            ${buildRecordDatum("Ultima Vez", record.lastSeenDate || "Sin Fecha", { tone: "soft" })}
          </div>
        </article>
      `).join("")}
    </div>
  `;
  }

  // src/app.js
  var elements = {
    statusLine: document.querySelector("#status-line"),
    modeBadge: document.querySelector("#mode-badge"),
    sourceBadge: document.querySelector("#source-badge"),
    heroPainValue: document.querySelector("#hero-pain-value"),
    heroReadinessValue: document.querySelector("#hero-readiness-value"),
    heroFocusValue: document.querySelector("#hero-focus-value"),
    screenIndicator: document.querySelector("#screen-indicator"),
    toggleScreenButton: document.querySelector("#toggle-screen-button"),
    startSessionButton: document.querySelector("#start-session-button"),
    viewHistoryButton: document.querySelector("#view-history-button"),
    viewRecordsButton: document.querySelector("#view-records-button"),
    mainScreen: document.querySelector("#main-screen"),
    performanceScreen: document.querySelector("#performance-screen"),
    historyPanel: document.querySelector("#history-panel"),
    checkinPanel: document.querySelector("#checkin-panel"),
    sessionLogPanel: document.querySelector("#session-log-panel"),
    recordsPanel: document.querySelector("#records-panel"),
    profileSummary: document.querySelector("#profile-summary"),
    contextSummary: document.querySelector("#context-summary"),
    recommendationShell: document.querySelector("#recommendation-shell"),
    scoringShell: document.querySelector("#scoring-shell"),
    postSessionShell: document.querySelector("#post-session-shell"),
    weeklyDashboard: document.querySelector("#weekly-dashboard"),
    sessionHistory: document.querySelector("#session-history"),
    performanceGoals: document.querySelector("#performance-goals"),
    performanceData: document.querySelector("#performance-data"),
    simulationRoutes: document.querySelector("#simulation-routes"),
    exerciseRecords: document.querySelector("#exercise-records"),
    recommendButton: document.querySelector("#recommend-button"),
    checkinForm: document.querySelector("#checkin-form"),
    sessionForm: document.querySelector("#session-form"),
    addExerciseRowButton: document.querySelector("#add-exercise-row"),
    exerciseRows: document.querySelector("#exercise-rows"),
    checkinDate: document.querySelector("#checkin-date"),
    checkinBodyweight: document.querySelector("#checkin-bodyweight"),
    checkinSleep: document.querySelector("#checkin-sleep"),
    checkinReadiness: document.querySelector("#checkin-readiness"),
    checkinTime: document.querySelector("#checkin-time"),
    checkinPlanned: document.querySelector("#checkin-planned"),
    checkinMedialPain: document.querySelector("#checkin-medial-pain"),
    checkinGlobalFatigue: document.querySelector("#checkin-global-fatigue"),
    checkinForearmFatigue: document.querySelector("#checkin-forearm-fatigue"),
    checkinBackFatigue: document.querySelector("#checkin-back-fatigue"),
    checkinLegsFatigue: document.querySelector("#checkin-legs-fatigue"),
    sessionDate: document.querySelector("#session-date"),
    sessionType: document.querySelector("#session-type"),
    sessionGoal: document.querySelector("#session-goal"),
    sessionRpe: document.querySelector("#session-rpe"),
    sessionBestPattern: document.querySelector("#session-best-pattern"),
    sessionBestGrip: document.querySelector("#session-best-grip"),
    sessionMainLimitation: document.querySelector("#session-main-limitation"),
    sessionMedialPain: document.querySelector("#session-medial-pain"),
    sessionCouldStop: document.querySelector("#session-could-stop"),
    sessionCouldMove: document.querySelector("#session-could-move"),
    sessionCouldFinish: document.querySelector("#session-could-finish")
  };
  var state = {
    data: null,
    meta: null,
    strictConfig: null,
    simulationCycle: null,
    ippCycle: null,
    listenersBound: false,
    initError: "",
    lastSavedSessionId: null,
    currentScreen: "main",
    syncStatus: "Conectando con la base de datos local...",
    sessionCaptureVisible: false
  };
  function todayText() {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  function buildOptions(options, formatter) {
    return options.map((option) => formatter(option)).join("");
  }
  function buildPatternOptionMarkup(selectedValue = "") {
    return `
    <option value="" ${selectedValue === "" ? "selected" : ""}>Selecciona patr\xF3n</option>
    ${buildOptions(exercisePatternOptions, (pattern) => `<option value="${pattern}" ${selectedValue === pattern ? "selected" : ""}>${patternLabels[pattern] || pattern}</option>`)}
  `;
  }
  function buildCategoryOptionMarkup(selectedValue = "specific_aw") {
    return buildOptions(Object.entries(exerciseCategoryLabels), ([value, label]) => `<option value="${value}" ${selectedValue === value ? "selected" : ""}>${label}</option>`);
  }
  function buildSideOptionMarkup(selectedValue = "right") {
    return buildOptions(exerciseSideOptions, (option) => `<option value="${option.value}" ${selectedValue === option.value ? "selected" : ""}>${option.label}</option>`);
  }
  function createExerciseRow(entry = {}) {
    const row = document.createElement("article");
    row.className = "exercise-row";
    row.innerHTML = `
    <div class="exercise-row-header">
      <h3>Ejercicio</h3>
      <button class="button button-ghost button-small remove-exercise-row" type="button">Quitar</button>
    </div>
    <div class="exercise-grid">
      <label class="field field-span-2">
        <span>Nombre del ejercicio</span>
        <input name="exercise_name" type="text" value="${entry.exercise_name || ""}" placeholder="rising_dinamico_correa_pulgar" required>
      </label>

      <label class="field">
        <span>Categor\xEDa</span>
        <select name="category">
          ${buildCategoryOptionMarkup(entry.category || "specific_aw")}
        </select>
      </label>

      <label class="field">
        <span>Patr\xF3n</span>
        <select name="pattern" required>
          ${buildPatternOptionMarkup(entry.pattern || "")}
        </select>
      </label>

      <label class="field">
        <span>Lado</span>
        <select name="side">
          ${buildSideOptionMarkup(entry.side || "right")}
        </select>
      </label>

      <label class="field">
        <span>Carga</span>
        <input name="load" type="number" min="0" step="0.5" value="${entry.load ?? 0}">
      </label>

      <label class="field">
        <span>Unidad</span>
        <select name="load_unit">
          <option value="kg" ${(entry.load_unit || "kg") === "kg" ? "selected" : ""}>kg</option>
          <option value="lbs" ${(entry.load_unit || "kg") === "lbs" ? "selected" : ""}>lbs</option>
          <option value="bodyweight" ${(entry.load_unit || "kg") === "bodyweight" ? "selected" : ""}>bodyweight</option>
          <option value="table" ${(entry.load_unit || "kg") === "table" ? "selected" : ""}>table</option>
          <option value="seconds" ${(entry.load_unit || "kg") === "seconds" ? "selected" : ""}>seconds</option>
        </select>
      </label>

      <label class="field">
        <span>Tipo de esfuerzo</span>
        <select name="effort_type">
          <option value="dynamic" ${(entry.effort_type || "dynamic") === "dynamic" ? "selected" : ""}>Din\xE1mico</option>
          <option value="isometric_hold" ${(entry.effort_type || "dynamic") === "isometric_hold" ? "selected" : ""}>Hold isom\xE9trico</option>
        </select>
      </label>

      <label class="field">
        <span>Sets</span>
        <input name="sets" type="number" min="1" step="1" value="${entry.sets ?? 4}" required>
      </label>

      <label class="field">
        <span>Reps</span>
        <input name="reps" type="number" min="1" step="1" value="${entry.reps ?? 6}" required>
      </label>

      <label class="field">
        <span>Tiempo por hold (s)</span>
        <input name="duration_seconds" type="number" min="0" step="1" value="${entry.duration_seconds ?? 0}">
      </label>

      <label class="field">
        <span>RPE</span>
        <input name="rpe" type="number" min="0" max="10" step="0.5" value="${entry.rpe ?? 7}" required>
      </label>

      <label class="field">
        <span>Dolor</span>
        <input name="pain_during" type="number" min="0" max="10" step="1" value="${entry.pain_during ?? 0}" required>
      </label>

      <label class="field">
        <span>Calidad vectorial</span>
        <input name="vector_quality" type="number" min="0" max="1" step="0.05" value="${entry.vector_quality ?? 0.8}" required>
      </label>

      <label class="field">
        <span>Calidad t\xE9cnica</span>
        <input name="technique_quality" type="number" min="0" max="1" step="0.05" value="${entry.technique_quality ?? 0.8}" required>
      </label>

      <label class="field field-span-4">
        <span>Notas</span>
        <textarea name="notes" placeholder="sin colapso de nudillos, buen freno inicial, dolor estable...">${entry.notes || ""}</textarea>
      </label>

      <label class="toggle field field-span-4">
        <input name="confirmed_rm" type="checkbox" ${entry.confirmed_rm ? "checked" : ""}>
        <span>Esta entrada incluye un RM confirmado real a 1 repetici\xF3n</span>
      </label>
    </div>
  `;
    return row;
  }
  function renumberExerciseRows() {
    Array.from(elements.exerciseRows.querySelectorAll(".exercise-row")).forEach((row, index) => {
      const title = row.querySelector("h3");
      title.textContent = `Ejercicio ${index + 1}`;
    });
  }
  function resetExerciseRows(entries = []) {
    elements.exerciseRows.innerHTML = "";
    if (entries.length > 0) {
      entries.forEach((entry) => elements.exerciseRows.appendChild(createExerciseRow(entry)));
    } else {
      elements.exerciseRows.appendChild(createExerciseRow());
    }
    renumberExerciseRows();
  }
  function addExerciseRow(entry = {}) {
    elements.exerciseRows.appendChild(createExerciseRow(entry));
    renumberExerciseRows();
  }
  function fillCheckinForm(checkin) {
    const active = checkin || {
      date: todayText(),
      bodyweight: 80,
      sleep_hours: 7,
      readiness: 7,
      available_time_min: 90,
      session_type_planned: "specific_aw",
      pain: { medial_elbow_right: 0 },
      fatigue: { global: 5, forearm_hand: 5, back: 3, legs: 3 }
    };
    elements.checkinDate.value = active.date;
    elements.checkinBodyweight.value = active.bodyweight;
    elements.checkinSleep.value = active.sleep_hours;
    elements.checkinReadiness.value = active.readiness;
    elements.checkinTime.value = active.available_time_min;
    elements.checkinPlanned.value = active.session_type_planned;
    elements.checkinMedialPain.value = active.pain.medial_elbow_right;
    elements.checkinGlobalFatigue.value = active.fatigue.global;
    elements.checkinForearmFatigue.value = active.fatigue.forearm_hand;
    elements.checkinBackFatigue.value = active.fatigue.back;
    elements.checkinLegsFatigue.value = active.fatigue.legs;
  }
  function fillSessionForm() {
    elements.sessionDate.value = todayText();
    elements.sessionType.value = "mesa_sparring";
    elements.sessionGoal.value = "";
    elements.sessionRpe.value = "7";
    elements.sessionBestPattern.value = "";
    elements.sessionBestGrip.value = "";
    elements.sessionMainLimitation.value = "";
    elements.sessionMedialPain.value = "0";
    elements.sessionCouldStop.checked = false;
    elements.sessionCouldMove.checked = false;
    elements.sessionCouldFinish.checked = false;
    resetExerciseRows();
  }
  function readCheckinForm() {
    return {
      date: elements.checkinDate.value,
      sleep_hours: Number(elements.checkinSleep.value),
      readiness: Number(elements.checkinReadiness.value),
      bodyweight: Number(elements.checkinBodyweight.value),
      pain: {
        medial_elbow_right: Number(elements.checkinMedialPain.value),
        lateral_elbow_right: 0,
        shoulder_right: 0,
        wrist_right: 0
      },
      fatigue: {
        global: Number(elements.checkinGlobalFatigue.value),
        forearm_hand: Number(elements.checkinForearmFatigue.value),
        back: Number(elements.checkinBackFatigue.value),
        legs: Number(elements.checkinLegsFatigue.value)
      },
      available_time_min: Number(elements.checkinTime.value),
      session_type_planned: elements.checkinPlanned.value
    };
  }
  function readSessionFormBase() {
    const date = elements.sessionDate.value;
    const medialPain = Number(elements.sessionMedialPain.value);
    const nextIndex = state.data.sessions.filter((session) => session.date === date).length + 1;
    return {
      session_id: createSessionId(date, elements.sessionType.value, nextIndex),
      date,
      session_type: elements.sessionType.value,
      goal_of_session: elements.sessionGoal.value.trim() || "sin_objetivo_especificado",
      effort_rpe_session: Number(elements.sessionRpe.value),
      results: {
        best_pattern: elements.sessionBestPattern.value.trim(),
        best_grip_condition: elements.sessionBestGrip.value.trim(),
        main_limitation: elements.sessionMainLimitation.value.trim(),
        could_stop: elements.sessionCouldStop.checked,
        could_move: elements.sessionCouldMove.checked,
        could_finish: elements.sessionCouldFinish.checked
      },
      pain_events: medialPain > 0 ? [
        {
          zone: "medial_elbow_right",
          type: medialPain >= 5 ? "pain_spike" : "irritability",
          severity: medialPain,
          during: elements.sessionType.value,
          resolved_with: "not_recorded"
        }
      ] : []
    };
  }
  function readExerciseRows(sessionId, date) {
    return Array.from(elements.exerciseRows.querySelectorAll(".exercise-row")).map((row, index) => ({
      entry_id: createExerciseEntryId(sessionId, index + 1),
      session_id: sessionId,
      date,
      exercise_name: row.querySelector('[name="exercise_name"]').value.trim(),
      category: row.querySelector('[name="category"]').value,
      pattern: row.querySelector('[name="pattern"]').value,
      side: row.querySelector('[name="side"]').value,
      load: Number(row.querySelector('[name="load"]').value || 0),
      load_unit: row.querySelector('[name="load_unit"]').value,
      effort_type: row.querySelector('[name="effort_type"]').value,
      sets: Number(row.querySelector('[name="sets"]').value),
      reps: Number(row.querySelector('[name="reps"]').value),
      duration_seconds: Number(row.querySelector('[name="duration_seconds"]').value || 0),
      rpe: Number(row.querySelector('[name="rpe"]').value),
      pain_during: Number(row.querySelector('[name="pain_during"]').value),
      vector_quality: Number(row.querySelector('[name="vector_quality"]').value),
      technique_quality: Number(row.querySelector('[name="technique_quality"]').value),
      confirmed_rm: row.querySelector('[name="confirmed_rm"]').checked,
      notes: row.querySelector('[name="notes"]').value.trim()
    }));
  }
  function getFeaturedSession() {
    if (!state.data) {
      return null;
    }
    if (state.lastSavedSessionId) {
      return state.data.sessions.find((session) => session.session_id === state.lastSavedSessionId) || null;
    }
    return getLatestSession(state.data);
  }
  function isStrictMode() {
    return state.meta?.mode === "strict";
  }
  function getStrictPlan() {
    return state.strictConfig?.strict_next_session_plan || state.simulationCycle?.strictConfig?.strict_next_session_plan || null;
  }
  function buildAdaptivePerformanceSnapshot(profile, latestCheckin, latestSession, adaptiveRecommendation, realState, records = []) {
    const targetWeight = Number(profile?.bodyweight_class_target_kg || 0);
    const nextSession = adaptiveRecommendation?.nextSessionRecommendation || {};
    const currentBlock = adaptiveRecommendation?.currentBlockRecommendation || null;
    const primaryRoute = adaptiveRecommendation?.primaryRoute || null;
    const contingencyRoute = adaptiveRecommendation?.contingencyRoute || null;
    const firstExercise = nextSession.primaryExercises?.[0] || null;
    return {
      finalObjective: {
        label: profile?.primary_goal || "",
        support: targetWeight > 0 ? `${targetWeight} kg objetivo competitivo` : "Sin clase objetivo"
      },
      nextSessionObjective: {
        label: nextSession.sessionLabel || "Sin Sesi\xF3n Definida",
        support: firstExercise ? `${firstExercise.exerciseName}: ${firstExercise.target}` : "Sin ejercicio ancla"
      },
      currentBlockObjective: {
        label: currentBlock?.suggestedBlockLabel || "Sin bloque activo",
        support: currentBlock?.scenarioLabel ? `Escenario: ${currentBlock.scenarioLabel}` : latestSession ? `\xDAltima sesi\xF3n: ${latestSession.session_type || "sin tipo"}` : "Sin sesi\xF3n reciente"
      },
      currentData: [
        {
          label: "Modo",
          value: "Estricto",
          note: "Sin fallback a semilla"
        },
        {
          label: "Fuente",
          value: "SQLite",
          note: "Persistida y verificada"
        },
        {
          label: "Data Confidence",
          value: realState ? String(realState.dataConfidence) : "Sin Dato",
          note: realState ? `Model ${realState.modelConfidence} | Context ${realState.contextConfidence}` : "Sin simulaci\xF3n"
        },
        {
          label: "Continuidad",
          value: realState ? String(realState.continuityScore) : "Sin Dato",
          note: realState?.riskFlags?.includes("low_session_continuity") ? "Hoy la continuidad sigue siendo el freno principal" : "Sin alarma dominante de continuidad"
        },
        {
          label: "Tejido",
          value: realState ? `Medial ${realState.tissueState.medialPain}/10` : "Sin Dato",
          note: realState ? `Irritabilidad ${realState.tissueState.tissueIrritability} | Antebrazo ${realState.tissueState.forearmFatigue}` : "Sin tejido"
        },
        {
          label: "Ruta Principal",
          value: primaryRoute ? primaryRoute.label : "Sin Ruta",
          note: primaryRoute ? `Score ${primaryRoute.totalScore} | Robustez ${primaryRoute.route?.predictedSummary?.routeRobustness ?? "-"}` : "Sin ranking"
        },
        {
          label: "Ruta Contingencia",
          value: contingencyRoute ? contingencyRoute.label : "Sin Ruta",
          note: contingencyRoute ? `Tejido ${contingencyRoute.scoreBreakdown?.tissueSustainability ?? "-"} | Robustez ${contingencyRoute.scoreBreakdown?.continuityRobustness ?? "-"}` : "Sin contingencia"
        },
        {
          label: "Ultimo Check-In",
          value: latestCheckin?.date || "Sin Dato",
          note: latestCheckin ? `Readiness ${latestCheckin.readiness}/10 | Dolor ${latestCheckin?.pain?.medial_elbow_right || 0}/10` : "Sin check-in vigente"
        }
      ],
      records
    };
  }
  function setCurrentScreen(screenName) {
    state.currentScreen = screenName;
    const showingPerformance = screenName === "performance";
    elements.mainScreen.classList.toggle("screen-hidden", showingPerformance);
    elements.performanceScreen.classList.toggle("screen-hidden", !showingPerformance);
    if (elements.screenIndicator) {
      elements.screenIndicator.textContent = showingPerformance ? "Pantalla actual: rendimiento" : "Pantalla actual: panel principal";
    }
    if (elements.toggleScreenButton) {
      elements.toggleScreenButton.textContent = showingPerformance ? "Volver al panel principal" : "Ver pantalla de rendimiento";
    }
  }
  function setSessionCaptureVisible(visible) {
    state.sessionCaptureVisible = visible;
    [elements.checkinPanel, elements.sessionLogPanel].forEach((panel) => {
      if (!panel) {
        return;
      }
      panel.classList.toggle("panel-collapsed", !visible);
    });
  }
  function highlightPanel(panel) {
    if (!panel) {
      return;
    }
    panel.classList.remove("panel-spotlight");
    void panel.offsetWidth;
    panel.classList.add("panel-spotlight");
    window.setTimeout(() => {
  function safeRender(block) {
    try {
      return block();
    } catch (error) {
      console.error("Fallo de render protegido.", error);
      return false;
    }
  }

      panel.classList.remove("panel-spotlight");
    }, 1400);
  }
  function navigateToPanel(screenName, panel, focusElement) {
    setCurrentScreen(screenName);
    window.requestAnimationFrame(() => {
  function safeRender(block) {
    try {
      return block();
    } catch (error) {
      console.error("Fallo de render protegido.", error);
      return false;
    }
  }

      window.requestAnimationFrame(() => {
  function safeRender(block) {
    try {
      return block();
    } catch (error) {
      console.error("Fallo de render protegido.", error);
      return false;
    }
  }

        if (panel) {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
          highlightPanel(panel);
        }
        if (focusElement && typeof focusElement.focus === "function") {
          window.setTimeout(() => {
  function safeRender(block) {
    try {
      return block();
    } catch (error) {
      console.error("Fallo de render protegido.", error);
      return false;
    }
  }

            focusElement.focus({ preventScroll: true });
          }, 220);
        }
      });
    });
  }
  function handleStartSessionProgrammed() {
    setSessionCaptureVisible(true);
    navigateToPanel("main", elements.checkinPanel, elements.checkinDate);
  }
  function handleViewHistory() {
    setSessionCaptureVisible(false);
    navigateToPanel("main", elements.historyPanel);
  }
  function handleViewRecords() {
    setSessionCaptureVisible(false);
    navigateToPanel("performance", elements.recordsPanel || elements.performanceGoals);
  }
  async function hydrateStrictArtifacts() {
    if (state.meta?.mode !== "strict" || !state.meta?.strictAvailable) {
    state.strictConfig = null;
    state.simulationCycle = null;
    state.ippCycle = null;
    return;
  }

  const strictConfig = await loadStrictConfig();
  let simulationCycle = null;
  let ippCycle = null;

  try {
    simulationCycle = await loadSimulationCycle();
  } catch (error) {
    console.warn("No fue posible cargar el ciclo de simulaciÃ³n desde el servidor. Se usarÃ¡ el fallback local.", error);
  }

  try {
    ippCycle = await loadIPPCycle();
  } catch (error) {
    console.warn("No fue posible cargar IPP1 desde el servidor.", error);
  }

  state.strictConfig = strictConfig;
  state.simulationCycle = simulationCycle;
  state.ippCycle = ippCycle;
}
  
  function renderUnavailableState(message) {
    const note = `<div class="empty-note">${message}</div>`;
    if (elements.profileSummary) {
      elements.profileSummary.innerHTML = note;
    }
    if (elements.contextSummary) {
      elements.contextSummary.innerHTML = note;
    }
    if (elements.recommendationShell) {
      elements.recommendationShell.innerHTML = note;
    }
    if (elements.scoringShell) {
      elements.scoringShell.innerHTML = "";
    }
    if (elements.performanceGoals) {
      elements.performanceGoals.innerHTML = note;
    }
    if (elements.performanceData) {
      elements.performanceData.innerHTML = note;
    }
    if (elements.exerciseRecords) {
      elements.exerciseRecords.innerHTML = note;
    }
    if (elements.simulationRoutes) {
      elements.simulationRoutes.innerHTML = note;
    }
    if (elements.sessionHistory) {
      elements.sessionHistory.innerHTML = note;
    }
    if (elements.postSessionShell) {
      elements.postSessionShell.innerHTML = note;
    }
    if (elements.weeklyDashboard) {
      elements.weeklyDashboard.innerHTML = note;
    }
  }
  function buildFriendlyInitError(error) {
    const detail = String(error?.message || "").trim();
    if (!detail) {
      return "No fue posible iniciar la app.";
    }
    return detail;
  }
  function renderApp() {
    const strictMode = isStrictMode();
    const strictPlan = getStrictPlan();
    const simulationCycle = strictMode ? state.simulationCycle : null;
    if (!state.data || !state.data.athleteProfile) {
      renderUnavailableState(state.initError || "No fue posible cargar datos desde SQLite.");
      if (elements.heroPainValue) {
        elements.heroPainValue.textContent = "Sin Dato";
      }
      if (elements.heroReadinessValue) {
        elements.heroReadinessValue.textContent = "Sin Dato";
      }
      if (elements.heroFocusValue) {
        elements.heroFocusValue.textContent = strictMode ? "Strict" : "Sin Foco";
      }
      if (elements.modeBadge) {
        elements.modeBadge.textContent = strictMode ? "Modo Estricto" : "Modo Demo";
      }
      if (elements.sourceBadge) {
        elements.sourceBadge.textContent = "Fuente No Disponible";
      }
      elements.statusLine.textContent = state.syncStatus;
      setSessionCaptureVisible(state.sessionCaptureVisible);
      setCurrentScreen(state.currentScreen);
      return;
    }
    const latestCheckin = getLatestCheckin(state.data);
    const latestSession = getLatestSession(state.data);
    const context = latestCheckin ? buildCurrentState(state.data.athleteProfile, state.data.sessions, latestCheckin, state.data.exerciseEntries) : null;
    const fallbackRealState = strictMode ? buildRealState({
      athleteProfile: state.data.athleteProfile,
      checkins: state.data.dailyCheckins,
      sessions: state.data.sessions,
      exerciseEntries: state.data.exerciseEntries,
      exerciseRecords: state.data.exerciseRecords,
      nowDate: latestCheckin?.date || latestSession?.date || todayText()
    }) : null;
    const realState = strictMode ? simulationCycle?.realState || fallbackRealState : null;
    const candidateRoutes = strictMode ? simulationCycle?.candidateRoutes || (realState ? buildCandidateRoutes({ realState, horizonWeeks: 24 }) : []) : [];
    const scoredRoutes = strictMode ? simulationCycle?.scoredRoutes || scoreRoutes(candidateRoutes) : [];
    const adaptiveRecommendation = strictMode ? simulationCycle?.recommendation || buildAdaptiveRecommendation({
      realState,
      strictSessionPlan: strictPlan,
      scoredRoutes
    }) : null;
    const heuristicRecommendation = !strictMode && latestCheckin ? recommendSession(state.data.athleteProfile, state.data.sessions, latestCheckin, state.data.exerciseEntries) : null;
    const recommendation = strictMode ? adaptiveRecommendation : heuristicRecommendation;
    const featuredSession = getFeaturedSession();
    const postSessionInsight = !strictMode && featuredSession ? buildSessionInsight(state.data.athleteProfile, featuredSession, state.data.exerciseEntries) : null;
    const weeklyDashboard = !strictMode ? buildWeeklyDashboard(
      state.data.athleteProfile,
      state.data.dailyCheckins,
      state.data.sessions,
      state.data.exerciseEntries,
      latestCheckin?.date || todayText()
    ) : null;
    const performanceSnapshot = strictMode ? buildAdaptivePerformanceSnapshot(
      state.data.athleteProfile,
      latestCheckin,
      latestSession,
      adaptiveRecommendation,
      realState,
      state.data.exerciseRecords
    ) : buildPerformanceSnapshot(
      state.data.athleteProfile,
      latestCheckin,
      context,
      recommendation,
      weeklyDashboard,
      postSessionInsight,
      state.data.exerciseEntries,
      state.data.exerciseRecords
    );
    renderProfileSummary(elements.profileSummary, state.data.athleteProfile);
    renderContextSummary(elements.contextSummary, context, {
      sessions: state.data.sessions,
      exerciseEntries: state.data.exerciseEntries
    });

    const adaptivePayload =
      adaptiveRecommendation ||
      simulationCycle?.recommendation ||
      null;

    const hasAdaptiveRecommendation = Boolean(
      adaptivePayload?.nextSessionRecommendation
    );

    if (hasAdaptiveRecommendation) {
  safeRender(() => {
    renderAdaptiveRecommendation(
      elements.recommendationShell,
      elements.scoringShell,
      adaptivePayload
    );
    return true;
  }) || (elements.recommendationShell.innerHTML = '<div class="empty-note">No fue posible renderizar la recomendación adaptativa.</div>');
} else {
  safeRender(() => {
    renderRecommendation(
      elements.recommendationShell,
      elements.scoringShell,
      recommendation
    );
    return true;
  }) || (elements.recommendationShell.innerHTML = '<div class="empty-note">No fue posible renderizar la recomendación.</div>');
}

    if (elements.postSessionShell) {
      renderPostSessionInsight(elements.postSessionShell, postSessionInsight);
    }
    if (elements.weeklyDashboard) {
      renderWeeklyDashboard(elements.weeklyDashboard, weeklyDashboard);
    }
    if (elements.sessionHistory) {
      if (strictMode) {
        elements.sessionHistory.innerHTML = "";
      } else {
        renderSessionHistory(elements.sessionHistory, state.data.sessions, state.data.exerciseEntries);
      }
    }
    if (elements.simulationRoutes) {
  safeRender(() => {
    renderSimulationRoutes(elements.simulationRoutes, adaptivePayload);
    return true;
  }) || (elements.simulationRoutes.innerHTML = '<div class="empty-note">No fue posible renderizar las rutas simuladas.</div>');
}
    renderPerformanceGoals(elements.performanceGoals, performanceSnapshot);
    renderPerformanceData(elements.performanceData, performanceSnapshot);
    renderExerciseRecords(elements.exerciseRecords, performanceSnapshot.records);
    if (elements.heroPainValue) {
      elements.heroPainValue.textContent = context ? `${context.medialPainToday}/10` : "Sin Dato";
    }
    if (elements.heroReadinessValue) {
      elements.heroReadinessValue.textContent = context ? `${context.readiness}/10` : "Sin Dato";
    }
    if (elements.heroFocusValue) {
      elements.heroFocusValue.textContent = strictMode ? adaptiveRecommendation?.currentBlockRecommendation?.suggestedBlockLabel || adaptiveRecommendation?.nextSessionRecommendation?.sessionLabel || "Sin Foco" : recommendation?.session_recommendation?.label || "Sin Foco";
    }
    if (elements.modeBadge) {
      elements.modeBadge.textContent = strictMode ? "Modo Estricto" : "Modo Demo";
    }
    if (elements.sourceBadge) {
      const source = state.data?.storage?.source === "seed" ? "Fuente Seed" : "Fuente SQLite";
      elements.sourceBadge.textContent = source;
    }
    elements.statusLine.textContent = state.syncStatus;
    setSessionCaptureVisible(state.sessionCaptureVisible);
    setCurrentScreen(state.currentScreen);
  }
  function updateSyncStatusFromData() {
    if (state.initError) {
      state.syncStatus = state.initError;
      return;
    }
    if (window.location.protocol === "file:") {
      state.syncStatus = "Usa .\\serve.ps1 para activar SQLite.";
      return;
    }
    if (state.data?.storage?.source === "sqlite") {
      const syncTime = state.data?.storage?.lastSyncAt ? new Date(state.data.storage.lastSyncAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : null;
      const modeLabel = isStrictMode() ? "Modo estricto" : "Modo demo";
const simulationLabel = isStrictMode() && state.simulationCycle ? " | ciclo adaptativo listo" : "";
const ippLabel = isStrictMode() && state.ippCycle ? " | IPP1 listo" : "";
state.syncStatus = syncTime
  ? `${modeLabel} | SQLite | ${syncTime}${simulationLabel}${ippLabel}`
  : `${modeLabel} | SQLite activa${simulationLabel}${ippLabel}`;
return;
    }
    state.syncStatus = "Modo demo | Seed temporal";
  }
  async function handleCheckinSubmit(event) {
    event.preventDefault();
    try {
      state.data = await saveCheckin(readCheckinForm());
      state.meta = await loadServerMeta();
      await hydrateStrictArtifacts();
      state.initError = "";
      updateSyncStatusFromData();
      renderApp();
    } catch (error) {
      console.error("No fue posible guardar el check-in.", error);
      state.initError = "";
      state.syncStatus = `Error al guardar check-in: ${error.message}`;
      renderApp();
    }
  }
  async function handleSessionSubmit(event) {
    event.preventDefault();
    const baseSession = readSessionFormBase();
    const exerciseEntries = readExerciseRows(baseSession.session_id, baseSession.date);
    const session = {
      ...baseSession,
      exercise_entry_count: exerciseEntries.length
    };
    try {
      state.data = await saveSession(session, exerciseEntries);
      state.lastSavedSessionId = session.session_id;
      state.meta = await loadServerMeta();
      await hydrateStrictArtifacts();
      state.initError = "";
      updateSyncStatusFromData();
      fillSessionForm();
      renderApp();
    } catch (error) {
      console.error("No fue posible guardar la sesi\xF3n.", error);
      state.initError = "";
      state.syncStatus = `Error al guardar sesi\xF3n: ${error.message}`;
      renderApp();
    }
  }
  function handleExerciseRowClick(event) {
    const removeButton = event.target.closest(".remove-exercise-row");
    if (!removeButton) {
      return;
    }
    const row = removeButton.closest(".exercise-row");
    if (row) {
      row.remove();
    }
    if (elements.exerciseRows.children.length === 0) {
      addExerciseRow();
    }
    renumberExerciseRows();
  }
  function handleToggleScreen() {
    setCurrentScreen(state.currentScreen === "main" ? "performance" : "main");
  }
  async function hydrateData() {
    state.meta = await loadServerMeta();
    state.data = await loadAppData(state.meta);
    await hydrateStrictArtifacts();
    state.initError = "";
    updateSyncStatusFromData();
  }
  function bindEventListeners() {
    if (state.listenersBound) {
      return;
    }
    elements.checkinForm.addEventListener("submit", handleCheckinSubmit);
    elements.sessionForm.addEventListener("submit", handleSessionSubmit);
    elements.recommendButton.addEventListener("click", renderApp);
    elements.addExerciseRowButton.addEventListener("click", () => addExerciseRow());
    elements.exerciseRows.addEventListener("click", handleExerciseRowClick);
    if (elements.toggleScreenButton) {
      elements.toggleScreenButton.addEventListener("click", handleToggleScreen);
    }
    if (elements.startSessionButton) {
      elements.startSessionButton.addEventListener("click", handleStartSessionProgrammed);
    }
    if (elements.viewHistoryButton) {
      elements.viewHistoryButton.addEventListener("click", handleViewHistory);
    }
    if (elements.viewRecordsButton) {
      elements.viewRecordsButton.addEventListener("click", handleViewRecords);
    }
    state.listenersBound = true;
  }
  async function init() {
    bindEventListeners();
    fillCheckinForm();
    fillSessionForm();
    try {
      await hydrateData();
      fillCheckinForm(getLatestCheckin(state.data));
    } catch (error) {
      console.error("No fue posible iniciar la app.", error);
      state.meta = state.meta || {
        mode: "strict",
        strictAvailable: false
      };
      state.initError = buildFriendlyInitError(error);
      state.syncStatus = state.initError;
    }
    renderApp();
  }
  init();
})();








