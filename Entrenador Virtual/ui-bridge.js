/* Generated from Entrenador Virtual/src/ui/browser-entry.js - do not edit manually */
(() => {
  // ../src/ui/renderers/heuristic-recommendation.js
  function renderRecommendation(container, scoringContainer, recommendation, helpers = {}) {
    const escapeHtml = helpers.escapeHtml || ((value) => String(value ?? ""));
    const formatUiText = helpers.formatUiText || ((value) => String(value ?? ""));
    const payload = recommendation?.session_recommendation;
    if (!payload) {
      container.innerHTML = '<div class="empty-note">No hay recomendacion heuristica disponible.</div>';
      scoringContainer.innerHTML = "";
      return;
    }
    container.innerHTML = `
    <article class="recommendation-card">
      <h3>${escapeHtml(payload.label || "Recomendacion del dia")}</h3>
      <div class="recommendation-meta">
        <p>${escapeHtml(payload.explanation || "Sin explicacion disponible.")}</p>
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

  // ../src/ui/renderers/adaptive-recommendation.js
  function renderAdaptiveRecommendation(container, scoringContainer, recommendation, helpers = {}) {
    const escapeHtml = helpers.escapeHtml || ((value) => String(value ?? ""));
    const formatUiText = helpers.formatUiText || ((value) => String(value ?? ""));
    if (!container || !scoringContainer) {
      return;
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
        return "<li>Sin ejercicios definidos.</li>";
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

  // ../src/ui/helpers/route-labels.js
  function buildRouteRoleLabel(role) {
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
  function buildRouteRoleClass(role) {
    switch (role) {
      case "primary":
        return "primary";
      case "alternative":
        return "alternative";
      case "contingency":
        return "contingency";
      default:
        return "generic";
    }
  }

  // ../src/ui/renderers/simulation-routes.js
  function buildRouteCard(route, role, helpers = {}) {
    const escapeHtml = helpers.escapeHtml || ((value) => String(value ?? ""));
    const formatDecimal = helpers.formatDecimal || ((value, digits = 2) => Number(value || 0).toFixed(digits));
    const formatUiText = helpers.formatUiText || ((value) => String(value ?? ""));
    const buildRouteBreakdownSummary = helpers.buildRouteBreakdownSummary || (() => "");
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
        <span class="pill ${buildRouteRoleClass(role) === "primary" ? "" : "pill-muted"}">Score ${escapeHtml(formatDecimal(route.totalScore, 2))}</span>
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
  function renderSimulationRoutes(container, recommendation, helpers = {}) {
    if (!container) {
      return;
    }
    if (!recommendation) {
      container.innerHTML = '<div class="empty-note">Todavia no hay rutas simuladas disponibles.</div>';
      return;
    }
    const primary = recommendation.primaryRoute || null;
    const alternative = recommendation.alternativeRoute || null;
    const contingency = recommendation.contingencyRoute || null;
    container.innerHTML = `
    <div class="summary-grid">
      ${buildRouteCard(primary, "primary", helpers)}
      ${buildRouteCard(alternative, "alternative", helpers)}
    </div>
    <div class="summary-grid">
      ${buildRouteCard(contingency, "contingency", helpers)}
    </div>
  `;
  }

  // ../src/ui/legacy-bridge.js
  function createUiBridge(helpers = {}) {
    return {
      renderRecommendation: (container, scoringContainer, recommendation) => renderRecommendation(container, scoringContainer, recommendation, helpers),
      renderAdaptiveRecommendation: (container, scoringContainer, recommendation) => renderAdaptiveRecommendation(container, scoringContainer, recommendation, helpers),
      renderSimulationRoutes: (container, recommendation) => renderSimulationRoutes(container, recommendation, helpers),
      buildRouteRoleLabel,
      buildRouteRoleClass
    };
  }

  // ../src/ui/default-bridge.js
  function createDefaultUiBridge() {
    return createUiBridge({
      escapeHtml: (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"),
      formatUiText: (value) => String(value ?? ""),
      formatDecimal: (value, digits = 2) => Number(value || 0).toFixed(digits),
      buildRouteBreakdownSummary: (route) => {
        const breakdown = route?.scoreBreakdown || route?.ippBreakdown || {};
        const parts = [];
        if (breakdown.transferToTable !== void 0) {
          parts.push(`mesa ${Number(breakdown.transferToTable).toFixed(2)}`);
        }
        if (breakdown.offensiveImprovement !== void 0) {
          parts.push(`ofensiva ${Number(breakdown.offensiveImprovement).toFixed(2)}`);
        }
        if (breakdown.tissueSustainability !== void 0) {
          parts.push(`tejido ${Number(breakdown.tissueSustainability).toFixed(2)}`);
        }
        if (breakdown.continuityRobustness !== void 0) {
          parts.push(`robustez ${Number(breakdown.continuityRobustness).toFixed(2)}`);
        }
        return parts.join(" | ");
      }
    });
  }

  // src/ui/browser-entry.js
  window.__ENTRENADOR_UI_BRIDGE__ = createDefaultUiBridge();
})();
