import { useState } from 'react';
import { convertImageToPDF, mergeImagesToPDF } from '../../../utils/fileConverter';
import { ConversionResult } from './../../../types/index';

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

      // If multiple images were uploaded, create a merged PDF version
      if (images.length > 1) {
        try {
          const mergedBlob = await mergeImagesToPDF(images);
          const downloadUrl = URL.createObjectURL(mergedBlob);

          // Add merged result at the beginning
          newResults.unshift({
            fileName: `Merged_Images_${Date.now()}.pdf`,
            downloadUrl,
            type: 'pdf'
          });
        } catch (mergeErr) {
          console.error("Merge failed", mergeErr);
          setWarning(prev => (prev ? prev + " " : "") + "Failed to create merged PDF.");
        }
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
