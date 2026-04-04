import { buildEntryStrengthMetrics } from "./engine.js";
import { exerciseDisplayLabels, patternLabels, sessionTypeLabels } from "./seed.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function titleCaseToken(token) {
  return patternLabels[token] || token.replaceAll("_", " ");
}

function humanizeText(value) {
  return String(value || "").replaceAll("_", " ");
}

function startCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|[\s(])([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
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

function formatHours(hours) {
  if (!Number.isFinite(hours)) {
    return "sin mesa reciente";
  }

  if (hours < 24) {
    return `${Math.round(hours)} h`;
  }

  return `${Math.round(hours / 24)} dias`;
}

function formatDecimal(value, digits = 1) {
  if (value === null || value === undefined || value === "") {
    return "Sin Dato";
  }

  return Number(value).toFixed(digits);
}

function formatKgValue(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0
    ? `${Number(value).toFixed(1)} kg`
    : "sin dato";
}

function formatRmSourceType(value) {
  if (value === "confirmed") {
    return "confirmado";
  }

  if (value === "theoretical") {
    return "teorico";
  }

  return "no calculable";
}

function buildBestSetLabel(bestSet) {
  if (!bestSet) {
    return "Sin Set Util";
  }

  if (bestSet.effortType === "isometric_hold") {
    const loadValue = Number(bestSet.load) || 0;
    const loadUnit = bestSet.loadUnit || "";
    const durationSeconds = Number(bestSet.durationSeconds) || 0;
    const sets = Number(bestSet.sets) || 0;
    const loadLabel = loadValue > 0 ? `${loadValue} ${loadUnit}` : "Sin Carga Externa";
    return `${loadLabel} x ${durationSeconds} S (${sets} Holds)`;
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

  const heuristicNotes = (candidate.notes || [])
    .map((note) => formatUiText(note))
    .filter(Boolean);

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
  return Number.isFinite(Number(value)) && Number(value) > 0
    ? `${formatCompactNumber(value)} kg`
    : "Sin Dato";
}

function formatSessionDay(dateText) {
  if (!dateText) {
    return "Sin Dato";
  }

  const date = new Date(`${dateText}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return capitalizeFirst(
    new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
  const loads = entries
    .map((entry) => buildEntryStrengthMetrics(entry).loadKg)
    .filter((value) => Number.isFinite(value) && value > 0);

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
  const ranked = entries
    .map((entry) => {
      const metrics = buildEntryStrengthMetrics(entry);

      return {
        entry,
        rmKg: Number(metrics.currentRmKg) || 0,
      };
    })
    .filter((item) => item.rmKg > 0)
    .sort((left, right) => right.rmKg - left.rmKg);
  const best = ranked[0];

  if (!best) {
    return "Sin RM Util";
  }

  return `${formatCompactNumber(best.rmKg)} kg en ${formatUiText(best.entry.exercise_name)}`;
}

function buildPreviousSessionCards(sessions = [], exerciseEntries = [], limit = 3) {
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

  return sessions
    .slice(0, limit)
    .map((session) => {
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
    })
    .join("");
}

export function renderProfileSummary(container, profile) {
  const strengths = Object.entries(profile.current_strength_profile)
    .filter(([, value]) => String(value).includes("fuerte"))
    .map(([pattern]) => titleCaseToken(pattern));
  const weaknesses = Object.entries(profile.current_strength_profile)
    .filter(([, value]) => String(value).includes("debil"))
    .map(([pattern]) => titleCaseToken(pattern));
  const distribution = Object.entries(profile.priority_distribution)
    .map(([pattern, value]) => `<span class="pill">${escapeHtml(titleCaseToken(pattern))}: ${escapeHtml(value)}</span>`)
    .join("");

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

export function renderContextSummary(container, context, options = {}) {
  const sessions = Array.isArray(options.sessions) ? options.sessions : [];
  const exerciseEntries = Array.isArray(options.exerciseEntries) ? options.exerciseEntries : [];

  container.innerHTML = buildPreviousSessionCards(sessions, exerciseEntries, 3);
}

export function renderRecommendation(container, scoringContainer, recommendation) {
  if (!recommendation) {
    container.innerHTML = '<div class="empty-note">Guarda un check-in para generar la recomendacion del dia.</div>';
    scoringContainer.innerHTML = "";
    return;
  }

  const payload = recommendation.session_recommendation;

  container.innerHTML = `
    <article class="recommendation-card">
      <h3>${escapeHtml(payload.label)}</h3>
      <div class="recommendation-meta">
        <p>${escapeHtml(payload.explanation)}</p>
        <div>
          <strong>Por que va primero</strong>
          <ul class="list">
            ${payload.reason.map((reason) => `<li>${escapeHtml(formatUiText(reason))}</li>`).join("")}
          </ul>
        </div>
        <div>
          <strong>Ejercicios principales</strong>
          <ul class="list">
            ${payload.main_exercises.map((exercise) => `<li>${escapeHtml(formatUiText(exercise.name))}: ${exercise.sets} x ${exercise.reps} @ RPE ${exercise.rpe_target}</li>`).join("")}
          </ul>
        </div>
        <div>
          <strong>Limitar o evitar hoy</strong>
          <ul class="list">
            ${payload.limit_or_avoid.map((item) => `<li>${escapeHtml(formatUiText(item))}</li>`).join("")}
          </ul>
        </div>
        <p><strong>Monitorear:</strong> ${payload.monitor.map((item) => escapeHtml(formatUiText(item))).join(", ")}</p>
        <p><strong>Siguiente prioridad:</strong> ${escapeHtml(formatUiText(payload.next_priority))}</p>
        <p><strong>Dato que mas podria cambiar la decision:</strong> ${escapeHtml(formatUiText(payload.what_changes_recommendation))}</p>
      </div>
      </article>
    `;

  const alternatives = recommendation.ranking.slice(1);

  if (alternatives.length === 0) {
    scoringContainer.innerHTML = "";
    return;
  }

  scoringContainer.innerHTML = `
    <article class="stat-block">
      <h3>Otras rutas posibles hoy</h3>
      <div class="stack">
        ${alternatives.map((candidate, index) => `
          <article class="score-row">
            <div class="score-row-head">
              <strong>${escapeHtml(candidate.label)}</strong>
              <span class="pill ${index === 0 ? "" : "pill-muted"}">${escapeHtml(buildCandidateBadgeLabel(index + 1))}</span>
            </div>
            <p class="muted">${escapeHtml(buildCandidateSummary(candidate, index + 1))}</p>
          </article>
        `).join("")}
      </div>
    </article>
  `;
}

export function renderPostSessionInsight(container, insight) {
  if (!insight) {
    container.innerHTML = '<div class="empty-note">Todavia no hay una sesion suficiente para leer que funciono y que se debe priorizar despues.</div>';
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
        <p><strong>Mejor ejercicio de la sesion:</strong> ${escapeHtml(formatUiText(insight.bestExercise?.exercise_name || "sin dato"))}</p>
        <p><strong>Ejercicio mas agresivo hoy:</strong> ${escapeHtml(formatUiText(insight.riskiestExercise?.exercise_name || "sin dato"))}</p>
      </div>
    </article>
  `;
}

export function renderWeeklyDashboard(container, dashboard) {
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
        <p class="muted">RPE medio de sesion: ${escapeHtml(formatDecimal(dashboard.metrics.avgSessionRpe))}</p>
        <p class="muted">Check-ins capturados: ${escapeHtml(dashboard.metrics.checkinDaysCaptured)}/7</p>
        <p class="muted">Hueco maximo de captura: ${escapeHtml(dashboard.metrics.maxCheckinGapDays)} dias</p>
      </article>
      <article class="stat-block">
        <h3>Patrones mas expuestos</h3>
        <div class="pill-row">
          ${dashboard.topPatterns.length > 0
            ? dashboard.topPatterns.map((item) => `<span class="pill">${escapeHtml(titleCaseToken(item.pattern))}: ${escapeHtml(item.setCount)} sets</span>`).join("")
            : '<span class="pill pill-muted">sin exposicion aun</span>'}
        </div>
      </article>
        <article class="stat-block">
          <h3>Ejercicios mas rentables</h3>
          <ul class="list">
            ${dashboard.effectiveExercises.length > 0
            ? dashboard.effectiveExercises.map((item) => `<li><strong>${escapeHtml(formatUiText(item.exerciseName))}:</strong> ${escapeHtml(buildEffectiveExerciseSummary(item))}</li>`).join("")
              : "<li>todavia no hay datos suficientes</li>"}
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
        <h3>Senales positivas</h3>
        <ul class="list">
          ${dashboard.positiveSignals.length > 0 ? dashboard.positiveSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>aun no hay una senal fuerte acumulada</li>"}
        </ul>
      </article>
    </div>
  `;
}

export function renderSessionHistory(container, sessions, exerciseEntries) {
  if (!sessions.length) {
    container.innerHTML = '<div class="empty-note">Todavia no hay sesiones registradas.</div>';
    return;
  }

  const exerciseCountMap = buildExerciseCountMap(exerciseEntries);

  container.innerHTML = sessions
    .slice(0, 6)
    .map((session) => {
      const painPeak = (session.pain_events || []).reduce((peak, event) => Math.max(peak, Number(event.severity) || 0), 0);
      const limitation = session.results?.main_limitation
        ? `<span class="pill">${escapeHtml(formatUiText(session.results.main_limitation))}</span>`
        : '<span class="pill pill-muted">sin limitacion registrada</span>';

      return `
        <article class="history-card">
          <h3>${escapeHtml(sessionTypeLabels[session.session_type] || session.session_type)}</h3>
        <p class="muted">${escapeHtml(session.date)} - Objetivo: ${escapeHtml(formatUiText(session.goal_of_session || "sin objetivo"))}</p>
          <p class="muted">RPE ${escapeHtml(session.effort_rpe_session || "-")} - Mejor patron: ${escapeHtml(formatUiText(session.results?.best_pattern || "sin dato"))}</p>
          <div class="history-meta">
            <span class="pill pill-muted">dolor medial ${painPeak}/10</span>
            <span class="pill pill-muted">ejercicios ${exerciseCountMap[session.session_id] || 0}</span>
            ${limitation}
            <span class="pill pill-muted">${session.results?.could_finish ? "pudo finalizar" : "no finalizo"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

export function buildStatusLine(context, recommendation) {
  if (!context) {
    return "Listo para capturar contexto.";
  }

  const label = recommendation?.session_recommendation?.label || "sin recomendacion";
  return `Codo medial ${context.medialPainToday}/10, ultima mesa ${formatHours(context.lastTableHours)}, sets especificos 7d ${context.weeklySpecificSets}, foco sugerido: ${label}.`;
}

export function renderPerformanceGoals(container, snapshot) {
  if (!snapshot) {
    container.innerHTML = '<div class="empty-note">Falta informacion para construir la vista de rendimiento.</div>';
    return;
  }

  const cards = [
    {
      title: "Objetivo final",
      label: humanizeText(snapshot.finalObjective.label),
      support: snapshot.finalObjective.support,
    },
    {
      title: "Proxima sesion",
      label: snapshot.nextSessionObjective.label,
      support: snapshot.nextSessionObjective.support,
    },
    {
      title: "Objetivo del bloque",
      label: snapshot.currentBlockObjective.label,
      support: snapshot.currentBlockObjective.support,
    },
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

export function renderPerformanceData(container, snapshot) {
  if (!snapshot) {
    container.innerHTML = '<div class="empty-note">Todavia no hay datos suficientes.</div>';
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

export function renderExerciseRecords(container, records) {
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
              <p class="muted">${escapeHtml(formatUiText(record.pattern || "sin_patron"))} | ${escapeHtml(record.effortType === "isometric_hold" ? "Hold Isometrico" : `RM ${startCase(formatRmSourceType(record.rmSourceType))}`)}</p>
            </div>
            <span class="pill">${escapeHtml(record.recordLabel)}</span>
          </div>
          <div class="record-highlight-grid">
            ${record.effortType === "isometric_hold"
              ? buildRecordDatum("Capacidad Actual", record.capacityLabel || "Sin Dato", { tone: "accent" })
              : buildRecordDatum("RM Actual", formatKgValue(record.currentRmKg), { tone: "accent" })}
            ${record.effortType === "isometric_hold"
              ? buildRecordDatum("Objetivo Proxima Sesion", record.nextTargetLabel || "Sin Objetivo", { tone: "success" })
              : buildRecordDatum("RM Confirmado", formatKgValue(record.confirmedRmKg), { tone: "success" })}
            ${record.effortType === "isometric_hold"
              ? buildRecordDatum("Regla Aplicada", record.progressionReason || "Sin Regla", { full: true })
              : buildRecordDatum("RM Teorico", formatKgValue(record.theoreticalRmKg))}
            ${record.effortType === "isometric_hold"
              ? ""
              : buildRecordDatum("Objetivo Proxima Sesion", record.nextTargetLabel || "Sin Objetivo", { full: true, tone: "accent" })}
            ${buildRecordDatum(record.effortType === "isometric_hold" ? "Mejor Hold" : "Mejor Set", buildBestSetLabel(record.bestSet), { full: true })}
          </div>
          <div class="record-metrics-grid">
            ${buildRecordDatum("Exposiciones", record.occurrences, { tone: "soft" })}
            ${buildRecordDatum("Sets Acumulados", record.totalSets, { tone: "soft" })}
            ${buildRecordDatum("Dolor Medio", `${formatDecimal(record.avgPain)}/10`, { tone: "soft" })}
            ${buildRecordDatum(
              record.effortType === "isometric_hold" ? "Tiempo Del Mejor Hold" : "Reps Estimadas Al Fallo",
              record.effortType === "isometric_hold"
                ? (record.durationSeconds ? `${record.durationSeconds} S` : "Sin Dato")
                : (record.estimatedFailureReps || "Sin Dato"),
              { tone: "soft" }
            )}
            ${record.effortType === "isometric_hold"
              ? ""
              : buildRecordDatum("Regla", record.progressionReason || "Sin Regla", { full: true, tone: "soft" })}
            ${buildRecordDatum("Ultima Vez", record.lastSeenDate || "Sin Fecha", { tone: "soft" })}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}
