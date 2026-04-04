export function renderRecommendation(container, scoringContainer, recommendation, helpers = {}) {
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
