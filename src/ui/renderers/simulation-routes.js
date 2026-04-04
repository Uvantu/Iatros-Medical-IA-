import { buildRouteRoleLabel, buildRouteRoleClass } from "../helpers/route-labels.js";

export function buildRouteCard(route, role, helpers = {}) {
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
  const weakest = Array.isArray(route?.route?.predictedSummary?.weakestPredictedFactors)
    ? route.route.predictedSummary.weakestPredictedFactors.map((item) => formatUiText(item)).join(", ")
    : "Sin dato";

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

export function renderSimulationRoutes(container, recommendation, helpers = {}) {
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
