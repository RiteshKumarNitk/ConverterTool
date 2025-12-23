import { useState } from "react";
import JSZip from "jszip";
import { convertPDFToImages, mergeImagesToPDF } from "../../../utils/fileConverter";

export type CompressionLevel = 'low' | 'medium' | 'high';

export const useCompressor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<Blob[]>([]);
  const [loading, setLoading] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');

  const [progress, setProgress] = useState<string>("");
  const [timeTaken, setTimeTaken] = useState<string | null>(null);

  const handleFileUpload = (inputFiles: FileList | File[]) => {
    const list = Array.from(inputFiles);
    setFiles(list);
    setCompressedFiles([]);
  };

  const reset = () => {
    setFiles([]);
    setCompressedFiles([]);
    setProgress("");
    setTimeTaken(null);
  };

  const handleCompression = async () => {
    setLoading(true);
    setProgress("Starting...");
    setTimeTaken(null);
    const startTime = performance.now();
    const results: Blob[] = [];

    // Settings map
    const settings = {
      low: { scale: 0.8, quality: 0.3 },     // Smallest size, lowest resolution
      medium: { scale: 1.0, quality: 0.6 },  // Balanced (72 DPI)
      high: { scale: 1.5, quality: 0.8 }     // Best quality (Higher DPI)
    };
    const { scale, quality } = settings[compressionLevel];

    for (const file of files) {
      if (file.type === "application/pdf") {
        try {
          setProgress(`Reading PDF: ${file.name}...`);
          // 1. Convert PDF pages to images
          const pageBlobs = await convertPDFToImages(file, scale);

          setProgress(`Compressing ${file.name} (Pages: ${pageBlobs.length})...`);

          // 2. Compress each page image (Parallel)
          const compressedBlobs = await Promise.all(pageBlobs.map((blob, i) => {
            const pageFile = new File([blob], `page_${i}.png`, { type: "image/png" });
            return compressImageFixed(pageFile, quality);
          }));

          const compressedPages = compressedBlobs.map((blob, i) =>
            new File([blob], `page_${i}.jpg`, { type: "image/jpeg" })
          );

          setProgress(`Merging ${file.name}...`);
          // 3. Merge compressed images back to PDF
          const compressedPdfBlob = await mergeImagesToPDF(compressedPages);

          // 4. Size Check: Keep whichever is smaller (unless forced low quality)
          if (compressedPdfBlob.size < file.size) {
            results.push(compressedPdfBlob);
          } else {
            // If we failed to reduce size, but user asked for "High", maybe that's expected?
            // But usually they want compression. 
            console.warn("Compressed file larger than original, checking if meaningful...");
            results.push(file);
          }

        } catch (err) {
          console.error("PDF Compression failed", err);
          results.push(file);
        }
      } else if (file.type.startsWith("image/")) {
        setProgress(`Compressing image: ${file.name}...`);
        const image = await compressImageFixed(file, quality);
        results.push(image.size < file.size ? image : file);
      } else {
        results.push(file);
      }
    }

    setCompressedFiles(results);
    const endTime = performance.now();
    setTimeTaken(((endTime - startTime) / 1000).toFixed(2) + "s");
    setLoading(false);
    setProgress("");
  };

  // Fast fixed quality compression (One pass)
  const compressImageFixed = (file: File, quality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          resolve(blob || file);
          URL.revokeObjectURL(url);
        }, 'image/jpeg', quality);
      };

      img.onerror = () => {
        resolve(file);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    });
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    compressedFiles.forEach((blob, idx) => {
      zip.file(`compressed-${files[idx].name}`, blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "compressed-files.zip";
    link.click();
  };

  return {
    files,
    compressedFiles,
    loading,
    handleFileUpload,
    handleCompression,
    downloadZip,
    reset,
    compressionLevel,
    setCompressionLevel,
    progress,
    timeTaken,
  };
};
