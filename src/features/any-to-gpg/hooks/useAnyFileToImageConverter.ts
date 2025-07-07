// ✅ src/features/any-to-gpg/hooks/useAnyFileToImageConverter.ts
import { useState } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { ConversionResult } from '../../../types';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const useAnyFileToImageConverter = () => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[], outputFormat: 'jpeg' | 'png' = 'jpeg') => {
    setResults([]);
    setError(null);
    setIsConverting(true);

    // Validation
    if (files.length > 1500) {
      setError('You can upload up to 1500 files only.');
      setIsConverting(false);
      return;
    }

    const oversized = files.find(f => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setError(`File "${oversized.name}" is larger than 5MB.`);
      setIsConverting(false);
      return;
    }

    try {
      const newResults: ConversionResult[] = [];

      for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;
            const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), `image/${outputFormat}`));
            const url = URL.createObjectURL(blob);

            newResults.push({
              fileName: `${file.name.replace(/\.[^/.]+$/, '')}_page_${i}.${outputFormat}`,
              downloadUrl: url,
              type: 'image',
            });
          }
        } else if (['png', 'jpg', 'jpeg'].includes(ext || '')) {
          const image = new Image();
          const url = URL.createObjectURL(file);

          await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = url;
          });

          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(image, 0, 0);

          const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), `image/${outputFormat}`));
          const newUrl = URL.createObjectURL(blob);

          newResults.push({
            fileName: `${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`,
            downloadUrl: newUrl,
            type: 'image',
          });
        } else {
          throw new Error('Unsupported file type: ' + file.name);
        }
      }

      setResults(newResults);
    } catch (err) {
      setError('Conversion failed: ' + (err as Error).message);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    results.forEach((r) => {
      fetch(r.downloadUrl).then(res => res.blob()).then(blob => {
        zip.file(r.fileName, blob);
      });
    });

    setTimeout(async () => {
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_images.zip';
      a.click();
      URL.revokeObjectURL(url);
    }, 500);
  };

  return {
    results,
    isConverting,
    error,
    handleFiles,
    downloadAllAsZip
  };
};
