import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfViewer({ fileUrl }) {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError('');

      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const loadedPdf = await loadingTask.promise;
        if (cancelled) return;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setPageNum(1);
      } catch (err) {
        if (!cancelled) {
          setError('No se pudo abrir el PDF.');
          setPdf(null);
          setNumPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (fileUrl) loadPdf();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  useEffect(() => {
    async function renderPage() {
      if (!pdf || !canvasRef.current) return;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    }

    renderPage();
  }, [pdf, pageNum, scale]);

  if (loading) {
    return <div className="status-box">Cargando PDF...</div>;
  }

  if (error) {
    return <div className="status-box error">{error}</div>;
  }

  if (!pdf) {
    return null;
  }

  return (
    <div className="pdf-shell">
      <div className="toolbar">
        <button onClick={() => setPageNum((p) => Math.max(1, p - 1))}>Anterior</button>
        <span>Página {pageNum} / {numPages}</span>
        <button onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}>Siguiente</button>
        <button onClick={() => setScale((s) => Math.max(0.6, Number((s - 0.1).toFixed(2))))}>-</button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((s) => Number((s + 0.1).toFixed(2)))}>+</button>
      </div>

      <div className="pdf-canvas-wrap">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  );
}
