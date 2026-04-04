import { createUiBridge } from "./legacy-bridge.js";

export function createDefaultUiBridge() {
  return createUiBridge({
    escapeHtml: (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;"),

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
