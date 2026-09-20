import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function normalizePageText(items) {
  return items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
}

export default function PdfViewer({ fileUrl, onDocumentReady }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setExtracting(true);
      setError('');
      onDocumentReady?.(null);

      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const loadedPdf = await loadingTask.promise;
        if (cancelled) {
          await loadedPdf.destroy();
          return;
        }

        const extractedPages = [];
        for (let currentPage = 1; currentPage <= loadedPdf.numPages; currentPage += 1) {
          const page = await loadedPdf.getPage(currentPage);
          const textContent = await page.getTextContent();
          extractedPages.push({
            pageNumber: currentPage,
            rawItems: textContent.items.map((item) => item.str),
            text: normalizePageText(textContent.items),
          });
        }

        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setPageNum(1);
        setPageInput('1');
        onDocumentReady?.({ pages: extractedPages, totalPages: loadedPdf.numPages });
      } catch (err) {
        if (!cancelled) {
          setError('No se pudo abrir o extraer el contenido del PDF.');
          setPdf(null);
          setNumPages(0);
          onDocumentReady?.(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setExtracting(false);
        }
      }
    }

    if (fileUrl) loadPdf();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel?.();
    };
  }, [fileUrl, onDocumentReady]);

  useEffect(() => {
    let cancelled = false;

    async function renderPage() {
      if (!pdf || !canvasRef.current) return;

      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTaskRef.current?.cancel?.();
        const renderTask = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err) {
        if (!cancelled && err?.name !== 'RenderingCancelledException') {
          setError('No se pudo renderizar la página seleccionada.');
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel?.();
    };
  }, [pdf, pageNum, scale]);

  useEffect(() => {
    setPageInput(String(pageNum));
  }, [pageNum]);

  if (loading) return <div className="status-box">Cargando PDF…</div>;
  if (error) return <div className="status-box error">{error}</div>;
  if (!pdf) return null;

  return (
    <section className="pdf-panel">
      <div className="toolbar">
        <button onClick={() => setPageNum((value) => Math.max(1, value - 1))}>Anterior</button>
        <button onClick={() => setPageNum((value) => Math.min(numPages, value + 1))}>Siguiente</button>
        <label className="toolbar-group">
          <span>Página</span>
          <input
            className="page-input"
            inputMode="numeric"
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => {
              const parsed = Number(pageInput);
              if (!parsed) {
                setPageInput(String(pageNum));
                return;
              }
              setPageNum(Math.max(1, Math.min(numPages, parsed)));
            }}
          />
          <span>/ {numPages}</span>
        </label>
        <button onClick={() => setScale((value) => Math.max(0.6, Number((value - 0.1).toFixed(2))))}>−</button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((value) => Math.min(2.5, Number((value + 0.1).toFixed(2))))}>+</button>
        <span className="muted small-text">{extracting ? 'Extrayendo texto…' : 'Texto extraído'}</span>
      </div>

      <div className="pdf-canvas-wrap">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </section>
  );
}
