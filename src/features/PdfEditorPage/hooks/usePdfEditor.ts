// PdfEditorPage/hooks/usePdfEditor.ts
import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';

interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  page: number;
}

interface ImageAnnotation {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

interface DrawingAnnotation {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'freehand';
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  page: number;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? rgb(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    )
    : rgb(0, 0, 0);
};

export const usePdfEditor = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveEditedPdf = async (
    file: File,
    textAnnotations: TextAnnotation[],
    imageAnnotations: ImageAnnotation[],
    drawingAnnotations: DrawingAnnotation[]
  ): Promise<Blob> => {
    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();

      // Process Text Annotations
      for (const text of textAnnotations) {
        if (text.page > pages.length) continue;
        const page = pages[text.page - 1]; // 0-indexed
        const { height } = page.getSize();

        // PDF-lib coordinate system is from bottom-left
        // UI coordinate system is from top-left
        // y = height - ui_y - fontSize (roughly)

        page.drawText(text.text, {
          x: text.x,
          y: height - text.y - text.fontSize,
          size: text.fontSize,
          font: helveticaFont,
          color: hexToRgb(text.color),
        });
      }

      // Process Image Annotations
      for (const imgNode of imageAnnotations) {
        if (imgNode.page > pages.length) continue;
        const page = pages[imgNode.page - 1];
        const { height } = page.getSize();

        let pdfImage;
        if (imgNode.src.startsWith('data:image/png')) {
          pdfImage = await pdfDoc.embedPng(imgNode.src);
        } else {
          // Assume JPEG/JPG
          pdfImage = await pdfDoc.embedJpg(imgNode.src);
        }

        page.drawImage(pdfImage, {
          x: imgNode.x,
          y: height - imgNode.y - imgNode.height,
          width: imgNode.width,
          height: imgNode.height,
        });
      }

      // Process Drawing Annotations
      for (const drawing of drawingAnnotations) {
        if (drawing.page > pages.length) continue;
        const page = pages[drawing.page - 1];
        const { height } = page.getSize();
        const color = hexToRgb(drawing.color);
        const options = {
          color,
          thickness: drawing.strokeWidth,
          borderColor: color,
          borderWidth: drawing.strokeWidth,
        };

        if (drawing.type === 'rectangle' && drawing.points.length >= 2) {
          const p1 = drawing.points[0];
          const p2 = drawing.points[1];
          const x = Math.min(p1.x, p2.x);
          const y = Math.min(p1.y, p2.y);
          const w = Math.abs(p2.x - p1.x);
          const h = Math.abs(p2.y - p1.y);

          page.drawRectangle({
            x,
            y: height - y - h,
            width: w,
            height: h,
            ...options
          });
        }
        else if (drawing.type === 'circle' && drawing.points.length >= 2) {
          // Simplified: pdf-lib drawEllipse
          // Approximating from bounding box
          const p1 = drawing.points[0];
          const p2 = drawing.points[1];
          const rx = Math.abs(p2.x - p1.x) / 2;
          const ry = Math.abs(p2.y - p1.y) / 2;
          const cx = (p1.x + p2.x) / 2;
          const cy = (p1.y + p2.y) / 2;

          page.drawEllipse({
            x: cx,
            y: height - cy,
            xScale: rx,
            yScale: ry,
            ...options
          });
        }
        else if (drawing.type === 'line' && drawing.points.length >= 2) {
          page.drawLine({
            start: { x: drawing.points[0].x, y: height - drawing.points[0].y },
            end: { x: drawing.points[1].x, y: height - drawing.points[1].y },
            ...options
          });
        }
        else if (drawing.type === 'freehand' && drawing.points.length > 1) {
          // Draw continuous lines
          for (let i = 0; i < drawing.points.length - 1; i++) {
            page.drawLine({
              start: { x: drawing.points[i].x, y: height - drawing.points[i].y },
              end: { x: drawing.points[i + 1].x, y: height - drawing.points[i + 1].y },
              ...options
            });
          }
        }
      }


      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });

    } catch (error) {
      console.error('Error editing PDF:', error);
      throw new Error('Failed to edit PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveEditedPdf,
    isLoading
  };
};