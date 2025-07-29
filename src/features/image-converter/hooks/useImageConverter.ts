import { useState } from 'react';
import * as piexif from 'piexifjs';

type ConversionOptions = {
  file: File;
  targetFormat: 'jpeg' | 'png' | 'webp';
  outputName?: string;
  quality?: number;
  maxWidth?: number;
  preserveMetadata?: boolean;
};

export function useImageConverter() {
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getImageDimensions = (img: HTMLImageElement, maxWidth: number) => {
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    if (maxWidth && maxWidth > 0 && width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.floor(height * ratio);
    }

    return { width, height };
  };

  const extractMetadata = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const exifData = piexif.load(Buffer.from(arrayBuffer).toString('binary'));
      return exifData;
    } catch (e) {
      console.warn("Metadata extraction failed", e);
      return null;
    }
  };

  const applyMetadata = (imageData: ArrayBuffer, metadata: any) => {
    try {
      const exifObj = piexif.load(Buffer.from(imageData).toString('binary'));
      exifObj['Exif'] = { ...exifObj['Exif'], ...metadata['Exif'] };
      return piexif.dump(exifObj);
    } catch (e) {
      console.warn("Metadata application failed", e);
      return null;
    }
  };

  const convertImage = async (options: ConversionOptions) => {
    setError(null);
    setConvertedFile(null);
    
    try {
      const {
        file,
        targetFormat,
        outputName,
        quality = 0.95,
        maxWidth = 0,
        preserveMetadata = true
      } = options;

      const img = new Image();
      const reader = new FileReader();

      const metadata = preserveMetadata ? await extractMetadata(file) : null;

      return new Promise<File>((resolve, reject) => {
        reader.onload = async (e) => {
          if (!e.target?.result) return reject("File reading failed");

          img.onload = async () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error("Failed to get canvas context");

              const { width, height } = getImageDimensions(img, maxWidth);
              canvas.width = width;
              canvas.height = height;

              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                async (blob) => {
                  if (!blob) throw new Error("Conversion failed");

                  try {
                    let finalBlob = blob;
                    
                    // Apply metadata if available and format is JPEG
                    if (metadata && targetFormat === 'jpeg') {
                      const arrayBuffer = await blob.arrayBuffer();
                      const exifBytes = applyMetadata(arrayBuffer, metadata);
                      
                      if (exifBytes) {
                        const uint8Array = new Uint8Array(arrayBuffer);
                        const jpegWithExif = piexif.insert(exifBytes, uint8Array.buffer);
                        finalBlob = new Blob([jpegWithExif], { type: 'image/jpeg' });
                      }
                    }

                    const fileName = outputName || 
                      `${file.name.replace(/\.[^/.]+$/, '')}_converted.${targetFormat}`;
                    
                    const newFile = new File(
                      [finalBlob],
                      fileName,
                      { type: `image/${targetFormat}` }
                    );

                    setConvertedFile(newFile);
                    resolve(newFile);
                  } catch (metaError) {
                    console.error("Metadata processing failed", metaError);
                    
                    // Fallback to file without metadata
                    const fileName = outputName || 
                      `${file.name.replace(/\.[^/.]+$/, '')}_converted.${targetFormat}`;
                    
                    const newFile = new File(
                      [blob],
                      fileName,
                      { type: `image/${targetFormat}` }
                    );
                    
                    setConvertedFile(newFile);
                    resolve(newFile);
                  }
                },
                `image/${targetFormat}`,
                targetFormat === 'png' ? undefined : quality
              );
            } catch (err) {
              setError(err instanceof Error ? err.message : "Conversion error");
              reject(err);
            }
          };

          img.src = e.target.result as string;
        };

        reader.onerror = (err) => {
          setError("File reading error");
          reject(err);
        };
        
        reader.readAsDataURL(file);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion error");
      return Promise.reject(err);
    }
  };

  return { convertImage, convertedFile, error };
}