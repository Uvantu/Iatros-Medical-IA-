function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

export function classifySelection(value) {
  const sample = value.toLowerCase();
  if (/contraindica|evitar|no usar/.test(sample)) return 'VAR_TX_AVOID';
  if (/tratamiento|iniciar|administrar|manejo/.test(sample)) return 'VAR_TX_FIRST';
  if (/criterio|grave|severa|severidad/.test(sample)) return 'VAR_SEV_CRIT';
  if (/diagnost|defin/.test(sample)) return 'VAR_DX_CRIT';
  if (/siguiente paso|confirmar|estudio/.test(sample)) return 'VAR_NEXT_STEP';
  return 'VAR_DEF_OP';
}

export function inferEntities(value) {
  const entities = [];
  const checks = [
    ['TA', /tension arterial|presion arterial|ta\s|mmhg/],
    ['Proteinuria', /proteinuria|proteinas en orina/],
    ['Plaquetas', /plaquetas?/],
    ['ALT/AST', /tgo|tgp|ast|alt/],
    ['Creatinina', /creatinina/],
    ['Magnesio', /sulfato de magnesio|magnesio/],
    ['Cesárea', /cesarea/],
  ];

  checks.forEach(([label, pattern]) => {
    if (pattern.test(value.toLowerCase())) {
      entities.push(label);
    }
  });

  return entities;
}

export function findKeywordHits(pageText, searchTerm) {
  if (!searchTerm.trim()) return [];
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  const hits = [];
  let match;
  while ((match = regex.exec(pageText)) !== null) {
    hits.push({ index: match.index, value: match[0] });
  }
  return hits;
}

export function createEvidenceSnippet(pageText, selectionText) {
  const normalizedPage = normalizeText(pageText);
  const normalizedSelection = normalizeText(selectionText);
  if (!normalizedSelection) return '';

  const index = normalizedPage.toLowerCase().indexOf(normalizedSelection.toLowerCase().slice(0, 40));
  if (index === -1) return normalizedSelection.slice(0, 220);

  const start = Math.max(0, index - 80);
  const end = Math.min(normalizedPage.length, index + normalizedSelection.length + 80);
  return normalizedPage.slice(start, end);
}

export function buildExtractRecord({ fileName, pageNumber, pageText, selectionText, factLabel, factGroup, reviewer, roleCode, notes }) {
  const normalizedSelection = normalizeText(selectionText);
  const recordKey = `${slugify(fileName)}-p${pageNumber}-${slugify(factLabel || normalizedSelection)}`;
  const keywords = normalizedSelection
    .split(/[,;:.()]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    identity: {
      record_id: `MER-${recordKey}`,
      source_type: 'PDF_GUIDELINE',
      created_by: reviewer,
      created_at: new Date().toISOString(),
    },
    classification: {
      clinical_variable_role_code: roleCode,
      trigger_type_code: /<|>|\d/.test(normalizedSelection) ? 'NUMERIC_THRESHOLD' : 'TEXTUAL_RULE',
      topic_slug: slugify(factGroup),
      extraction_intent: 'TRACEABLE_CLINICAL_RULE',
    },
    source_trace: {
      source_file_name: fileName,
      locator: { page: pageNumber, section_hint: factGroup },
      raw_fragment: selectionText,
      normalized_fragment: normalizedSelection,
      page_text_excerpt: createEvidenceSnippet(pageText, normalizedSelection),
    },
    normalized_content: {
      statement_short: factLabel,
      statement_operational: normalizedSelection,
      keywords,
      entities: inferEntities(normalizedSelection),
      trigger_logic: normalizedSelection,
      clinical_action: /evitar|no usar/.test(normalizedSelection.toLowerCase()) ? '' : normalizedSelection,
      avoid_action: /evitar|no usar/.test(normalizedSelection.toLowerCase()) ? normalizedSelection : '',
    },
    simplified_projection: {
      canonical_fact_key: `${slugify(factGroup)}.${slugify(factLabel || normalizedSelection)}`,
      fact_group: factGroup,
      fact_label: factLabel,
      fact_value_summary: normalizedSelection,
      min_keywords: keywords.slice(0, 4),
      categories: [factGroup],
    },
    quality: {
      semantic_guardrails: {
        requires_exact_locator: true,
        requires_raw_fragment: true,
        forbids_unstated_inference: true,
      },
      review_status: 'CERTIFIED_LOCKED',
      notes,
    },
  };
}

export function validateExtractRecord(record) {
  const issues = [];

  if (!record) {
    issues.push('No existe un registro para validar.');
    return { valid: false, issues };
  }

  if (!record.source_trace?.locator?.page) issues.push('Falta localizador exacto por página.');
  if (!record.source_trace?.raw_fragment?.trim()) issues.push('Falta fragmento bruto.');
  if (!record.source_trace?.page_text_excerpt?.trim()) issues.push('Falta evidencia contextual de página.');
  if (!record.normalized_content?.statement_operational?.trim()) issues.push('Falta statement_operational.');
  if (!record.simplified_projection?.canonical_fact_key?.trim()) issues.push('Falta canonical_fact_key.');
  if (record.normalized_content?.statement_operational?.length > 500) {
    issues.push('El statement_operational es demasiado largo; probablemente aún no está normalizado.');
  }

  return { valid: issues.length === 0, issues };
}

export function buildSimplifiedFact(record) {
  return {
    fact_id: record.identity.record_id.replace('MER-', 'SF-'),
    canonical_fact_key: record.simplified_projection.canonical_fact_key,
    fact_group: record.simplified_projection.fact_group,
    fact_label: record.simplified_projection.fact_label,
    fact_value_summary: record.simplified_projection.fact_value_summary,
    keywords: record.normalized_content.keywords,
    entities: record.normalized_content.entities,
    categories: record.simplified_projection.categories,
    source_trace: record.source_trace,
    status: 'MEDICAL_REVIEW_PENDING',
  };
}

export function downloadJson(payload, fileName) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
