import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { ConversionResult } from '../../../types';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const useAnyFileToImageConverter = () => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const resultsRef = useRef<ConversionResult[]>([]);
  resultsRef.current = results;

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      resultsRef.current.forEach(r => {
        URL.revokeObjectURL(r.downloadUrl);
      });
    };
  }, []);

  const handleFiles = async (files: File[], outputFormat: 'jpg' | 'jpeg' | 'png' | 'pdf') => {
    // Clear previous results and errors
    setResults(prev => {
      prev.forEach(r => URL.revokeObjectURL(r.downloadUrl));
      return [];
    });
    setError(null);
    setIsConverting(true);

    // Validation
    if (files.length === 0) {
      setError('No files selected');
      setIsConverting(false);
      return;
    }

    if (files.length > 100) {
      setError('Maximum 100 files allowed at once');
      setIsConverting(false);
      return;
    }

    const oversized = files.find(f => f.size > 25 * 1024 * 1024);
    if (oversized) {
      setError(`File "${oversized.name}" exceeds 25MB limit`);
      setIsConverting(false);
      return;
    }

    try {
      const newResults: ConversionResult[] = [];
      
      // Normalize jpg to jpeg for internal processing
      const internalFormat = outputFormat === 'jpg' ? 'jpeg' : outputFormat;
      
      // Process files sequentially to avoid memory issues
      for (const file of files) {
        try {
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          
          // PDF file handling
          if (ext === 'pdf') {
            if (internalFormat === 'pdf') {
              // Keep PDF as is
              newResults.push({
                fileName: file.name,
                downloadUrl: URL.createObjectURL(file),
                type: 'pdf',
                originalFile: file
              });
            } else {
              // Convert PDF to images
              const arrayBuffer = await file.arrayBuffer();
              const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d')!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;
                const blob = await new Promise<Blob>(resolve => 
                  canvas.toBlob(blob => resolve(blob!), `image/${internalFormat}`, 0.9));
                
                newResults.push({
                  fileName: `${file.name.replace(/\.[^/.]+$/, '')}_page_${i}.${outputFormat}`,
                  downloadUrl: URL.createObjectURL(blob),
                  type: 'image',
                  originalFile: file
                });
              }
            }
          } 
          // Image file handling
          else if (['png', 'jpg', 'jpeg'].includes(ext)) {
            if (internalFormat === 'pdf') {
              // Convert image to PDF
              const pdfDoc = await PDFDocument.create();
              const imageBytes = await file.arrayBuffer();
              
              const image = ext === 'png' 
                ? await pdfDoc.embedPng(imageBytes)
                : await pdfDoc.embedJpg(imageBytes);
              
              const page = pdfDoc.addPage([image.width, image.height]);
              page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
              });
              
              const pdfBytes = await pdfDoc.save();
              const blob = new Blob([pdfBytes], { type: 'application/pdf' });
              
              newResults.push({
                fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
                downloadUrl: URL.createObjectURL(blob),
                type: 'pdf',
                originalFile: file
              });
            } else {
              // Convert between image formats
              const img = await createImageBitmap(file);
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d')!;
              ctx.drawImage(img, 0, 0);
              
              const blob = await new Promise<Blob>(resolve => 
                canvas.toBlob(blob => resolve(blob!), `image/${internalFormat}`, 0.9));
              
              newResults.push({
                fileName: `${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`,
                downloadUrl: URL.createObjectURL(blob),
                type: 'image',
                originalFile: file
              });
              
              img.close();
            }
          } else {
            throw new Error(`Unsupported file type: ${file.name}`);
          }
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err);
          // Continue with next file even if one fails
        }
      }

      setResults(newResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;

    setIsGeneratingZip(true);
    setError(null);

    try {
      const zip = new JSZip();
      
      // Process files in batches to avoid memory issues
      const batchSize = 10;
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        await Promise.all(batch.map(async (result) => {
          const response = await fetch(result.downloadUrl);
          const blob = await response.blob();
          zip.file(result.fileName, blob);
        }));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_files.zip';
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      setError('Failed to create ZIP archive');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const downloadAllAsPDF = async () => {
    if (results.length === 0) return;

    setIsGeneratingPDF(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();
      
      // Process each result
      for (const result of results) {
        try {
          if (result.type === 'pdf') {
            // Merge PDF pages
            const existingPdfBytes = await fetch(result.downloadUrl).then(res => res.arrayBuffer());
            const donorPdf = await PDFDocument.load(existingPdfBytes);
            const pages = await pdfDoc.copyPages(donorPdf, donorPdf.getPageIndices());
            pages.forEach(page => pdfDoc.addPage(page));
          } else {
            // Convert image to PDF page
            const imageBytes = await fetch(result.downloadUrl).then(res => res.arrayBuffer());
            const image = result.fileName.endsWith('.png')
              ? await pdfDoc.embedPng(imageBytes)
              : await pdfDoc.embedJpg(imageBytes);
            
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
            });
          }
        } catch (err) {
          console.error(`Error adding ${result.fileName} to PDF:`, err);
          // Continue with next file
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_files.pdf';
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      setError('Failed to merge files into PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const resetConverter = () => {
    setResults(prev => {
      prev.forEach(r => URL.revokeObjectURL(r.downloadUrl));
      return [];
    });
    setError(null);
  };

  return {
    results,
    isConverting,
    error,
    isGeneratingZip,
    isGeneratingPDF,
    handleFiles,
    downloadAllAsZip,
    downloadAllAsPDF,
    resetConverter
  };
};