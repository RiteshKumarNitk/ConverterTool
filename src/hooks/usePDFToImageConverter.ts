import { useState } from 'react';
import { ConversionResult } from '../types';
import { convertPDFToImages } from '../utils/fileConverter';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const usePDFToImageConverter = () => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFiles = async (files: File[]) => {
    // Reset
    setError(null);
    setWarning(null);
    setProgress(null);
    setResults([]);

    const pdfs = files.filter(file => file.type === 'application/pdf');

    if (pdfs.length === 0) {
      setError('Please upload PDF files only.');
      return;
    }

    if (pdfs.length < files.length) {
      setWarning('Some non-PDF files were skipped. Only PDF files are supported.');
    }

    setIsConverting(true);

    try {
      const newResults: ConversionResult[] = [];
      let totalPages = 0;
      let processedPages = 0;

      for (const file of pdfs) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        totalPages += pdf.numPages;

        const imageBlobs = await convertPDFToImages(file);
        imageBlobs.forEach((blob, index) => {
          const downloadUrl = URL.createObjectURL(blob);
          newResults.push({
            fileName: `${file.name.replace(/\.[^/.]+$/, '')}_page_${index + 1}.png`,
            downloadUrl,
            type: 'image'
          });

          processedPages++;
          setProgress({ current: processedPages, total: totalPages });
        });
      }

      setResults(newResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during conversion');
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  };

  const resetConverter = () => {
    setResults([]);
    setError(null);
    setWarning(null);
    setProgress(null);
  };

  return {
    results,
    isConverting,
    error,
    warning,
    progress,
    handleFiles,
    resetConverter
  };
};
