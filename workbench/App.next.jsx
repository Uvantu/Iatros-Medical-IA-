import { useEffect, useMemo, useState } from 'react';
import PdfViewer from './PdfViewer.next';
import ExtractionWorkbench from './ExtractionWorkbench';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentData, setDocumentData] = useState(null);

  const fileUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Iatros Medical IA</h1>
        <p className="muted">Mesa de extracción clínica con trazabilidad para convertir PDFs médicos en registros reutilizables.</p>

        <label className="upload-box">
          <span>Seleccionar PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const nextFile = e.target.files?.[0] ?? null;
              setSelectedFile(nextFile);
              setDocumentData(null);
            }}
          />
        </label>

        <div className="panel compact-panel">
          <h2>Archivo actual</h2>
          <p>{selectedFile ? selectedFile.name : 'Ningún archivo cargado'}</p>
        </div>

        <div className="panel compact-panel">
          <h2>Estado del pipeline</h2>
          <ul className="status-list">
            <li>1. PDF bruto</li>
            <li>2. Texto por página</li>
            <li>3. Fragmento seleccionado</li>
            <li>4. Medical extract record</li>
            <li>5. Simplified fact</li>
          </ul>
        </div>
      </aside>

      <main className="workspace-area">
        {fileUrl ? (
          <div className="workspace-grid">
            <PdfViewer fileUrl={fileUrl} onDocumentReady={setDocumentData} />
            <ExtractionWorkbench selectedFile={selectedFile} documentData={documentData} />
          </div>
        ) : (
          <div className="empty-state">
            <h2>Sin PDF cargado</h2>
            <p>Sube un archivo PDF para abrirlo, extraer texto por página y construir hechos clínicos trazables.</p>
          </div>
        )}
      </main>
    </div>
  );
}
