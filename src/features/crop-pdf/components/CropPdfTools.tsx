import React, { useState, useRef } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { Crop, Download, Loader2, FileType, MousePointer, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import '../../../utils/pdf-worker';

interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

const CropPdfTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState(1.0);

    // Crop State
    const [cropRect, setCropRect] = useState<CropRect | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    const processFile = (f: File) => {
        setFile(f);
        setCropRect(null);
        setCurrentPage(1);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!pageRef.current) return;
        const rect = pageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsSelecting(true);
        setSelectionStart({ x, y });
        setCropRect({ x, y, width: 0, height: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || !selectionStart || !pageRef.current) return;
        const rect = pageRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const width = Math.abs(currentX - selectionStart.x);
        const height = Math.abs(currentY - selectionStart.y);
        const x = Math.min(currentX, selectionStart.x);
        const y = Math.min(currentY, selectionStart.y);

        setCropRect({ x, y, width, height });
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        setSelectionStart(null);
    };

    const handleCrop = async () => {
        if (!file || !cropRect || !pageRef.current) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const page = pages[currentPage - 1];

            // Calculate PDF coordinates
            // Note: react-pdf 'scale' prop affects visual size.
            // visual_width = actual_width * scale
            // factor = actual / visual = 1 / scale

            const { width: pageWidth, height: pageHeight } = page.getSize();
            const visualPage = pageRef.current.getBoundingClientRect();

            // Re-calculate true text scale based on rendered vs actual
            // BUT: react-pdf Page renders at 'scale' prop relative to 72DPI usually?
            // Safer to use percent based on the rendered div size.

            const scaleX = pageWidth / visualPage.width;
            const scaleY = pageHeight / visualPage.height;

            const x = cropRect.x * scaleX;
            const y = cropRect.y * scaleY;
            const width = cropRect.width * scaleX;
            const height = cropRect.height * scaleY;

            // PDF coordinates: (0,0) is Bottom-Left.
            // CropBox expects [x, y, width, height]
            // where y is from bottom.
            const newY = pageHeight - y - height;

            page.setCropBox(x, newY, width, height);

            // We could crop ALL pages or just this one. 
            // For this tool, let's just modify the current page as a "preview" of sorts, 
            // or maybe user expects whole doc crop? 
            // Usually simple crop tools crop all pages if consistent, or just single page.
            // Let's ask user? Or just support single page crop for now to be safe.
            // "Crop Current Page" behavior.

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `cropped-${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Crop failed", err);
            alert("Failed to crop PDF");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Crop PDF"
            description="Trim white margins or select specific areas of your PDF pages."
            icon={<Crop className="w-10 h-10 text-blue-600" />}
        >
            <div className="space-y-6">
                {!file ? (
                    <div className="max-w-3xl mx-auto">
                        <FileDropzone
                            isDragging={false}
                            isConverting={false}
                            progress={null}
                            onDragOver={(e) => e.preventDefault()}
                            onDragLeave={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
                            }}
                            onFileInput={(e) => {
                                if (e.target.files?.[0]) processFile(e.target.files[0]);
                            }}
                            accept=".pdf"
                            mode="pdf"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        {/* Toolbar */}
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                            <Button
                                variant="outline"
                                onClick={() => processFile(file)} // Reset
                                title="Reset Crop"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Reset
                            </Button>

                            <div className="h-6 w-px bg-gray-200"></div>

                            <Button
                                onClick={handleCrop}
                                disabled={!cropRect || isProcessing}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crop className="w-4 h-4 mr-2" />}
                                Crop & Download
                            </Button>
                        </div>

                        <div className="text-sm text-gray-500">
                            Draw a box on the PDF page below to select the crop area.
                        </div>

                        {/* Preview / Crop Area */}
                        <div className="relative bg-gray-500 p-8 rounded shadow-inner overflow-auto max-w-full">
                            <Document
                                file={file}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                className="shadow-2xl"
                            >
                                <div
                                    className="relative cursor-crosshair select-none"
                                    ref={pageRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    <Page
                                        pageNumber={currentPage}
                                        scale={scale}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />

                                    {cropRect && (
                                        <div
                                            className="absolute border-2 border-blue-500 bg-blue-500/20"
                                            style={{
                                                left: cropRect.x,
                                                top: cropRect.y,
                                                width: cropRect.width,
                                                height: cropRect.height,
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    )}
                                </div>
                            </Document>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default CropPdfTools;
