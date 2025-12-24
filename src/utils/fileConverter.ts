
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
// Set the worker source for PDF.js
// @ts-ignore
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Set the worker source for PDF.js
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

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
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const widthInMM = imgWidth * 0.264583;
        const heightInMM = imgHeight * 0.264583;

        const pdf = new jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [widthInMM, heightInMM]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, widthInMM, heightInMM);
        resolve(pdf.output('blob'));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target?.result as string; };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(imageFile);
  });
}

export async function convertPDFToImages(pdfFile: File, scale: number = 1): Promise<Blob[]> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const imageBlobs: Blob[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      // const viewport = page.getViewport({ scale: 1 }); // Base scale
      // const originalWidth = viewport.width;
      // const originalHeight = viewport.height;

      // Use passed scale
      const targetScale = scale;

      const highResViewport = page.getViewport({ scale: targetScale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas context not available');

      canvas.width = highResViewport.width;
      canvas.height = highResViewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: highResViewport,
        intent: 'display', // OPTIMIZATION: Faster rendering intent
        enableWebGL: true,
        imageLayer: true,
      };

      await page.render(renderContext).promise;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('PNG conversion failed')), 'image/png');
      });

      imageBlobs.push(blob);
    }
    return imageBlobs;
  } catch (error) {
    throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : error}`);
  }
}

export async function mergeImagesToPDF(imageFiles: File[]): Promise<Blob> {
  if (imageFiles.length === 0) throw new Error('No images to merge');

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  for (const file of imageFiles) {
    await new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Load image to get dimensions
        const img = new Image();
        img.onload = () => {
          try {
            const widthInMM = img.naturalWidth * 0.264583;
            const heightInMM = img.naturalHeight * 0.264583;
            const orientation = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';

            // Add new page matching image dims
            pdf.addPage([widthInMM, heightInMM], orientation);

            // OPTIMIZATION: Use 'FAST' compression and pass dataUrl directly
            pdf.addImage(dataUrl, 'JPEG', 0, 0, widthInMM, heightInMM, undefined, 'FAST');

            resolve();
          } catch (err) { reject(err); }
        };
        img.onerror = () => reject(new Error(`Failed to map image ${file.name}`));
        img.src = dataUrl;
      };

      reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  // Remove the default first page
  pdf.deletePage(1);

  return pdf.output('blob');
}