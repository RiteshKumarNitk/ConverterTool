import { useState } from "react";
import JSZip from "jszip";

export const useCompressor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<Blob[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetSizeMB, setTargetSizeMB] = useState<number>(1);

  const handleFileUpload = (inputFiles: FileList | File[]) => {
    const list = Array.from(inputFiles);
    setFiles(list);
    setCompressedFiles([]);
  };

  const reset = () => {
    setFiles([]);
    setCompressedFiles([]);
  };

  const handleCompression = async () => {
    setLoading(true);
    const results: Blob[] = [];

    for (const file of files) {
      if (file.type === "application/pdf") {
        // Placeholder (real compression would be backend)
        results.push(file);
      } else if (file.type.startsWith("image/")) {
        const targetBytes = targetSizeMB * 1024 * 1024;
        const image = await compressImageToSize(file, targetBytes);
        results.push(image);
      } else {
        results.push(file);
      }
    }

    setCompressedFiles(results);
    setLoading(false);
  };
const compressImageToSize = (file: File, targetBytes: number): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        let width = img.width;
        let height = img.height;

        // Shrink loop until size is under targetBytes
        let quality = 0.92;

        const tryCompress = () => {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) return;

            if (blob.size <= targetBytes || (quality <= 0.3 && width < 500)) {
              resolve(blob);
            } else {
              // Shrink and lower quality
              width = Math.floor(width * 0.9);
              height = Math.floor(height * 0.9);
              quality -= 0.05;
              tryCompress();
            }
          }, file.type, quality);
        };

        tryCompress();
      };
    };
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
    targetSizeMB,
    setTargetSizeMB,
  };
};
