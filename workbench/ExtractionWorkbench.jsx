import { useMemo, useState } from 'react';
import {
  buildExtractRecord,
  buildSimplifiedFact,
  classifySelection,
  createEvidenceSnippet,
  downloadJson,
  findKeywordHits,
  inferEntities,
  validateExtractRecord,
} from './extractionWorkbench';

const CLINICAL_ROLE_OPTIONS = [
  'VAR_DEF_OP',
  'VAR_DX_CRIT',
  'VAR_SEV_CRIT',
  'VAR_DD_KEY',
  'VAR_TX_FIRST',
  'VAR_TX_AVOID',
  'VAR_NEXT_STEP',
  'VAR_CONFIRMATORY_TEST',
  'VAR_MONITORING',
  'VAR_CONTRAINDICATION',
  'VAR_TIME_WINDOW',
  'VAR_COMPLICATION',
];

export default function ExtractionWorkbench({ selectedFile, documentData }) {
  const [activePage, setActivePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionText, setSelectionText] = useState('');
  const [factLabel, setFactLabel] = useState('');
  const [factGroup, setFactGroup] = useState('diagnostico');
  const [reviewer, setReviewer] = useState('Iatros-AI');
  const [roleCode, setRoleCode] = useState('VAR_DX_CRIT');
  const [notes, setNotes] = useState('');

  const pages = documentData?.pages ?? [];
  const currentPage = pages.find((page) => page.pageNumber === activePage) ?? null;

  const keywordHits = useMemo(() => {
    if (!currentPage?.text || !searchTerm.trim()) return [];
    return findKeywordHits(currentPage.text, searchTerm);
  }, [currentPage, searchTerm]);

  const evidenceSnippet = useMemo(() => {
    if (!currentPage?.text || !selectionText.trim()) return '';
    return createEvidenceSnippet(currentPage.text, selectionText);
  }, [currentPage, selectionText]);

  const inferredRole = useMemo(() => classifySelection(selectionText), [selectionText]);
  const inferredEntities = useMemo(() => inferEntities(selectionText), [selectionText]);

  const record = useMemo(() => {
    if (!selectedFile || !currentPage || !selectionText.trim()) return null;

    return buildExtractRecord({
      fileName: selectedFile.name,
      pageNumber: currentPage.pageNumber,
      pageText: currentPage.text,
      selectionText,
      factLabel: factLabel || 'Hecho clínico sin etiqueta',
      factGroup,
      reviewer,
      roleCode,
      notes,
    });
  }, [selectedFile, currentPage, selectionText, factLabel, factGroup, reviewer, roleCode, notes]);

  const validation = useMemo(() => validateExtractRecord(record), [record]);
  const simplifiedFact = useMemo(() => (record ? buildSimplifiedFact(record) : null), [record]);

  return (
    <section className="workbench-panel">
      <div className="panel sticky-panel">
        <h2>Extracción clínica</h2>
        <p className="muted small-text">Selecciona página, filtra texto y captura un fragmento operativo. La salida genera un registro trazable y una ficha simplificada.</p>
      </div>

      <div className="panel">
        <h3>Página activa</h3>
        <div className="row-wrap">
          <select value={activePage} onChange={(event) => setActivePage(Number(event.target.value))} disabled={!pages.length}>
            {pages.map((page) => (
              <option key={page.pageNumber} value={page.pageNumber}>Página {page.pageNumber}</option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Buscar término clínico en la página"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="search-results muted small-text">
          {searchTerm.trim() ? `Coincidencias encontradas en la página: ${keywordHits.length}` : 'Sin filtro activo'}
        </div>

        <textarea className="page-text" value={currentPage?.text ?? 'Carga un PDF para empezar.'} readOnly />
      </div>

      <div className="panel">
        <h3>Fragmento fuente</h3>
        <textarea
          placeholder="Pega aquí el fragmento bruto que sí quieres convertir en hecho clínico."
          value={selectionText}
          onChange={(event) => setSelectionText(event.target.value)}
        />

        <div className="grid-two">
          <label>
            <span>Etiqueta del hecho</span>
            <input value={factLabel} onChange={(event) => setFactLabel(event.target.value)} placeholder="Ej. criterios de severidad" />
          </label>

          <label>
            <span>Grupo</span>
            <select value={factGroup} onChange={(event) => setFactGroup(event.target.value)}>
              <option value="diagnostico">Diagnóstico</option>
              <option value="severidad">Severidad</option>
              <option value="tratamiento">Tratamiento</option>
              <option value="siguiente_paso">Siguiente paso</option>
              <option value="contraindicaciones">Contraindicaciones</option>
              <option value="urgencias">Urgencias</option>
            </select>
          </label>

          <label>
            <span>Clinical variable role</span>
            <select value={roleCode} onChange={(event) => setRoleCode(event.target.value)}>
              {CLINICAL_ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Revisor</span>
            <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} />
          </label>
        </div>

        <label>
          <span>Notas de control</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observaciones clínicas o de calidad" />
        </label>
      </div>

      <div className="panel">
        <h3>Señales automáticas</h3>
        <ul className="status-list compact-list">
          <li>Clasificación sugerida: <strong>{inferredRole}</strong></li>
          <li>Entidades detectadas: <strong>{inferredEntities.join(', ') || 'Sin entidades claras'}</strong></li>
          <li>Evidencia contextual: <strong>{evidenceSnippet || 'Sin evidencia contextual suficiente'}</strong></li>
        </ul>
      </div>

      <div className="panel">
        <h3>Validación del extracto</h3>
        <ul className="status-list compact-list">
          {validation.issues.length ? validation.issues.map((issue) => <li key={issue}>{issue}</li>) : <li>Registro válido para pasar a simplificación.</li>}
        </ul>
      </div>

      <div className="panel">
        <h3>Salida exportable</h3>
        <div className="button-row">
          <button disabled={!record} onClick={() => downloadJson(record, `${record.identity.record_id}.json`)}>Descargar extract record</button>
          <button disabled={!simplifiedFact} onClick={() => downloadJson(simplifiedFact, `${simplifiedFact.fact_id}.json`)}>Descargar simplified fact</button>
        </div>
      </div>

      <div className="panel preview-panel">
        <h3>Medical extract record</h3>
        <pre>{record ? JSON.stringify(record, null, 2) : 'Aún no hay registro generado.'}</pre>
      </div>

      <div className="panel preview-panel">
        <h3>Simplified fact</h3>
        <pre>{simplifiedFact ? JSON.stringify(simplifiedFact, null, 2) : 'Aún no hay ficha simplificada.'}</pre>
      </div>
    </section>
  );
}
