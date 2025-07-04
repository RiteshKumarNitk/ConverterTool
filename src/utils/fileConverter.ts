import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function convertImageToPDF(imageFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Set canvas dimensions to match image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // Get actual image dimensions in pixels
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // Calculate dimensions in millimeters (1px = 0.264583 mm)
        const widthInMM = imgWidth * 0.264583;
        const heightInMM = imgHeight * 0.264583;

        // Create PDF with exact image dimensions
        const pdf = new jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [widthInMM, heightInMM]
        });

        // Add image to PDF at full size (no margins)
        pdf.addImage(imgData, 'JPEG', 0, 0, widthInMM, heightInMM);

        // Convert to blob
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        reject(error);
      }
    };
    
     img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    reader.readAsDataURL(imageFile);
  });
}

export async function convertPDFToImages(pdfFile: File): Promise<Blob[]> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const imageBlobs: Blob[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // Get original PDF dimensions (in points)
      const viewport = page.getViewport({ scale: 1 });
      const originalWidth = viewport.width;
      const originalHeight = viewport.height;

      // Calculate scale for 1200 DPI (PDF uses 72 DPI as base)
      // 1200 DPI / 72 DPI = 16.6667x scale
      const targetScale = 1200 / 72;

      // Check browser canvas limitations
      const maxDimension = Math.max(originalWidth, originalHeight) * targetScale;
      const browserMaxSize = 32767; // Safe limit for most browsers

      if (maxDimension > browserMaxSize) {
        throw new Error(
          `Page ${pageNum} dimensions (${Math.round(maxDimension)}px) exceed browser limits. ` +
          `Max supported: ${browserMaxSize}px. Reduce DPI or split PDF.`
        );
      }

      // Create high-resolution viewport
      const highResViewport = page.getViewport({ scale: targetScale });

      // Create canvas with calculated dimensions
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      canvas.width = highResViewport.width;
      canvas.height = highResViewport.height;
      canvas.style.width = `${originalWidth}px`;
      canvas.style.height = `${originalHeight}px`;

      // Render settings for high quality
      const renderContext = {
        canvasContext: context,
        viewport: highResViewport,
        intent: 'print', // Higher quality rendering
        enableWebGL: true,
        imageLayer: true,
      };

      await page.render(renderContext).promise;

      // Convert to PNG with highest quality
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('PNG conversion failed')),
          'image/png',
          1.0 // Maximum quality
        );
      });

      imageBlobs.push(blob);
    }

    return imageBlobs;
  } catch (error) {
    throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : error}`);
  }
}