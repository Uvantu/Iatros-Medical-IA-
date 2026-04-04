import { renderRecommendation } from "./renderers/heuristic-recommendation.js";
import { renderAdaptiveRecommendation } from "./renderers/adaptive-recommendation.js";
import { renderSimulationRoutes } from "./renderers/simulation-routes.js";
import { buildRouteRoleLabel, buildRouteRoleClass } from "./helpers/route-labels.js";

export function createUiBridge(helpers = {}) {
  return {
    renderRecommendation: (container, scoringContainer, recommendation) =>
      renderRecommendation(container, scoringContainer, recommendation, helpers),

    renderAdaptiveRecommendation: (container, scoringContainer, recommendation) =>
      renderAdaptiveRecommendation(container, scoringContainer, recommendation, helpers),

    renderSimulationRoutes: (container, recommendation) =>
      renderSimulationRoutes(container, recommendation, helpers),

    buildRouteRoleLabel,
    buildRouteRoleClass
  };
}
