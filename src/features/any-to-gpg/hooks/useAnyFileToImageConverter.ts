import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { ConversionResult } from '../../../types';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const useAnyFileToImageConverter = () => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const resultsRef = useRef<ConversionResult[]>([]);
  resultsRef.current = results;

  useEffect(() => {
    return () => {
      resultsRef.current.forEach(r => {
        URL.revokeObjectURL(r.downloadUrl);
      });
    };
  }, []);

  const handleFiles = async (files: File[], outputFormat: 'jpeg' | 'png' = 'jpeg') => {
    setResults(prev => {
      prev.forEach(r => URL.revokeObjectURL(r.downloadUrl));
      return [];
    });

    setError(null);
    setIsConverting(true);

    if (files.length > 2500) {
      setError('You can upload up to 2500 files only.');
      setIsConverting(false);
      return;
    }

    const oversized = files.find(f => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setError(`File "${oversized.name}" is larger than 10MB.`);
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
            const blob = await new Promise<Blob>((resolve) => 
              canvas.toBlob((b) => resolve(b!), `image/${outputFormat}`));
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

          const blob = await new Promise<Blob>((resolve) => 
            canvas.toBlob((b) => resolve(b!), `image/${outputFormat}`));
          const newUrl = URL.createObjectURL(blob);

          newResults.push({
            fileName: `${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`,
            downloadUrl: newUrl,
            type: 'image',
          });

          URL.revokeObjectURL(url);
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
    if (results.length === 0) return;

    setIsGeneratingZip(true);
    setError(null);

    try {
      const zip = new JSZip();
      
      const promises = results.map(async (result) => {
        const response = await fetch(result.downloadUrl);
        const blob = await response.blob();
        zip.file(result.fileName, blob);
      });

      await Promise.all(promises);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_images.zip';
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      setError('Failed to generate ZIP: ' + (err as Error).message);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const downloadAllAsPDF = async () => {
    if (results.length === 0) return;

    setIsGeneratingPDF(true);
    setError(null);

    try {
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      let isFirstImage = true;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const img = new Image();
        img.src = result.downloadUrl;
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${result.fileName}`));
        });

        if (!isFirstImage) {
          doc.addPage();
        } else {
          isFirstImage = false;
        }

        const imgWidth = img.width;
        const imgHeight = img.height;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const width = imgWidth * ratio;
        const height = imgHeight * ratio;
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        doc.addImage(
          img, 
          result.fileName.endsWith('.png') ? 'PNG' : 'JPEG', 
          x, 
          y, 
          width, 
          height
        );
      }

      doc.save('converted_images.pdf');
    } catch (err) {
      setError('Failed to generate PDF: ' + (err as Error).message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return {
    results,
    isConverting,
    error,
    isGeneratingZip,
    isGeneratingPDF,
    handleFiles,
    downloadAllAsZip,
    downloadAllAsPDF
  };
};