import { useMemo, useState } from 'react';
import PdfViewer from './components/PdfViewer';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Iatros Medical IA</h1>
        <p className="muted">Lector PDF interno base para Codex.</p>

        <label className="upload-box">
          <span>Seleccionar PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="panel">
          <h2>Archivo actual</h2>
          <p>{selectedFile ? selectedFile.name : 'Ningún archivo cargado'}</p>
        </div>

        <div className="panel">
          <h2>Siguiente paso</h2>
          <p>
            Esta base ya permite cargar y visualizar PDFs dentro de la app.
            Después se puede añadir extracción de texto, búsqueda clínica e indexación.
          </p>
        </div>
      </aside>

      <main className="viewer-area">
        {fileUrl ? (
          <PdfViewer fileUrl={fileUrl} />
        ) : (
          <div className="empty-state">
            <h2>Sin PDF cargado</h2>
            <p>Sube un archivo PDF para abrirlo dentro del visor.</p>
          </div>
        )}
      </main>
    </div>
  );
}
