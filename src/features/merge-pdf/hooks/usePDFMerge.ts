import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export const usePDFMerge = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  const handleFiles = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles.filter(f => f.type === 'application/pdf')]);
  };

  const reorderFiles = (newOrder: File[]) => setFiles(newOrder);

  const mergePDFs = async () => {
    setIsMerging(true);
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const url = URL.createObjectURL(new Blob([mergedBytes], { type: 'application/pdf' }));
    setMergedUrl(url);
    setIsMerging(false);
  };

  const reset = () => {
    setFiles([]);
    setMergedUrl(null);
  };

  return {
    files,
    mergedUrl,
    isMerging,
    handleFiles,
    reorderFiles,
    mergePDFs,
    reset,
  };
};
