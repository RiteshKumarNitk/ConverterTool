// RedactPdfTools.tsx
import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePdfEditor } from '../../PdfEditorPage/hooks/usePdfEditor'; // Reuse hook
import { Button } from '../../../components/ui/Button';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { MousePointer, ShieldAlert, ZoomIn, ZoomOut, Save, X, Eraser } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import '../../../utils/pdf-worker';

interface DrawingAnnotation {
    id: string;
    type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'freehand';
    points: { x: number; y: number }[];
    color: string;
    strokeWidth: number;
    page: number;
}

const RedactPdfTools: React.FC = () => {
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

    // Only need drawing annotations for redaction
    const [drawingAnnotations, setDrawingAnnotations] = useState<DrawingAnnotation[]>([]);
    const [activeTool, setActiveTool] = useState<'redact' | 'select' | null>('redact');

    const [pdfError, setPdfError] = useState<string>('');
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [currentDrawing, setCurrentDrawing] = useState<DrawingAnnotation | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const { saveEditedPdf, isLoading } = usePdfEditor();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPdfError('');
    }

    const processFile = (acceptedFile: File) => {
        if (acceptedFile.type !== 'application/pdf') {
            alert('Please select a PDF file');
            return;
        }
        setFile(acceptedFile);
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                setPdfData(new Uint8Array(reader.result));
            }
        };
        reader.readAsArrayBuffer(acceptedFile);
        setDrawingAnnotations([]);
        setCurrentPage(1);
    };

    const startDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool !== 'redact' || !pageRef.current) return;
        const rect = pageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setIsDrawing(true);
        setCurrentDrawing({
            id: `redact-${Date.now()}`,
            type: 'rectangle',
            points: [{ x, y }],
            color: '#000000', // Always black for redaction
            strokeWidth: 0,
            page: currentPage
        });
    };

    const continueDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !currentDrawing || !pageRef.current) return;
        const rect = pageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        if (currentDrawing.points.length === 1) {
            setCurrentDrawing({
                ...currentDrawing,
                points: [...currentDrawing.points, { x, y }]
            });
        } else {
            const updatedPoints = [...currentDrawing.points];
            updatedPoints[1] = { x, y };
            setCurrentDrawing({
                ...currentDrawing,
                points: updatedPoints
            });
        }
    };

    const finishDrawing = () => {
        if (currentDrawing && currentDrawing.points.length > 1) {
            setDrawingAnnotations([...drawingAnnotations, currentDrawing]);
        }
        setIsDrawing(false);
        setCurrentDrawing(null);
    };

    const handleSave = async () => {
        if (!file) return;
        try {
            // Pass empty text/image annotations, only drawings
            const editedFile = await saveEditedPdf(file, [], [], drawingAnnotations);
            const url = URL.createObjectURL(editedFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = `redacted-${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
            alert('Failed to save PDF');
        }
    };

    return (
        <ToolLayout
            title="Redact PDF"
            description="Securely hide sensitive information from your PDF documents."
            icon={<ShieldAlert className="w-10 h-10 text-red-600" />}
        >
            {!file ? (
                <div className="max-w-3xl mx-auto py-12">
                    <FileDropzone
                        isDragging={isDragging}
                        isConverting={false}
                        progress={null}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
                        }}
                        onFileInput={(e) => {
                            if (e.target.files?.[0]) processFile(e.target.files[0]);
                        }}
                        mode="pdf"
                        accept=".pdf"
                    />
                </div>
            ) : (
                <div className="flex flex-col h-[80vh] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    {/* Toolbar */}
                    <div className="bg-white border-b border-gray-200 p-2 shadow-sm flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <Button
                                variant={activeTool === 'select' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTool('select')}
                                title="Select"
                            >
                                <MousePointer className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={activeTool === 'redact' ? 'danger' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTool('redact')}
                                className={activeTool === 'redact' ? 'bg-red-100 text-red-700' : ''}
                                title="Redact (Draw Box)"
                            >
                                <Eraser className="w-4 h-4 mr-2" /> Redact Area
                            </Button>
                        </div>

                        <div className="flex-1 text-center text-sm text-gray-500 font-medium">
                            {drawingAnnotations.length} areas marked for redaction
                        </div>

                        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setScale(Math.max(0.5, scale - 0.25))}><ZoomOut className="w-4 h-4" /></Button>
                            <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                            <Button size="sm" variant="ghost" onClick={() => setScale(Math.min(2.5, scale + 0.25))}><ZoomIn className="w-4 h-4" /></Button>
                        </div>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => { setFile(null); setPdfData(null); }}
                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                        >
                            <X className="w-4 h-4 mr-1" /> Close
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            loading={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-1" /> Apply Redactions
                        </Button>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-gray-500 overflow-auto flex justify-center p-8">
                        <Document
                            file={pdfData ? { data: pdfData } : undefined}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="shadow-2xl"
                        >
                            <div
                                className="relative bg-white cursor-crosshair"
                                ref={pageRef}
                                onMouseDown={activeTool === 'redact' ? startDrawing : undefined}
                                onMouseMove={activeTool === 'redact' ? continueDrawing : undefined}
                                onMouseUp={activeTool === 'redact' ? finishDrawing : undefined}
                                onMouseLeave={activeTool === 'redact' ? finishDrawing : undefined}
                            >
                                <Page pageNumber={currentPage} scale={scale} />

                                {drawingAnnotations
                                    .filter(a => a.page === currentPage)
                                    .map(a => (
                                        <div
                                            key={a.id}
                                            className="absolute bg-black"
                                            style={{
                                                left: Math.min(a.points[0].x, a.points[1].x),
                                                top: Math.min(a.points[0].y, a.points[1].y),
                                                width: Math.abs(a.points[1].x - a.points[0].x),
                                                height: Math.abs(a.points[1].y - a.points[0].y),
                                                opacity: 1 // Full opacity for redaction
                                            }}
                                        />
                                    ))
                                }

                                {currentDrawing && currentDrawing.page === currentPage && (
                                    <div
                                        className="absolute bg-black opacity-50"
                                        style={{
                                            left: Math.min(currentDrawing.points[0].x, currentDrawing.points[1].x),
                                            top: Math.min(currentDrawing.points[0].y, currentDrawing.points[1].y),
                                            width: Math.abs(currentDrawing.points[1].x - currentDrawing.points[0].x),
                                            height: Math.abs(currentDrawing.points[1].y - currentDrawing.points[0].y),
                                        }}
                                    />
                                )}
                            </div>
                        </Document>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
};

export default RedactPdfTools;
