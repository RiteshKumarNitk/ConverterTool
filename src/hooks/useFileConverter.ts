import { useState } from 'react';
import { ConversionResult } from '../types';
import { convertImageToPDF, convertPDFToImages } from '../utils/fileConverter';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const useFileConverter = () => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [progress, setProgress] = useState<{current: number; total: number} | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsConverting(true);
    setError(null);
    setWarning(null);
    setResults([]);
    setProgress(null);

    try {
      const newResults: ConversionResult[] = [];
      let hasLargeFile = false;
      let totalPages = 0;
      let processedPages = 0;

      // Calculate total pages for progress tracking
      for (const file of files) {
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          totalPages += pdf.numPages;
        } else {
          totalPages += 1; // Each image counts as one
        }
      }

      for (const file of files) {
        const fileType = file.type;
        
        if (fileType.startsWith('image/')) {
          // Convert image to PDF
          const pdfBlob = await convertImageToPDF(file);
          const downloadUrl = URL.createObjectURL(pdfBlob);
          newResults.push({
            fileName: `${file.name.replace(/\.[^/.]+$/, "")}.pdf`,
            downloadUrl,
            type: 'pdf'
          });
          
          // Update progress
          processedPages += 1;
          setProgress({ current: processedPages, total: totalPages });
        } else if (fileType === 'application/pdf') {
          // Check file size for PDFs
          if (file.size > 50 * 1024 * 1024) { // 50MB limit
            hasLargeFile = true;
            continue;
          }
          
          // Convert PDF to images
          try {
            const imageBlobs = await convertPDFToImages(file);
            imageBlobs.forEach((blob, index) => {
              const downloadUrl = URL.createObjectURL(blob);
              newResults.push({
                fileName: `${file.name.replace(/\.[^/.]+$/, "")}_page_${index + 1}.png`,
                downloadUrl,
                type: 'image'
              });
              
              // Update progress
              processedPages += 1;
              setProgress({ current: processedPages, total: totalPages });
            });
          } catch (err) {
            setWarning(
              err instanceof Error ? err.message : 'Conversion failed for this PDF'
            );
          }
        } else {
          throw new Error(`Unsupported file type: ${fileType}`);
        }
      }

      if (hasLargeFile) {
        setWarning(
          'Large PDF files (>50MB) were skipped for performance reasons'
        );
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