import { useState } from 'react';
import { ConversionResult } from '../types';
import { convertImageToPDF } from '../utils/fileConverter';

export const useImageToPDFConverter = () => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFiles = async (files: File[]) => {
    // Reset states
    setError(null);
    setWarning(null);
    setProgress(null);
    setResults([]);

    // Filter image files only
    const images = files.filter(file => file.type.startsWith('image/'));

    // Block processing if no images found
    if (images.length === 0) {
      setError('Please upload image files only.');
      return;
    }

    // Warn if some files were skipped
    if (images.length < files.length) {
      setWarning('Some non-image files were skipped. Only image files are supported.');
    }

    setIsConverting(true);

    try {
      const newResults: ConversionResult[] = [];
      const total = images.length;
      let current = 0;

      for (const file of images) {
        const pdfBlob = await convertImageToPDF(file);
        const downloadUrl = URL.createObjectURL(pdfBlob);
        newResults.push({
          fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
          downloadUrl,
          type: 'pdf'
        });

        current += 1;
        setProgress({ current, total });
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
