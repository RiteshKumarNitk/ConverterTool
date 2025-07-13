import { PDFDocument } from "pdf-lib";

export async function splitPDF(file: File, pageRanges: string): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  const rangeGroups = pageRanges
    .split(",")
    .map(r => r.includes("-") ? r.split("-").map(Number) : [Number(r), Number(r)])
    .map(([start, end]) => [Math.max(1, start), Math.min(totalPages, end || start)]);

  const result: Blob[] = [];

  for (const [start, end] of rangeGroups) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, Array.from({ length: end - start + 1 }, (_, i) => i + start - 1));
    copiedPages.forEach(page => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    result.push(new Blob([pdfBytes], { type: "application/pdf" }));
  }

  return result;
}
