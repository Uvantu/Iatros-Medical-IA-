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
  function clampNumber(value, min, max, fallback = 0) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, numeric));
  }
  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  }
  function buildCurrentState(athleteProfile, sessions, latestCheckin, exerciseEntries) {
    if (!latestCheckin) {
      return null;
    }
    const pain = Number(latestCheckin?.pain?.medial_elbow_right || 0);
    const readiness = Number(latestCheckin?.readiness || 0);
    const fatigueGlobal = Number(latestCheckin?.fatigue?.global || 0);
    const fatigueForearm = Number(latestCheckin?.fatigue?.forearm_hand || 0);
    const sessionGapDays = sessions?.length > 1 ? Math.max(0, Math.round((new Date(`${sessions[0].date}T12:00:00`) - new Date(`${sessions[1].date}T12:00:00`)) / 864e5)) : 2;
    const continuityConfidence = Math.max(0.15, Math.min(1, 1 - 0.12 * Math.max(0, sessionGapDays - 1)));
    return {
      athleteId: athleteProfile?.athlete_id || "unknown",
      date: latestCheckin.date,
      medialPainToday: pain,
      readiness,
      fatigueGlobal,
      fatigueForearm,
      availableTimeMin: Number(latestCheckin.available_time_min || 0),
      sessionGapDays,
      continuityConfidence,
      stableBase: Boolean(exerciseEntries?.length)
    };
  }
  function buildEntryStrengthMetrics(entry) {
    const load = Number(entry.load || 0);
    const reps = Number(entry.reps || 0);
    const duration = Number(entry.duration_seconds || 0);
    const effortType = entry.effort_type || "dynamic";
    const estimatedRmKg = effortType === "isometric_hold" ? null : round(load * (1 + reps / 30), 1);
    return {
      load,
      reps,
      durationSeconds: duration,
      effortType,
      estimatedRmKg,
      score: effortType === "isometric_hold" ? load * Math.max(1, duration / 20) : load * Math.max(1, reps)
    };
  }
  function buildExerciseRecords(exerciseEntries) {
    const byKey = /* @__PURE__ */ new Map();
    for (const entry of ensureArray(exerciseEntries)) {
      const metrics = buildEntryStrengthMetrics(entry);
      const key = `${safeLower(entry.exercise_name)}::${safeLower(entry.side)}`;
      const current = byKey.get(key);
      if (!current || metrics.score > current.score) {
        const recordLabel = metrics.effortType === "isometric_hold" ? `${formatDecimal(metrics.load, 1)} kg x ${metrics.durationSeconds} S` : `${formatDecimal(metrics.load, 1)} kg x ${metrics.reps} Reps`;
        let nextTargetLabel = recordLabel;
        let progressionAction = "hold";
        if (metrics.effortType === "isometric_hold") {
          progressionAction = metrics.durationSeconds >= 30 ? "increase" : "hold";
          nextTargetLabel = progressionAction === "increase" ? `${formatDecimal(metrics.load + 2.5, 1)} kg x 25 S` : `${formatDecimal(metrics.load, 1)} kg x ${metrics.durationSeconds + 5} S`;
        } else {
          progressionAction = metrics.reps >= 8 ? "increase" : "hold";
          nextTargetLabel = progressionAction === "increase" ? `${formatDecimal(metrics.load + 2.5, 1)} kg x ${Math.max(5, metrics.reps - 2)} Reps` : `${formatDecimal(metrics.load, 1)} kg x ${metrics.reps + 1} Reps`;
        }
        byKey.set(key, {
          exerciseName: entry.exercise_name,
          side: entry.side,
          recordLabel,
          nextTargetLabel,
          currentRmKg: metrics.estimatedRmKg,
          durationSeconds: metrics.durationSeconds,
          progressionAction,
          bestSet: {
            load: metrics.load,
            loadUnit: entry.load_unit || "kg",
            reps: metrics.reps,
            durationSeconds: metrics.durationSeconds,
            sets: Number(entry.sets || 1)
          },
          category: entry.category,
          pattern: entry.pattern,
          effortType: metrics.effortType,
          score: metrics.score
        });
      }
    }
    return Array.from(byKey.values()).sort((a, b) => safeLower(a.exerciseName).localeCompare(safeLower(b.exerciseName)) || safeLower(a.side).localeCompare(safeLower(b.side)));
  }
  function buildPerformanceSnapshot(athleteProfile, latestCheckin, context, recommendation, weeklyDashboard, postSessionInsight, exerciseEntries, exerciseRecords) {
    return {
      title: `${athleteProfile?.name || "Atleta"}`,
      subtitle: athleteProfile?.dominantGoal || "Sin objetivo",
      focus: weeklyDashboard?.recommendedFocus || recommendation?.session_recommendation?.label || "Sin foco",
      pain: latestCheckin?.pain?.medial_elbow_right || 0,
      readiness: latestCheckin?.readiness || 0,
      metrics: [
        { label: "Readiness", value: latestCheckin?.readiness || "Sin dato" },
        { label: "Dolor medial", value: `${latestCheckin?.pain?.medial_elbow_right || 0}/10` },
        { label: "Capturas 7d", value: weeklyDashboard?.metrics?.checkinDaysCaptured || 0 },
        { label: "Hueco max", value: weeklyDashboard?.metrics?.maxCheckinGapDays ? `${weeklyDashboard.metrics.maxCheckinGapDays} d` : "0 d" }
      ],
      records: exerciseRecords || buildExerciseRecords(exerciseEntries),
      context,
      recommendation,
      weeklyDashboard,
      postSessionInsight
    };
  }
  function buildAdaptivePerformanceSnapshot(athleteProfile, latestCheckin, latestSession, adaptiveRecommendation, realState, exerciseRecords) {
    return {
      title: athleteProfile?.name || "Atleta",
      subtitle: athleteProfile?.dominantGoal || "Sin objetivo",
      focus: adaptiveRecommendation?.currentBlockRecommendation?.suggestedBlockLabel || adaptiveRecommendation?.nextSessionRecommendation?.sessionLabel || "Sin foco",
      pain: latestCheckin?.pain?.medial_elbow_right || 0,
      readiness: latestCheckin?.readiness || 0,
      metrics: [
        { label: "Readiness", value: latestCheckin?.readiness || "Sin dato" },
        { label: "Dolor medial", value: `${latestCheckin?.pain?.medial_elbow_right || 0}/10` },
        { label: "Bloque", value: adaptiveRecommendation?.currentBlockRecommendation?.suggestedBlockLabel || "Sin bloque" },
        { label: "Continuidad", value: realState?.continuityConfidence ? formatDecimal(realState.continuityConfidence, 2) : "Sin dato" }
      ],
      records: exerciseRecords || []
    };
  }
  function buildSessionInsight(athleteProfile, session, exerciseEntries) {
    if (!session) {
      return null;
    }
    const sessionEntries = ensureArray(exerciseEntries).filter((entry) => entry.session_id === session.session_id);
    const avgPain = sessionEntries.length ? round(sessionEntries.reduce((total, entry) => total + Number(entry.pain_during || 0), 0) / sessionEntries.length, 1) : 0;
    return {
      title: formatUiText(session.session_type || "sesion"),
      date: session.date,
      overview: `La sesion dejo ${sessionEntries.length} ejercicios registrados y la limitacion dominante fue ${formatUiText(session?.results?.main_limitation || "sin dato")}.`,
      metrics: {
        totalSets: sessionEntries.reduce((total, entry) => total + Number(entry.sets || 0), 0),
        exerciseCount: sessionEntries.length,
        avgPain
      }
    };
  }
  function buildWeeklyDashboard(athleteProfile, dailyCheckins, sessions, exerciseEntries, nowDate) {
    const referenceDate = new Date(`${nowDate || todayText()}T12:00:00`);
    const weeklyCheckins = ensureArray(dailyCheckins).filter((entry) => Math.abs((referenceDate - new Date(`${entry.date}T12:00:00`)) / 864e5) <= 7);
    const avgMedialPain = weeklyCheckins.length ? round(weeklyCheckins.reduce((total, entry) => total + Number(entry?.pain?.medial_elbow_right || 0), 0) / weeklyCheckins.length, 1) : 0;
    const maxCheckinGapDays = weeklyCheckins.length < 2 ? 0 : weeklyCheckins.map((entry, index) => index === 0 ? 0 : Math.round((new Date(`${weeklyCheckins[index - 1].date}T12:00:00`) - new Date(`${entry.date}T12:00:00`)) / 864e5)).reduce((max, current) => Math.max(max, current), 0);
    const riskFlags = [];
    if (weeklyCheckins.length < 3) {
      riskFlags.push("faltan capturas recientes; el contexto ya pierde precision");
    }
    if (maxCheckinGapDays >= 4) {
      riskFlags.push("hay huecos grandes entre sesiones; la progresion puede sobreestimar continuidad");
    }
    if (avgMedialPain >= 3) {
      riskFlags.push("irritabilidad medial repetida esta semana");
    }
    const positiveSignals = [];
    if (weeklyCheckins.length >= 5) {
      positiveSignals.push("continuidad de captura util");
    }
    if (avgMedialPain < 2.5) {
      positiveSignals.push("dolor medial controlado");
    }
    return {
      recommendedFocus: avgMedialPain >= 3 ? "Recuperacion Y Tolerancia" : "Consolidacion Y Ataque",
      riskFlags,
      positiveSignals,
      metrics: {
        checkinDaysCaptured: weeklyCheckins.length,
        maxCheckinGapDays,
        avgMedialPain
      }
    };
  }
  function recommendSession(athleteProfile, sessions, latestCheckin, exerciseEntries) {
    const pain = Number(latestCheckin?.pain?.medial_elbow_right || 0);
    const readiness = Number(latestCheckin?.readiness || 0);
    const sessionLabel = pain >= 3 ? "Recuperacion Y Tolerancia" : readiness >= 7 ? "Ataque Prioritario" : "Consolidacion Tecnica";
    const reason = [];
    if (pain >= 3) reason.push("medial_pain_high");
    if (readiness >= 7) reason.push("readiness_favorable");
    if (readiness < 7) reason.push("need_stable_quality");
    return {
      session_recommendation: {
        label: sessionLabel,
        explanation: pain >= 3 ? "El dolor medial obliga a bajar agresion local y priorizar tolerancia de tejido." : "El contexto actual permite progresar sin forzar el tejido.",
        reason,
        priority_factors: [pain >= 3 ? "tissue_protection" : "readiness", pain >= 3 ? "pain_control" : "technical_quality"],
        next_priority: pain >= 3 ? "recovery_tissue" : "specific_aw"
      }
    };
  }

  // src/simulation/real-state-engine.js
  function buildRealState({
    athleteProfile,
    checkins = [],
    sessions = [],
    exerciseEntries = [],
    exerciseRecords = [],
    nowDate
  }) {
    const latestCheckin = sortByDateDescending(checkins)[0] || null;
    const latestSession = sortByDateDescending(sessions)[0] || null;
    const records = exerciseRecords?.length ? exerciseRecords : buildExerciseRecords(exerciseEntries);
    const sessionGapDays = sessions.length > 1 ? Math.max(0, Math.round((new Date(`${sessions[0].date}T12:00:00`) - new Date(`${sessions[1].date}T12:00:00`)) / 864e5)) : 2;
    const medialPainToday = Number(latestCheckin?.pain?.medial_elbow_right || 0);
    const fatigueForearm = Number(latestCheckin?.fatigue?.forearm_hand || 0);
    const readiness = Number(latestCheckin?.readiness || 0);
    const continuityConfidence = Math.max(0.15, Math.min(1, 1 - 0.12 * Math.max(0, sessionGapDays - 1)));
    const robustnessIndex = clampNumber(readiness * 10 - medialPainToday * 6 - fatigueForearm * 3 + continuityConfidence * 18, 0, 100, 50);
    const tissueRiskIndex = clampNumber(medialPainToday * 12 + fatigueForearm * 6 + (1 - continuityConfidence) * 20, 0, 100, 20);
    const offensiveReadiness = clampNumber(readiness * 9 + continuityConfidence * 12 - medialPainToday * 4, 0, 100, 50);
    const defensiveCapacity = clampNumber((readiness + Math.max(0, 10 - fatigueForearm)) * 5, 0, 100, 40);
    const stableBase = records.length >= 4;
    return {
      athleteId: athleteProfile?.athlete_id || "unknown",
      date: nowDate || latestCheckin?.date || latestSession?.date || todayText(),
      readiness,
      medialPainToday,
      fatigueForearm,
      continuityConfidence,
      stableBase,
      records,
      sessionGapDays,
      robustnessIndex,
      tissueRiskIndex,
      offensiveReadiness,
      defensiveCapacity,
      profileGoals: {
        dominantGoal: athleteProfile?.dominantGoal || "Sin objetivo",
        secondaryGoal: athleteProfile?.secondaryGoal || "Sin objetivo"
      }
    };
  }

  // src/simulation/route-planner.js
  function createPredictedSummary(route) {
    const breakdown = route.scoreBreakdown || {};
    const weakestPredictedFactors = [];
    if ((breakdown.tissueSustainability || 0) < 0.7) {
      weakestPredictedFactors.push("tissue_sustainability");
    }
    if ((breakdown.offensiveImprovement || 0) < 0.65) {
      weakestPredictedFactors.push("offensive_output");
    }
    if ((breakdown.continuityRobustness || 0) < 0.65) {
      weakestPredictedFactors.push("continuity");
    }
    if ((breakdown.transferToTable || 0) < 0.7) {
      weakestPredictedFactors.push("table_transfer");
    }
    return {
      weakestPredictedFactors,
      outlook: weakestPredictedFactors.length <= 1 ? "favorable" : weakestPredictedFactors.length === 2 ? "vigilado" : "frágil"
    };
  }
  function buildCandidateRoutes({ realState, horizonWeeks = 24 }) {
    if (!realState) {
      return [];
    }
    const continuity = realState.continuityConfidence;
    const painPenalty = clampNumber(realState.medialPainToday / 10, 0, 1, 0);
    const readinessBoost = clampNumber(realState.readiness / 10, 0, 1, 0.5);
    const offensiveBias = clampNumber(realState.offensiveReadiness / 100, 0, 1, 0.5);
    const tissueBias = clampNumber(1 - realState.tissueRiskIndex / 100, 0, 1, 0.5);
    const routeCatalog = [
      {
        routeId: "route_primary_offense",
        label: "Ruta principal ofensiva",
        role: "primary",
        route: {
          blocks: [
            {
              blockLabel: offensiveBias >= 0.7 ? "Desarrollo Ofensivo" : "Consolidación Técnica",
              scenarioLabel: continuity >= 0.7 ? "Continuidad Alta" : continuity >= 0.45 ? "Continuidad Media" : "Continuidad Baja",
              horizonWeeks
            }
          ]
        },
        scoreBreakdown: {
          transferToTable: round(0.72 + offensiveBias * 0.18 - painPenalty * 0.08, 2),
          offensiveImprovement: round(0.64 + readinessBoost * 0.22 - painPenalty * 0.1, 2),
          tissueSustainability: round(0.58 + tissueBias * 0.22, 2),
          continuityRobustness: round(0.45 + continuity * 0.4, 2)
        },
        reasons: [
          "Maximiza la transferencia ofensiva a mesa.",
          continuity >= 0.6 ? "La continuidad reciente soporta una progresión más ambiciosa." : "La continuidad limita cuánto se puede escalar sin pagar costo de precisión.",
          realState.medialPainToday >= 3 ? "Requiere vigilar el dolor medial para no comprar progreso frágil." : "El dolor medial actual permite una agresión razonable."
        ]
      },
      {
        routeId: "route_alternative_balance",
        label: "Ruta alternativa equilibrada",
        role: "alternative",
        route: {
          blocks: [
            {
              blockLabel: tissueBias >= 0.7 ? "Consolidación Técnica" : "Recuperación y tolerancia",
              scenarioLabel: realState.readiness >= 7 ? "Readiness alta" : realState.readiness >= 5 ? "Readiness media" : "Readiness baja",
              horizonWeeks
            }
          ]
        },
        scoreBreakdown: {
          transferToTable: round(0.65 + offensiveBias * 0.12 - painPenalty * 0.05, 2),
          offensiveImprovement: round(0.56 + readinessBoost * 0.16 - painPenalty * 0.06, 2),
          tissueSustainability: round(0.68 + tissueBias * 0.18, 2),
          continuityRobustness: round(0.5 + continuity * 0.34, 2)
        },
        reasons: [
          "Concilia desarrollo ofensivo con control de fatiga.",
          tissueBias >= 0.65 ? "La tolerancia tisular actual permite sostener una carga intermedia." : "Prioriza no empeorar el tejido mientras mantiene estímulo útil.",
          continuity < 0.5 ? "Es la opción más robusta cuando la continuidad todavía es inestable." : "Mantiene margen táctico sin salir de la ruta principal."
        ]
      },
      {
        routeId: "route_contingency_tissue",
        label: "Ruta de contingencia tisular",
        role: "contingency",
        route: {
          blocks: [
            {
              blockLabel: "Recuperación Y Tolerancia",
              scenarioLabel: realState.medialPainToday >= 3 ? "Dolor activo" : "Fatiga acumulada",
              horizonWeeks
            }
          ]
        },
        scoreBreakdown: {
          transferToTable: round(0.46 + offensiveBias * 0.06, 2),
          offensiveImprovement: round(0.38 + readinessBoost * 0.08, 2),
          tissueSustainability: round(0.84 + tissueBias * 0.1, 2),
          continuityRobustness: round(0.58 + continuity * 0.22, 2)
        },
        reasons: [
          "Es la vía más segura cuando el tejido amenaza con frenar la continuidad.",
          realState.medialPainToday >= 3 ? "El dolor medial actual vuelve prioritaria la tolerancia antes que el ataque." : "Sirve como fallback si la siguiente sesión no llega con el contexto esperado.",
          continuity < 0.4 ? "Reduce el costo de los huecos recientes entre sesiones." : "Preserva margen de maniobra para rebotar hacia una ruta más agresiva."
        ]
      }
    ];
    return routeCatalog.map((route) => {
      const predictedSummary = createPredictedSummary(route);
      return {
        ...route,
        route: {
          ...route.route,
          predictedSummary
        }
      };
    });
  }

  // src/simulation/route-scorer.js
  function scoreSingleRoute(route) {
    const breakdown = route.scoreBreakdown || {};
    const totalScore = round(
      (Number(breakdown.transferToTable || 0) * 0.33 + Number(breakdown.offensiveImprovement || 0) * 0.27 + Number(breakdown.tissueSustainability || 0) * 0.22 + Number(breakdown.continuityRobustness || 0) * 0.18) * 100,
      2
    );
    return {
      ...route,
      totalScore
    };
  }
  function scoreRoutes(candidateRoutes = []) {
    return candidateRoutes.map(scoreSingleRoute).sort((left, right) => Number(right.totalScore || 0) - Number(left.totalScore || 0));
  }

  // src/simulation/adaptive-recommender.js
  function buildAdaptiveRecommendation({
    realState,
    strictSessionPlan = null,
    scoredRoutes = []
  }) {
    if (!realState) {
      return null;
    }
    const primaryRoute = scoredRoutes[0] || null;
    const alternativeRoute = scoredRoutes[1] || null;
    const contingencyRoute = scoredRoutes[2] || null;
    const records = realState.records || [];
    const isRecoveryBias = (primaryRoute?.route?.blocks?.[0]?.blockLabel || "").toLowerCase().includes("recuperación") || realState.medialPainToday >= 3;
    const primaryExercises = records.filter((record) => record.exerciseName === "rising_isometrico" || record.exerciseName === "pronacion_extendida").slice(0, 4).map((record) => ({
      exerciseName: record.exerciseName,
      side: record.side,
      target: record.nextTargetLabel || record.recordLabel || "Sin objetivo",
      why: record.exerciseName === "rising_isometrico" ? "Alineado con Rising, TopRollOffense" : "Alineado con Pronation, TopRollOffense"
    }));
    const supportiveExercises = records.filter((record) => record.exerciseName === "pronacion_media").slice(0, 2).map((record) => ({
      exerciseName: record.exerciseName,
      side: record.side,
      target: record.recordLabel || "Sin objetivo",
      why: "Soporte de pronación"
    }));
    const restrictions = [];
    if (realState.continuityConfidence < 0.55) {
      restrictions.push("Continuidad baja: conviene no elegir una sesión demasiado compleja.");
    }
    if (realState.medialPainToday >= 3) {
      restrictions.push("Dolor medial elevado: evitar side pressure agresivo y picos de irritabilidad.");
    }
    if (!restrictions.length) {
      restrictions.push("Sin restricción dominante.");
    }
    return {
      currentBlockRecommendation: {
        suggestedBlockLabel: primaryRoute?.route?.blocks?.[0]?.blockLabel || "Sin bloque"
      },
      nextSessionRecommendation: {
        sessionLabel: isRecoveryBias ? "Recuperacion Y Tolerancia" : "Ataque Prioritario",
        primaryExercises,
        supportiveExercises,
        restrictions,
        rationale: [
          realState.medialPainToday >= 3 ? "El tejido obliga a priorizar tolerancia antes que producción máxima." : "El contexto permite priorizar transferencia ofensiva sin perder control.",
          realState.continuityConfidence < 0.55 ? "La continuidad reciente baja la robustez de una sesión compleja." : "La continuidad reciente permite una sesión con intención más específica."
        ]
      },
      primaryRoute,
      alternativeRoute,
      contingencyRoute,
      explanation: [
        "Strict-planner define lo que hoy sí se puede hacer.",
        "La simulación prioriza lo que mejor sirve a la ruta ganadora.",
        "La recomendación final reconcilia seguridad inmediata y valor estratégico."
      ]
    };
  }

  // src/strict-planner.js
  function buildStrictCodexConfig() {
    return {
      mode: "strict",
      version: "codex-strict-1",
      sessionBlocks: [
        "Recuperación Y Tolerancia",
        "Consolidación Técnica",
        "Desarrollo Ofensivo"
      ],
      keyVectors: [
        "rising",
        "pronation",
        "back_pressure"
      ]
    };
  }

  // src/seed.js
  function createSeedData() {
    return {
      athleteProfile: {
        athlete_id: "edgar-garcia",
        name: "Edgar Garcia",
        dominantGoal: "Campeon Nacional 80kg Ambos Brazos",
        secondaryGoal: "Maximizar Fuerza Bruta Transferible"
      },
      dailyCheckins: [
        {
          date: "2026-04-04",
          bodyweight: 80,
          sleep_hours: 7.5,
          readiness: 7,
          available_time_min: 90,
          pain: {
            medial_elbow_right: 2
          },
          fatigue: {
            global: 4,
            forearm_hand: 4,
            back: 3,
            legs: 3
          },
          session_type_planned: "specific_aw"
        }
      ],
      sessions: [
        {
          session_id: "2026-03-29-aw-01",
          date: "2026-03-29",
          session_type: "specific_aw",
          goal_of_session: "toproll_refuerzo",
          effort_rpe_session: 9.2,
          results: {
            best_pattern: "back_pressure_y_pronacion",
            best_grip_condition: "medio_neutro",
            main_limitation: "rising",
            could_stop: true,
            could_move: true,
            could_finish: false
          },
          pain_events: [
            {
              zone: "medial_elbow_right",
              type: "irritability",
              severity: 2,
              during: "specific_aw",
              resolved_with: "continuar_controlado"
            }
          ],
          exercise_entry_count: 6,
          recommendation_label_before_session: "Recuperacion Y Tolerancia"
        }
      ],
      exerciseEntries: [
        {
          entry_id: "2026-03-29-aw-01-ex-01",
          session_id: "2026-03-29-aw-01",
          date: "2026-03-29",
          exercise_name: "rising_isometrico",
          category: "rising",
          pattern: "isometric_hold",
          side: "left",
          load: 27.5,
          load_unit: "kg",
          effort_type: "isometric_hold",
          sets: 3,
          reps: 1,
          duration_seconds: 25,
          rpe: 8.8,
          pain_during: 2,
          vector_quality: 0.9,
          technique_quality: 0.9,
          confirmed_rm: false,
          notes: "seed"
        },
        {
          entry_id: "2026-03-29-aw-01-ex-02",
          session_id: "2026-03-29-aw-01",
          date: "2026-03-29",
          exercise_name: "rising_isometrico",
          category: "rising",
          pattern: "isometric_hold",
          side: "right",
          load: 27.5,
          load_unit: "kg",
          effort_type: "isometric_hold",
          sets: 3,
          reps: 1,
          duration_seconds: 30,
          rpe: 9,
          pain_during: 2,
          vector_quality: 0.9,
          technique_quality: 0.9,
          confirmed_rm: false,
          notes: "seed"
        },
        {
          entry_id: "2026-03-29-aw-01-ex-03",
          session_id: "2026-03-29-aw-01",
          date: "2026-03-29",
          exercise_name: "pronacion_extendida",
          category: "pronation",
          pattern: "pronation",
          side: "left",
          load: 30,
          load_unit: "kg",
          effort_type: "dynamic",
          sets: 3,
          reps: 10,
          duration_seconds: 0,
          rpe: 8.5,
          pain_during: 2,
          vector_quality: 0.88,
          technique_quality: 0.88,
          confirmed_rm: false,
          notes: "seed"
        },
        {
          entry_id: "2026-03-29-aw-01-ex-04",
          session_id: "2026-03-29-aw-01",
          date: "2026-03-29",
          exercise_name: "pronacion_extendida",
          category: "pronation",
          pattern: "pronation",
          side: "right",
          load: 32.5,
          load_unit: "kg",
          effort_type: "dynamic",
          sets: 3,
          reps: 10,
          duration_seconds: 0,
          rpe: 8.7,
          pain_during: 2,
          vector_quality: 0.89,
          technique_quality: 0.89,
          confirmed_rm: false,
          notes: "seed"
        },
        {
          entry_id: "2026-03-29-aw-01-ex-05",
          session_id: "2026-03-29-aw-01",
          date: "2026-03-29",
          exercise_name: "pronacion_media",
          category: "pronation",
          pattern: "pronation",
          side: "left",
          load: 35,
          load_unit: "kg",
          effort_type: "dynamic",
          sets: 3,
          reps: 6,
          duration_seconds: 0,
          rpe: 8.5,
          pain_during: 2,
          vector_quality: 0.87,
          technique_quality: 0.88,
          confirmed_rm: false,
          notes: "seed"
        },
        {
          entry_id: "2026-03-29-aw-01-ex-06",
          session_id: "2026-03-29-aw-01",
          date: "2026-03-29",
          exercise_name: "pronacion_media",
          category: "pronation",
          pattern: "pronation",
          side: "right",
          load: 37.5,
          load_unit: "kg",
          effort_type: "dynamic",
          sets: 3,
          reps: 5,
          duration_seconds: 0,
          rpe: 8.7,
          pain_during: 2,
          vector_quality: 0.88,
          technique_quality: 0.88,
          confirmed_rm: false,
          notes: "seed"
        }
      ],
      exerciseRecords: []
    };
  }

  // src/ipp/run-ipp1.js
  function runIPP1({ dbData, scoredRoutes }) {
    const latestCheckin = sortByDateDescending(dbData?.dailyCheckins || [])[0] || null;
    const continuity = dbData?.realState?.continuityConfidence || dbData?.continuityConfidence || 0.5;
    const pain = Number(latestCheckin?.pain?.medial_elbow_right || dbData?.realState?.medialPainToday || 0);
    const readiness = Number(latestCheckin?.readiness || dbData?.realState?.readiness || 0);
    const robustnessScore = round(clampNumber(55 + readiness * 2 - pain * 4 + continuity * 10, 0, 100, 50), 2);
    const setupFragility = round(clampNumber(0.08 - continuity * 0.05 + pain * 0.005, 0.01, 0.25, 0.08), 3);
    const latentReadiness = round(clampNumber(readiness + continuity * 1.5, 0, 10, 5), 2);
    const latentTissueIrritability = round(clampNumber(pain * 0.8 + (1 - continuity) * 1.2, 0, 10, 2), 2);
    const posteriorExpectedSuccess = round(clampNumber((robustnessScore / 100) * 0.7 + (1 - setupFragility) * 0.3, 0, 1, 0.5), 3);
    const rescoredRoutes = ensureArray(scoredRoutes).map((route) => ({
      ...route,
      totalScore: round(Number(route.totalScore || 0) + robustnessScore * 0.04 - latentTissueIrritability * 1.5, 2),
      ippBreakdown: {
        robustnessScore,
        setupFragility,
        latentReadiness,
        latentTissueIrritability,
        posteriorExpectedSuccess
      }
    })).sort((left, right) => Number(right.totalScore || 0) - Number(left.totalScore || 0));
    return {
      ippVersion: "IPP1",
      rescoredRoutes,
      recommendationOverlay: {
        robustnessScore,
        setupFragility,
        latentReadiness,
        latentTissueIrritability,
        posteriorExpectedSuccess
      }
    };
  }

  // src/ipp/merge-ipp-into-recommendation.js
  function applyIPPToScoredRoutes(scoredRoutes, ippRecommendationOverlay) {
    return ensureArray(scoredRoutes).map((route) => ({
      ...route,
      ippBreakdown: ippRecommendationOverlay || null
    }));
  }

  // src/simulation/run-simulation-cycle-core.js
  function runSimulationCycle({
    athleteProfile,
    checkins = [],
    sessions = [],
    exerciseEntries = [],
    exerciseRecords = [],
    strictSessionPlan = null,
    nowDate,
    horizonWeeks = 24
  }) {
    const generatedAt = nowDate || checkins?.[0]?.date || sessions?.[0]?.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const realState = buildRealState({
      athleteProfile,
      checkins,
      sessions,
      exerciseEntries,
      exerciseRecords,
      nowDate: generatedAt
    });
    const candidateRoutes = buildCandidateRoutes({ realState, horizonWeeks });
    const scoredRoutes = scoreRoutes(candidateRoutes);
    const ipp = runIPP1({ dbData: { dailyCheckins: checkins, realState }, scoredRoutes });
    const scoredRoutesIPP1 = ipp.rescoredRoutes?.length ? ipp.rescoredRoutes : scoredRoutes;
    const recommendationBase = buildAdaptiveRecommendation({
      realState,
      strictSessionPlan,
      scoredRoutes: scoredRoutesIPP1
    });
    const recommendation = {
      ...recommendationBase,
      ipp: ipp.recommendationOverlay,
      ippVersion: ipp.ippVersion
    };
    return {
      generatedAt,
      realState,
      candidateRoutes,
      scoredRoutes: scoredRoutesIPP1,
      ipp,
      recommendation
    };
  }

  // src/client.js
  const STORAGE_KEY = "entrenador_virtual_state_v3";
  const API_BASE = "/api";
  const DEFAULT_CHECKIN_VALUES = {
    bodyweight: 80,
    sleep_hours: 7.5,
    readiness: 7,
    available_time_min: 90,
    session_type_planned: "specific_aw",
    medial_elbow_right: 2,
    global_fatigue: 4,
    forearm_hand_fatigue: 4,
    back_fatigue: 3,
    legs_fatigue: 3
  };
  const DEFAULT_SESSION_VALUES = {
    session_type: "specific_aw",
    goal_of_session: "toproll_refuerzo",
    effort_rpe_session: 8,
    best_pattern: "pronacion_media",
    best_grip_condition: "medio_neutro",
    main_limitation: "rising",
    medial_pain: 2,
    could_stop: true,
    could_move: true,
    could_finish: false
  };
  const DEFAULT_EXERCISE_TEMPLATES = [
    {
      exercise_name: "dominada_neutra_grip_grueso",
      category: "back_pressure",
      pattern: "vertical_pull",
      side: "bilateral",
      load: 25,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 3,
      reps: 5,
      duration_seconds: 0,
      rpe: 8.5,
      pain_during: 2,
      vector_quality: 0.88,
      technique_quality: 0.9,
      notes: "base"
    },
    {
      exercise_name: "pronacion_media",
      category: "pronation",
      pattern: "pronation",
      side: "right",
      load: 35,
      load_unit: "kg",
      effort_type: "dynamic",
      sets: 3,
      reps: 6,
      duration_seconds: 0,
      rpe: 8.5,
      pain_during: 2,
      vector_quality: 0.87,
      technique_quality: 0.88,
      notes: "base"
    }
  ];
  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function todayText() {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function formatDecimal(value, digits = 1) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(digits) : "0.0";
  }
  function formatUiText(value) {
    return String(value ?? "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  function ensureArray(value, fallback = []) {
    return Array.isArray(value) ? value : fallback;
  }
  function safeLower(value) {
    return String(value ?? "").trim().toLowerCase();
  }
  function buildStorageEnvelope(data, source = "seed") {
    return {
      athleteProfile: data.athleteProfile,
      dailyCheckins: ensureArray(data.dailyCheckins),
      sessions: ensureArray(data.sessions),
      exerciseEntries: ensureArray(data.exerciseEntries),
      exerciseRecords: ensureArray(data.exerciseRecords),
      storage: {
        source,
        lastSyncAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  }
  async function requestJson(url, options = {}) {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    if (!response.ok) {
      const text2 = await response.text();
      throw new Error(text2 || `Request failed: ${response.status}`);
    }
    return response.json();
  }
  async function loadServerMeta() {
    try {
      return await requestJson("/meta", { method: "GET" });
    } catch (error) {
      return { mode: "demo", strictAvailable: false, error: error.message };
    }
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
        athleteProfile: null,
        dailyCheckins: [],
        sessions: [],
        exerciseEntries: [],
        exerciseRecords: [],
        storage: { source: "sqlite", lastSyncAt: (/* @__PURE__ */ new Date()).toISOString() }
      });
    } catch (error) {
      if (meta?.mode === "strict") {
        throw error;
      }
      return buildStorageEnvelope(createSeedData(), "seed");
    }
  }
  function ensureShape(payload, fallback) {
    if (!isObject(payload)) {
      return deepClone(fallback);
    }
    return {
      ...deepClone(fallback),
      ...payload
    };
  }
  function parseJsonSafely(text, fallback = null) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return fallback;
    }
  }
  function loadLocalState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return buildStorageEnvelope(createSeedData(), "seed");
      }
      return ensureShape(parseJsonSafely(raw, {}), buildStorageEnvelope(createSeedData(), "seed"));
    } catch (error) {
      console.warn("No fue posible leer localStorage.", error);
      return buildStorageEnvelope(createSeedData(), "seed");
    }
  }
  function persistLocalState(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("No fue posible escribir localStorage.", error);
    }
  }
  function sortByDateDescending(entries) {
    return ensureArray(entries).slice().sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")));
  }
  async function saveCheckin(payload) {
    if (isStrictMode()) {
      const response = await requestJson("/checkins", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      state.data = ensureShape(response, state.data);
      state.data.exerciseRecords = buildExerciseRecords(state.data.exerciseEntries);
      return state.data;
    }
    state.data.dailyCheckins = sortByDateDescending([
      payload,
      ...state.data.dailyCheckins.filter((entry) => entry.date !== payload.date)
    ]);
    state.data.storage = {
      source: "seed",
      lastSyncAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    state.data.exerciseRecords = buildExerciseRecords(state.data.exerciseEntries);
    persistLocalState(state.data);
    return state.data;
  }
  async function saveSession(session, exerciseEntries) {
    if (isStrictMode()) {
      const response = await requestJson("/sessions", {
        method: "POST",
        body: JSON.stringify({ session, exerciseEntries })
      });
      state.data = ensureShape(response, state.data);
      state.data.exerciseRecords = buildExerciseRecords(state.data.exerciseEntries);
      return state.data;
    }
    state.data.sessions = sortByDateDescending([session, ...state.data.sessions]);
    state.data.exerciseEntries = sortByDateDescending([...exerciseEntries, ...state.data.exerciseEntries]);
    state.data.exerciseRecords = buildExerciseRecords(state.data.exerciseEntries);
    state.data.storage = {
      source: "seed",
      lastSyncAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    persistLocalState(state.data);
    return state.data;
  }
  function hydrateCheckinFormFromDefaults() {
    fillCheckinForm(getLatestCheckin(state.data));
  }
  function fillCheckinForm(latestCheckin = null) {
    const current = latestCheckin || null;
    elements.checkinDate.value = current?.date || todayText();
    elements.checkinBodyweight.value = current?.bodyweight ?? DEFAULT_CHECKIN_VALUES.bodyweight;
    elements.checkinSleep.value = current?.sleep_hours ?? DEFAULT_CHECKIN_VALUES.sleep_hours;
    elements.checkinReadiness.value = current?.readiness ?? DEFAULT_CHECKIN_VALUES.readiness;
    elements.checkinTime.value = current?.available_time_min ?? DEFAULT_CHECKIN_VALUES.available_time_min;
    elements.checkinPlanned.value = current?.session_type_planned || DEFAULT_CHECKIN_VALUES.session_type_planned;
    elements.checkinMedialPain.value = current?.pain?.medial_elbow_right ?? DEFAULT_CHECKIN_VALUES.medial_elbow_right;
    elements.checkinGlobalFatigue.value = current?.fatigue?.global ?? DEFAULT_CHECKIN_VALUES.global_fatigue;
    elements.checkinForearmFatigue.value = current?.fatigue?.forearm_hand ?? DEFAULT_CHECKIN_VALUES.forearm_hand_fatigue;
    elements.checkinBackFatigue.value = current?.fatigue?.back ?? DEFAULT_CHECKIN_VALUES.back_fatigue;
    elements.checkinLegsFatigue.value = current?.fatigue?.legs ?? DEFAULT_CHECKIN_VALUES.legs_fatigue;
  }
  function fillSessionForm() {
    elements.sessionDate.value = todayText();
    elements.sessionType.value = DEFAULT_SESSION_VALUES.session_type;
    elements.sessionGoal.value = DEFAULT_SESSION_VALUES.goal_of_session;
    elements.sessionRpe.value = DEFAULT_SESSION_VALUES.effort_rpe_session;
    elements.sessionBestPattern.value = DEFAULT_SESSION_VALUES.best_pattern;
    elements.sessionBestGrip.value = DEFAULT_SESSION_VALUES.best_grip_condition;
    elements.sessionMainLimitation.value = DEFAULT_SESSION_VALUES.main_limitation;
    elements.sessionMedialPain.value = DEFAULT_SESSION_VALUES.medial_pain;
    elements.sessionCouldStop.checked = DEFAULT_SESSION_VALUES.could_stop;
    elements.sessionCouldMove.checked = DEFAULT_SESSION_VALUES.could_move;
    elements.sessionCouldFinish.checked = DEFAULT_SESSION_VALUES.could_finish;
    elements.exerciseRows.innerHTML = DEFAULT_EXERCISE_TEMPLATES.map((template, index) => buildExerciseRowHtml(template, index)).join("");
  }
  function buildFriendlyInitError(error) {
    return `No fue posible iniciar la app: ${error.message || error}`;
  }
  function readCheckinForm() {
    return {
      date: elements.checkinDate.value || todayText(),
      bodyweight: round(clampNumber(elements.checkinBodyweight.value, 40, 180, DEFAULT_CHECKIN_VALUES.bodyweight), 1),
      sleep_hours: round(clampNumber(elements.checkinSleep.value, 0, 14, DEFAULT_CHECKIN_VALUES.sleep_hours), 1),
      readiness: clampNumber(elements.checkinReadiness.value, 0, 10, DEFAULT_CHECKIN_VALUES.readiness),
      available_time_min: clampNumber(elements.checkinTime.value, 20, 240, DEFAULT_CHECKIN_VALUES.available_time_min),
      session_type_planned: elements.checkinPlanned.value || DEFAULT_CHECKIN_VALUES.session_type_planned,
      pain: {
        medial_elbow_right: clampNumber(elements.checkinMedialPain.value, 0, 10, DEFAULT_CHECKIN_VALUES.medial_elbow_right)
      },
      fatigue: {
        global: clampNumber(elements.checkinGlobalFatigue.value, 0, 10, DEFAULT_CHECKIN_VALUES.global_fatigue),
        forearm_hand: clampNumber(elements.checkinForearmFatigue.value, 0, 10, DEFAULT_CHECKIN_VALUES.forearm_hand_fatigue),
        back: clampNumber(elements.checkinBackFatigue.value, 0, 10, DEFAULT_CHECKIN_VALUES.back_fatigue),
        legs: clampNumber(elements.checkinLegsFatigue.value, 0, 10, DEFAULT_CHECKIN_VALUES.legs_fatigue)
      }
    };
  }
  function readSessionFormBase() {
    const sessionId = `${elements.sessionDate.value || todayText()}-${Date.now()}`;
    state.pendingSessionId = sessionId;
    state.lastRecommendationLabel = state.lastRecommendationLabel || "sin recomendacion";
    return {
      session_id: sessionId,
      date: elements.sessionDate.value || todayText(),
      session_type: elements.sessionType.value || DEFAULT_SESSION_VALUES.session_type,
      goal_of_session: elements.sessionGoal.value || DEFAULT_SESSION_VALUES.goal_of_session,
      effort_rpe_session: round(clampNumber(elements.sessionRpe.value, 0, 10, DEFAULT_SESSION_VALUES.effort_rpe_session), 1),
      results: {
        best_pattern: elements.sessionBestPattern.value || DEFAULT_SESSION_VALUES.best_pattern,
        best_grip_condition: elements.sessionBestGrip.value || DEFAULT_SESSION_VALUES.best_grip_condition,
        main_limitation: elements.sessionMainLimitation.value || DEFAULT_SESSION_VALUES.main_limitation,
        could_stop: elements.sessionCouldStop.checked,
        could_move: elements.sessionCouldMove.checked,
        could_finish: elements.sessionCouldFinish.checked
      },
      pain_events: [
        {
          zone: "medial_elbow_right",
          type: "irritability",
          severity: clampNumber(elements.sessionMedialPain.value, 0, 10, DEFAULT_SESSION_VALUES.medial_pain),
          during: elements.sessionType.value || DEFAULT_SESSION_VALUES.session_type,
          resolved_with: "continuar_controlado"
        }
      ],
      exercise_entry_count: 0,
      recommendation_label_before_session: state.lastRecommendationLabel || "sin recomendacion"
    };
  }
  function readExerciseRows(sessionId, date) {
    return Array.from(elements.exerciseRows.querySelectorAll("[data-exercise-row]")).map((row, index) => {
      const field = (name) => row.querySelector(`[name="${name}"]`);
      return {
        entry_id: `${sessionId}-ex-${String(index + 1).padStart(2, "0")}`,
        session_id: sessionId,
        date,
        exercise_name: field("exercise_name")?.value || "ejercicio",
        category: field("category")?.value || "general",
        pattern: field("pattern")?.value || "general",
        side: field("side")?.value || "bilateral",
        load: round(Number(field("load")?.value || 0), 1),
        load_unit: field("load_unit")?.value || "kg",
        effort_type: field("effort_type")?.value || "dynamic",
        sets: clampNumber(field("sets")?.value, 1, 20, 3),
        reps: clampNumber(field("reps")?.value, 0, 50, 5),
        duration_seconds: clampNumber(field("duration_seconds")?.value, 0, 600, 0),
        rpe: round(clampNumber(field("rpe")?.value, 0, 10, 8), 1),
        pain_during: round(clampNumber(field("pain_during")?.value, 0, 10, 2), 1),
        vector_quality: 0.88,
        technique_quality: 0.88,
        confirmed_rm: false,
        notes: "captured"
      };
    });
  }
  function buildExerciseRowHtml(template = {}, index = 0) {
    const row = {
      ...DEFAULT_EXERCISE_TEMPLATES[index % DEFAULT_EXERCISE_TEMPLATES.length],
      ...template
    };
    return `
      <article class="exercise-row" data-exercise-row>
        <div class="exercise-row-header">
          <h3>Ejercicio ${index + 1}</h3>
          <button class="button button-ghost button-small remove-exercise-row" type="button">Quitar</button>
        </div>
        <div class="exercise-grid">
          <label class="field"><span>Ejercicio</span><input name="exercise_name" type="text" value="${escapeHtml(row.exercise_name)}"></label>
          <label class="field"><span>Categoria</span><input name="category" type="text" value="${escapeHtml(row.category)}"></label>
          <label class="field"><span>Patron</span><input name="pattern" type="text" value="${escapeHtml(row.pattern)}"></label>
          <label class="field"><span>Lado</span><input name="side" type="text" value="${escapeHtml(row.side)}"></label>
          <label class="field"><span>Carga</span><input name="load" type="number" min="0" step="0.5" value="${escapeHtml(row.load)}"></label>
          <label class="field"><span>Unidad</span><input name="load_unit" type="text" value="${escapeHtml(row.load_unit)}"></label>
          <label class="field"><span>Tipo</span><input name="effort_type" type="text" value="${escapeHtml(row.effort_type)}"></label>
          <label class="field"><span>Sets</span><input name="sets" type="number" min="1" max="20" step="1" value="${escapeHtml(row.sets)}"></label>
          <label class="field"><span>Reps</span><input name="reps" type="number" min="0" max="50" step="1" value="${escapeHtml(row.reps)}"></label>
          <label class="field"><span>Duracion (s)</span><input name="duration_seconds" type="number" min="0" max="600" step="1" value="${escapeHtml(row.duration_seconds)}"></label>
          <label class="field"><span>RPE</span><input name="rpe" type="number" min="0" max="10" step="0.1" value="${escapeHtml(row.rpe)}"></label>
          <label class="field"><span>Dolor</span><input name="pain_during" type="number" min="0" max="10" step="0.1" value="${escapeHtml(row.pain_during)}"></label>
        </div>
      </article>
    `;
  }
  function addExerciseRow(template = {}) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildExerciseRowHtml(template, elements.exerciseRows.children.length);
    elements.exerciseRows.appendChild(wrapper.firstElementChild);
  }
  function renumberExerciseRows() {
    Array.from(elements.exerciseRows.querySelectorAll("[data-exercise-row]")).forEach((row, index) => {
      const heading = row.querySelector("h3");
      if (heading) {
        heading.textContent = `Ejercicio ${index + 1}`;
      }
    });
  }
  function getLatestCheckin(data) {
    return sortByDateDescending(data?.dailyCheckins || [])[0] || null;
  }
  function getLatestSession(data) {
    return sortByDateDescending(data?.sessions || [])[0] || null;
  }
  function getFeaturedSession() {
    if (!state.lastSavedSessionId) {
      return getLatestSession(state.data);
    }
    return state.data.sessions.find((session) => session.session_id === state.lastSavedSessionId) || getLatestSession(state.data);
  }
  function getStrictPlan() {
    return buildStrictCodexConfig();
  }
  function isStrictMode() {
    return state.meta?.mode === "strict";
  }
  function renderProfileSummary(container, athleteProfile) {
    container.innerHTML = `
      <article class="stat-block">
        <h3>${escapeHtml(athleteProfile?.name || "Atleta")}</h3>
        <p class="muted">Objetivo dominante: ${escapeHtml(athleteProfile?.dominantGoal || "Sin dato")}</p>
        <p class="muted">Objetivo secundario: ${escapeHtml(athleteProfile?.secondaryGoal || "Sin dato")}</p>
      </article>
    `;
  }
  function renderContextSummary(container, context, extras = {}) {
    const latestSession = getLatestSession(state.data);
    container.innerHTML = `
      <article class="stat-block">
        <h3>Especifico AW</h3>
        <div class="summary-grid">
          <div class="stat-block">
            <span class="muted">Dia</span>
            <p class="context-metric-value">${escapeHtml(latestSession?.date || "Sin dato")}</p>
          </div>
          <div class="stat-block">
            <span class="muted">Ejercicios</span>
            <p class="context-metric-value">${escapeHtml((state.data?.exerciseEntries || []).length)}</p>
          </div>
          <div class="stat-block">
            <span class="muted">Intensidad</span>
            <p class="context-metric-value">${escapeHtml(latestSession?.effort_rpe_session ? `Alta | RPE ${latestSession.effort_rpe_session}` : "Sin dato")}</p>
          </div>
          <div class="stat-block">
            <span class="muted">Continuidad</span>
            <p class="context-metric-value">${escapeHtml(context?.continuityConfidence ? formatDecimal(context.continuityConfidence, 2) : "Sin dato")}</p>
          </div>
        </div>
      </article>
    `;
  }
  function renderSessionHistory(container, sessions, exerciseEntries) {
    const items = ensureArray(sessions).slice(0, 6);
    if (!items.length) {
      container.innerHTML = '<div class="empty-note">Todavía no hay sesiones registradas.</div>';
      return;
    }
    container.innerHTML = items.map((session) => {
      const linkedEntries = ensureArray(exerciseEntries).filter((entry) => entry.session_id === session.session_id);
      return `
        <article class="history-card">
          <h3>${escapeHtml(formatUiText(session.session_type || "sesion"))}</h3>
          <p class="muted">${escapeHtml(session.date || "Sin fecha")}</p>
          <div class="history-meta">
            <span class="pill pill-muted">RPE ${escapeHtml(session.effort_rpe_session || "0")}</span>
            <span class="pill pill-muted">Ejercicios ${escapeHtml(linkedEntries.length)}</span>
            <span class="pill pill-muted">Limitación ${escapeHtml(formatUiText(session?.results?.main_limitation || "sin_dato"))}</span>
          </div>
        </article>
      `;
    }).join("");
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
      container.innerHTML = '<div class="empty-note">No hay recomendación heurística disponible.</div>';
      scoringContainer.innerHTML = "";
      return;
    }

    container.innerHTML = `
    <article class="recommendation-card">
      <h3>${escapeHtml(payload.label || "Recomendación del día")}</h3>
      <div class="recommendation-meta">
        <p>${escapeHtml(payload.explanation || "Sin explicación disponible.")}</p>
        <div>
          <strong>Por que va primero</strong>
          <ul class="list">
            ${(Array.isArray(payload.reason) ? payload.reason : []).map((reason) => `<li>${escapeHtml(formatUiText(reason))}</li>`).join("")}
          </ul>
        </div>
      </div>
    </article>
  `;

    scoringContainer.innerHTML = `
    <article class="stat-block">
      <h3>Detalles</h3>
      <ul class="list">
        ${(Array.isArray(payload.priority_factors) ? payload.priority_factors : []).map((item) => `<li>${escapeHtml(formatUiText(item))}</li>`).join("")}
      </ul>
    </article>
  `;
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
        return "Ruta De Contingencia";
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
    const weakest = Array.isArray(route?.route?.predictedSummary?.weakestPredictedFactors) ? route.route.predictedSummary.weakestPredictedFactors.map((item) => formatUiText(item)).join(", ") : "Sin dato";
    return `
    <article class="stat-block">
      <div class="score-row-head">
        <h3>${escapeHtml(buildRouteRoleLabel(role))}</h3>
        <span class="pill ${role === "primary" ? "" : "pill-muted"}">Score ${escapeHtml(formatDecimal(route.totalScore, 2))}</span>
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
      container.innerHTML = '<div class="empty-note">No hay recomendacion adaptativa disponible todavia.</div>';
      scoringContainer.innerHTML = "";
      return;
    }

    const nextSession = recommendation.nextSessionRecommendation || {};
    const currentBlock = recommendation.currentBlockRecommendation || null;
    const ipp = recommendation.ipp || null;
    const ippVersion = recommendation.ippVersion || "IPP1";

    const renderAdaptiveExerciseList = (items = []) => {
      if (!Array.isArray(items) || items.length === 0) {
        return '<li>Sin ejercicios definidos.</li>';
      }

      return items.map((item) => {
        const exerciseName = formatUiText(item?.exerciseName || item?.exerciseKey || "ejercicio");
        const side = item?.side ? ` (${formatUiText(item.side)})` : "";
        const target = item?.target || "Sin objetivo";
        const why = item?.why ? ` | ${item.why}` : "";
        return `<li><strong>${escapeHtml(exerciseName)}${escapeHtml(side)}</strong>: ${escapeHtml(target)}${escapeHtml(why)}</li>`;
      }).join("");
    };

    const robustnessRaw = ipp?.robustnessScore ?? ipp?.robustness_score;
    const fragilityRaw = ipp?.setupFragility ?? ipp?.setup_fragility;
    const readinessRaw = ipp?.latentReadiness ?? ipp?.latent_readiness;
    const tissueRaw = ipp?.latentTissueIrritability ?? ipp?.latent_tissue_irritability;
    const posteriorRaw = ipp?.posteriorExpectedSuccess ?? ipp?.posterior_expected_success;

    const robustness = Number.isFinite(Number(robustnessRaw)) ? Number(robustnessRaw).toFixed(2) : "Sin dato";
    const fragility = Number.isFinite(Number(fragilityRaw)) ? Number(fragilityRaw).toFixed(3) : "Sin dato";
    const readiness = Number.isFinite(Number(readinessRaw)) ? Number(readinessRaw).toFixed(2) : "Sin dato";
    const tissue = Number.isFinite(Number(tissueRaw)) ? Number(tissueRaw).toFixed(2) : "Sin dato";
    const posterior = Number.isFinite(Number(posteriorRaw)) ? `${(Number(posteriorRaw) <= 1 ? Number(posteriorRaw) * 100 : Number(posteriorRaw)).toFixed(1)}%` : "Sin dato";

    const ippSummaryMarkup = ipp ? `
        <div class="compact-stack">
          <strong>${escapeHtml(ippVersion)}</strong>
          <p class="muted">${escapeHtml(`Robustez ${robustness} | Fragilidad ${fragility} | Readiness ${readiness} | Tejido ${tissue} | Exito posterior ${posterior}`)}</p>
        </div>
      ` : "";

    container.innerHTML = `
      <article class="recommendation-card">
        <h3>${escapeHtml(nextSession.sessionLabel || "Siguiente Sesion")}</h3>
        <div class="recommendation-meta">
          <p>${escapeHtml(currentBlock ? `Bloque actual: ${currentBlock.suggestedBlockLabel}.` : "Sin bloque actual definido.")}</p>
          ${ippSummaryMarkup}
          <div>
            <strong>Ejercicios Prioritarios</strong>
            <ul class="list">
              ${renderAdaptiveExerciseList(nextSession.primaryExercises)}
            </ul>
          </div>
          <div>
            <strong>Apoyo Del Dia</strong>
            <ul class="list">
              ${renderAdaptiveExerciseList(nextSession.supportiveExercises)}
            </ul>
          </div>
        </div>
      </article>
    `;

    const explanationText = Array.isArray(recommendation.explanation) ? recommendation.explanation.join(" ") : Array.isArray(nextSession.rationale) ? nextSession.rationale.join(" ") : "";

    scoringContainer.innerHTML = `
      <article class="stat-block">
        <h3>Restricciones Y Logica</h3>
        <ul class="list">
          ${(nextSession.restrictions?.length > 0 ? nextSession.restrictions : ["Sin restriccion dominante."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
        <div class="compact-stack">
          <p class="muted">${escapeHtml(explanationText)}</p>
        </div>
      </article>
      ${ipp ? `
      <article class="stat-block">
        <h3>Resumen ${escapeHtml(ippVersion)}</h3>
        <ul class="list">
          <li>${escapeHtml(`Robustez: ${robustness}`)}</li>
          <li>${escapeHtml(`Fragilidad setup: ${fragility}`)}</li>
          <li>${escapeHtml(`Readiness latente: ${readiness}`)}</li>
          <li>${escapeHtml(`Irritabilidad tisular: ${tissue}`)}</li>
          <li>${escapeHtml(`Exito posterior estimado: ${posterior}`)}</li>
        </ul>
      </article>
      ` : ""}
    `;
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
    if (!recommendation) {
      container.innerHTML = '<div class="empty-note">Todavía no hay rutas simuladas disponibles.</div>';
      return;
    }
    const primary = recommendation.primaryRoute || null;
    const alternative = recommendation.alternativeRoute || null;
    const contingency = recommendation.contingencyRoute || null;
    container.innerHTML = `
    <div class="summary-grid">
      ${buildRouteCard(primary, "primary")}
      ${buildRouteCard(alternative, "alternative")}
    </div>
    <div class="summary-grid">
      ${buildRouteCard(contingency, "contingency")}
    </div>
  `;
  }
  function renderPostSessionInsight(container, insight) {
    if (!insight) {
      container.innerHTML = '<div class="empty-note">Todavía no hay una sesión suficiente para leer qué funcionó y qué se debe priorizar después.</div>';
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
        </div>
      </article>
    `;
  }
  function renderWeeklyDashboard(container, weeklyDashboard) {
    if (!weeklyDashboard) {
      container.innerHTML = '<div class="empty-note">Todavía no hay suficiente captura para leer la semana.</div>';
      return;
    }
    container.innerHTML = `
      <article class="stat-block">
        <h3>${escapeHtml(weeklyDashboard.recommendedFocus)}</h3>
        <ul class="list">
          ${ensureArray(weeklyDashboard.riskFlags).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    `;
  }
  function renderUnavailableState(message) {
    const note = `<div class="empty-note">${escapeHtml(message)}</div>`;
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
  }
  function renderPerformanceGoals(container, snapshot) {
    container.innerHTML = `
      <article class="stat-block">
        <h3>${escapeHtml(snapshot?.title || "Atleta")}</h3>
        <p class="muted">${escapeHtml(snapshot?.subtitle || "Sin objetivo")}</p>
        <p class="muted">Foco actual: ${escapeHtml(snapshot?.focus || "Sin foco")}</p>
      </article>
    `;
  }
  function renderPerformanceData(container, snapshot) {
    container.innerHTML = `
      <div class="summary-grid">
        ${ensureArray(snapshot?.metrics).map((item) => `
          <article class="stat-block metric-card">
            <h3>${escapeHtml(item.label)}</h3>
            <p class="muted">${escapeHtml(item.value)}</p>
          </article>
        `).join("")}
      </div>
    `;
  }
  function renderExerciseRecords(container, records) {
    if (!records?.length) {
      container.innerHTML = '<div class="empty-note">No hay records disponibles.</div>';
      return;
    }
    container.innerHTML = `
      <div class="records-grid">
        ${records.map((record) => `
          <article class="record-card">
            <div class="record-card-header">
              <div>
                <h3>${escapeHtml(formatUiText(record.exerciseName))}</h3>
                <p class="muted">Lado ${escapeHtml(formatUiText(record.side || "bilateral"))}</p>
              </div>
              <span class="pill">${escapeHtml(formatUiText(record.progressionAction || "hold"))}</span>
            </div>
            <div class="record-highlight-grid">
              <div class="record-datum record-datum-accent">
                <span class="record-datum-label">Marca actual</span>
                <strong class="record-datum-value">${escapeHtml(record.recordLabel || "Sin dato")}</strong>
              </div>
              <div class="record-datum record-datum-success">
                <span class="record-datum-label">Objetivo siguiente</span>
                <strong class="record-datum-value">${escapeHtml(record.nextTargetLabel || "Sin dato")}</strong>
              </div>
            </div>
            <div class="record-metrics-grid">
              <div class="record-datum">
                <span class="record-datum-label">Categoria</span>
                <strong class="record-datum-value">${escapeHtml(formatUiText(record.category || "sin_dato"))}</strong>
              </div>
              <div class="record-datum">
                <span class="record-datum-label">Patron</span>
                <strong class="record-datum-value">${escapeHtml(formatUiText(record.pattern || "sin_dato"))}</strong>
              </div>
              <div class="record-datum">
                <span class="record-datum-label">Tipo</span>
                <strong class="record-datum-value">${escapeHtml(formatUiText(record.effortType || "dynamic"))}</strong>
              </div>
              <div class="record-datum">
                <span class="record-datum-label">RM estimado</span>
                <strong class="record-datum-value">${record.currentRmKg ? `${escapeHtml(formatDecimal(record.currentRmKg, 1))} kg` : "N/A"}</strong>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }
  function setSessionCaptureVisible(isVisible) {
    state.sessionCaptureVisible = Boolean(isVisible);
    document.querySelectorAll("[data-session-capture]").forEach((panel) => {
      panel.classList.toggle("panel-collapsed", !state.sessionCaptureVisible);
    });
  }
  function setCurrentScreen(screen) {
    state.currentScreen = screen;
    elements.mainScreen.classList.toggle("screen-hidden", screen !== "main");
    elements.mainScreen.classList.toggle("screen-active", screen === "main");
    elements.performanceScreen.classList.toggle("screen-hidden", screen !== "performance");
    elements.performanceScreen.classList.toggle("screen-active", screen === "performance");
  }
  function navigateToPanel(screen, panel, focusElement) {
    setCurrentScreen(screen);
    if (panel) {
      panel.classList.add("panel-spotlight");
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => panel.classList.remove("panel-spotlight"), 1600);
    }
    if (focusElement) {
      setTimeout(() => focusElement.focus(), 220);
    }
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
      console.warn("No fue posible cargar el ciclo de simulación desde el servidor. Se usará el fallback local.", error);
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
      state.syncStatus = syncTime ? `${modeLabel} | SQLite | ${syncTime}${simulationLabel}${ippLabel}` : `${modeLabel} | SQLite activa${simulationLabel}${ippLabel}`;
      return;
    }
    state.syncStatus = "Modo demo | Seed temporal";
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

    const adaptivePayload = adaptiveRecommendation || simulationCycle?.recommendation || null;
    const hasAdaptiveRecommendation = Boolean(adaptivePayload?.nextSessionRecommendation);
    state.lastRecommendationLabel = hasAdaptiveRecommendation ? adaptivePayload?.nextSessionRecommendation?.sessionLabel || adaptivePayload?.currentBlockRecommendation?.suggestedBlockLabel || "sin recomendacion" : recommendation?.session_recommendation?.label || "sin recomendacion";
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
      elements.heroFocusValue.textContent = strictMode ? adaptivePayload?.currentBlockRecommendation?.suggestedBlockLabel || adaptivePayload?.nextSessionRecommendation?.sessionLabel || "Sin Foco" : recommendation?.session_recommendation?.label || "Sin Foco";
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
  async function hydrateData() {
    state.meta = await loadServerMeta();
    state.data = await loadAppData(state.meta);
    state.data.exerciseRecords = buildExerciseRecords(state.data.exerciseEntries);
    await hydrateStrictArtifacts();
    state.initError = "";
    updateSyncStatusFromData();
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
      console.error("No fue posible guardar la sesión.", error);
      state.initError = "";
      state.syncStatus = `Error al guardar sesión: ${error.message}`;
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
  function bindEventListeners() {
    elements.checkinForm.addEventListener("submit", handleCheckinSubmit);
    elements.sessionForm.addEventListener("submit", handleSessionSubmit);
    elements.exerciseRows.addEventListener("click", handleExerciseRowClick);
    elements.addExerciseRow.addEventListener("click", () => {
      addExerciseRow();
      renumberExerciseRows();
    });
    elements.startSessionButton.addEventListener("click", handleStartSessionProgrammed);
    elements.viewHistoryButton.addEventListener("click", handleViewHistory);
    elements.viewRecordsButton.addEventListener("click", handleViewRecords);
    elements.recommendButton.addEventListener("click", () => {
      renderApp();
      elements.recommendationShell.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  const elements = {
    mainScreen: document.getElementById("main-screen"),
    performanceScreen: document.getElementById("performance-screen"),
    profileSummary: document.getElementById("profile-summary"),
    contextSummary: document.getElementById("context-summary"),
    recommendationShell: document.getElementById("recommendation-shell"),
    scoringShell: document.getElementById("scoring-shell"),
    performanceGoals: document.getElementById("performance-goals"),
    performanceData: document.getElementById("performance-data"),
    exerciseRecords: document.getElementById("exercise-records"),
    checkinForm: document.getElementById("checkin-form"),
    sessionForm: document.getElementById("session-form"),
    checkinPanel: document.getElementById("checkin-panel"),
    historyPanel: document.getElementById("history-panel"),
    recordsPanel: document.getElementById("records-panel"),
    checkinDate: document.getElementById("checkin-date"),
    checkinBodyweight: document.getElementById("checkin-bodyweight"),
    checkinSleep: document.getElementById("checkin-sleep"),
    checkinReadiness: document.getElementById("checkin-readiness"),
    checkinTime: document.getElementById("checkin-time"),
    checkinPlanned: document.getElementById("checkin-planned"),
    checkinMedialPain: document.getElementById("checkin-medial-pain"),
    checkinGlobalFatigue: document.getElementById("checkin-global-fatigue"),
    checkinForearmFatigue: document.getElementById("checkin-forearm-fatigue"),
    checkinBackFatigue: document.getElementById("checkin-back-fatigue"),
    checkinLegsFatigue: document.getElementById("checkin-legs-fatigue"),
    sessionDate: document.getElementById("session-date"),
    sessionType: document.getElementById("session-type"),
    sessionGoal: document.getElementById("session-goal"),
    sessionRpe: document.getElementById("session-rpe"),
    sessionBestPattern: document.getElementById("session-best-pattern"),
    sessionBestGrip: document.getElementById("session-best-grip"),
    sessionMainLimitation: document.getElementById("session-main-limitation"),
    sessionMedialPain: document.getElementById("session-medial-pain"),
    sessionCouldStop: document.getElementById("session-could-stop"),
    sessionCouldMove: document.getElementById("session-could-move"),
    sessionCouldFinish: document.getElementById("session-could-finish"),
    exerciseRows: document.getElementById("exercise-rows"),
    addExerciseRow: document.getElementById("add-exercise-row"),
    startSessionButton: document.getElementById("start-session-button"),
    viewHistoryButton: document.getElementById("view-history-button"),
    viewRecordsButton: document.getElementById("view-records-button"),
    recommendButton: document.getElementById("recommend-button"),
    heroPainValue: document.getElementById("hero-pain-value"),
    heroReadinessValue: document.getElementById("hero-readiness-value"),
    heroFocusValue: document.getElementById("hero-focus-value"),
    statusLine: document.getElementById("status-line"),
    modeBadge: document.getElementById("mode-badge"),
    sourceBadge: document.getElementById("source-badge"),
    sessionHistory: document.getElementById("session-history"),
    postSessionShell: document.getElementById("post-session-shell"),
    weeklyDashboard: document.getElementById("weekly-dashboard"),
    simulationRoutes: document.getElementById("simulation-routes")
  };
  const state = {
    meta: { mode: "demo", strictAvailable: false },
    data: loadLocalState(),
    strictConfig: null,
    simulationCycle: null,
    ippCycle: null,
    initError: "",
    syncStatus: "Conectando...",
    sessionCaptureVisible: false,
    currentScreen: "main",
    pendingSessionId: null,
    lastRecommendationLabel: "sin recomendacion",
    lastSavedSessionId: null
  };
  async function init() {
    hydrateCheckinFormFromDefaults();
    fillSessionForm();
    bindEventListeners();
    try {
      await hydrateData();
      fillCheckinForm(getLatestCheckin(state.data));
      fillSessionForm();
    } catch (error) {
      console.error("No fue posible iniciar la app.", error);
      state.meta = state.meta || { mode: "strict", strictAvailable: false };
      state.initError = buildFriendlyInitError(error);
      state.syncStatus = state.initError;
    }
    renderApp();
  }
  init();
})();