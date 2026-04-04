export function buildRouteRoleLabel(role) {
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

export function buildRouteRoleClass(role) {
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
