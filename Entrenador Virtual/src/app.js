import {
  buildCurrentState,
  recommendSession,
  buildSessionInsight,
  buildWeeklyDashboard,
  buildPerformanceSnapshot,
} from "./engine.js";
import {
  createSessionId,
  createExerciseEntryId,
  getLatestCheckin,
  getLatestSession,
  loadAppData,
  saveCheckin,
  saveSession,
} from "./storage.js";
import {
  createSeedData,
  exerciseCategoryLabels,
  exercisePatternOptions,
  exerciseSideOptions,
  patternLabels,
} from "./seed.js";
import {
  renderContextSummary,
  renderProfileSummary,
  renderRecommendation,
  renderPostSessionInsight,
  renderWeeklyDashboard,
  renderPerformanceGoals,
  renderPerformanceData,
  renderExerciseRecords,
  renderSessionHistory,
} from "./ui.js";

const elements = {
  statusLine: document.querySelector("#status-line"),
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
  sessionCouldFinish: document.querySelector("#session-could-finish"),
};

const state = {
  data: createSeedData(),
  lastSavedSessionId: null,
  currentScreen: "main",
  syncStatus: "Conectando con la base de datos local...",
  sessionCaptureVisible: false,
};

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

function buildOptions(options, formatter) {
  return options.map((option) => formatter(option)).join("");
}

function buildPatternOptionMarkup(selectedValue = "") {
  return `
    <option value="" ${selectedValue === "" ? "selected" : ""}>Selecciona patron</option>
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
        <span>Categoria</span>
        <select name="category">
          ${buildCategoryOptionMarkup(entry.category || "specific_aw")}
        </select>
      </label>

      <label class="field">
        <span>Patron</span>
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
          <option value="dynamic" ${(entry.effort_type || "dynamic") === "dynamic" ? "selected" : ""}>Dinamico</option>
          <option value="isometric_hold" ${(entry.effort_type || "dynamic") === "isometric_hold" ? "selected" : ""}>Hold isometrico</option>
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
        <span>Calidad tecnica</span>
        <input name="technique_quality" type="number" min="0" max="1" step="0.05" value="${entry.technique_quality ?? 0.8}" required>
      </label>

      <label class="field field-span-4">
        <span>Notas</span>
        <textarea name="notes" placeholder="sin colapso de nudillos, buen freno inicial, dolor estable...">${entry.notes || ""}</textarea>
      </label>

      <label class="toggle field field-span-4">
        <input name="confirmed_rm" type="checkbox" ${entry.confirmed_rm ? "checked" : ""}>
        <span>Esta entrada incluye un RM confirmado real a 1 repeticion</span>
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
    fatigue: { global: 5, forearm_hand: 5, back: 3, legs: 3 },
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
      wrist_right: 0,
    },
    fatigue: {
      global: Number(elements.checkinGlobalFatigue.value),
      forearm_hand: Number(elements.checkinForearmFatigue.value),
      back: Number(elements.checkinBackFatigue.value),
      legs: Number(elements.checkinLegsFatigue.value),
    },
    available_time_min: Number(elements.checkinTime.value),
    session_type_planned: elements.checkinPlanned.value,
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
      could_finish: elements.sessionCouldFinish.checked,
    },
    pain_events: medialPain > 0
      ? [
          {
            zone: "medial_elbow_right",
            type: medialPain >= 5 ? "pain_spike" : "irritability",
            severity: medialPain,
            during: elements.sessionType.value,
            resolved_with: "not_recorded",
          },
        ]
      : [],
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
    notes: row.querySelector('[name="notes"]').value.trim(),
  }));
}

function getFeaturedSession() {
  if (state.lastSavedSessionId) {
    return state.data.sessions.find((session) => session.session_id === state.lastSavedSessionId) || null;
  }

  return getLatestSession(state.data);
}

function setCurrentScreen(screenName) {
  state.currentScreen = screenName;
  const showingPerformance = screenName === "performance";

  elements.mainScreen.classList.toggle("screen-hidden", showingPerformance);
  elements.performanceScreen.classList.toggle("screen-hidden", !showingPerformance);

  if (elements.screenIndicator) {
    elements.screenIndicator.textContent = showingPerformance
      ? "Pantalla actual: rendimiento"
      : "Pantalla actual: panel principal";
  }

  if (elements.toggleScreenButton) {
    elements.toggleScreenButton.textContent = showingPerformance
      ? "Volver al panel principal"
      : "Ver pantalla de rendimiento";
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
    panel.classList.remove("panel-spotlight");
  }, 1400);
}

function navigateToPanel(screenName, panel, focusElement) {
  setCurrentScreen(screenName);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (panel) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
        highlightPanel(panel);
      }

      if (focusElement && typeof focusElement.focus === "function") {
        window.setTimeout(() => {
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
  navigateToPanel("performance", elements.recordsPanel);
}

function renderApp() {
  const latestCheckin = getLatestCheckin(state.data);
  const context = latestCheckin
    ? buildCurrentState(state.data.athleteProfile, state.data.sessions, latestCheckin, state.data.exerciseEntries)
    : null;
  const recommendation = latestCheckin
    ? recommendSession(state.data.athleteProfile, state.data.sessions, latestCheckin, state.data.exerciseEntries)
    : null;
  const featuredSession = getFeaturedSession();
  const postSessionInsight = featuredSession
    ? buildSessionInsight(state.data.athleteProfile, featuredSession, state.data.exerciseEntries)
    : null;
  const weeklyDashboard = buildWeeklyDashboard(
    state.data.athleteProfile,
    state.data.dailyCheckins,
    state.data.sessions,
    state.data.exerciseEntries,
    latestCheckin?.date || todayText()
  );
  const performanceSnapshot = buildPerformanceSnapshot(
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
    exerciseEntries: state.data.exerciseEntries,
  });

  renderRecommendation(elements.recommendationShell, elements.scoringShell, recommendation);

  if (elements.postSessionShell) {
    renderPostSessionInsight(elements.postSessionShell, postSessionInsight);
  }

  if (elements.weeklyDashboard) {
    renderWeeklyDashboard(elements.weeklyDashboard, weeklyDashboard);
  }

  if (elements.sessionHistory) {
    renderSessionHistory(elements.sessionHistory, state.data.sessions, state.data.exerciseEntries);
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
    elements.heroFocusValue.textContent = recommendation?.session_recommendation?.label || "Sin Foco";
  }

  elements.statusLine.textContent = state.syncStatus;
  setSessionCaptureVisible(state.sessionCaptureVisible);
  setCurrentScreen(state.currentScreen);
}

function updateSyncStatusFromData() {
  if (window.location.protocol === "file:") {
    state.syncStatus = "Usa .\\serve.ps1 para activar SQLite.";
    return;
  }

  if (state.data?.storage?.mode === "sqlite") {
    const syncTime = state.data?.storage?.lastSyncAt
      ? new Date(state.data.storage.lastSyncAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
      : null;
    state.syncStatus = syncTime
      ? `SQLite activa | ${syncTime}`
      : "Base SQLite activa.";
    return;
  }

  state.syncStatus = "Semilla temporal";
}

async function handleCheckinSubmit(event) {
  event.preventDefault();

  try {
    state.data = await saveCheckin(readCheckinForm());
    updateSyncStatusFromData();
    renderApp();
  } catch (error) {
    console.error("No fue posible guardar el check-in.", error);
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
    exercise_entry_count: exerciseEntries.length,
  };

  try {
    state.data = await saveSession(session, exerciseEntries);
    state.lastSavedSessionId = session.session_id;
    updateSyncStatusFromData();
    fillSessionForm();
    renderApp();
  } catch (error) {
    console.error("No fue posible guardar la sesion.", error);
    state.syncStatus = `Error al guardar sesion: ${error.message}`;
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
  state.data = await loadAppData();
  updateSyncStatusFromData();
}

async function init() {
  await hydrateData();
  fillCheckinForm(getLatestCheckin(state.data));
  fillSessionForm();

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

  renderApp();
}

init().catch((error) => {
  console.error("No fue posible iniciar la app.", error);
  state.syncStatus = `Error de inicio: ${error.message}`;
  renderApp();
});
