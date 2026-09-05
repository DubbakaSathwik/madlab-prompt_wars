import * as pdfjsLib from 'pdfjs-dist';

// Vite worker URL instantiation - standard syntax compatible with TypeScript & Rollup
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
}

export interface PdfExtractionResult {
  fullText: string;
  pageTexts: string[];
  pageCount: number;
}

export class PdfExtractorService {
  /**
   * Extracts text line-by-line from all pages of a PDF document
   */
  static async extractText(file: File | Blob): Promise<PdfExtractionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    try {
      const pageCount = pdf.numPages;
      const pageTexts: string[] = [];
      let fullText = '';

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageLines: string[] = [];
        let currentLine = '';
        let lastY: number | null = null;

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          const y = item.transform ? Math.round(item.transform[5]) : null;
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = item.str;
          } else {
            currentLine += (currentLine ? ' ' : '') + item.str;
          }
          lastY = y;
        }
        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }

        const pageText = pageLines.join('\n');
        pageTexts.push(pageText);
        fullText += `\n=== PAGE ${pageNum} OF ${pageCount} ===\n${pageText}\n`;
      } catch (pageErr) {
        console.warn(`[PdfExtractorService] Error extracting page ${pageNum}:`, pageErr);
        pageTexts.push('');
      }
    }

    return { fullText, pageTexts, pageCount };
  } finally {
    try {
      pdf.cleanup();
      loadingTask.destroy();
    } catch {
      // Ignore disposal warnings
    }
  }
}
}
