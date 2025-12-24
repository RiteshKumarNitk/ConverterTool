// PdfEditorPage/components/PdfEditorPage.tsx
import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { Button } from '../../../components/ui/Button';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { AlertCircle, MousePointer, Type, Square, Image as ImageIcon, PenTool, ZoomIn, ZoomOut, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
// @ts-ignore
const pdfjsLib = pdfjs;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

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
    type: 'line' | 'rectangle' | 'circle' | 'arrow';
    points: { x: number; y: number }[];
    color: string;
    strokeWidth: number;
    page: number;
}

export const PdfEditorPage: React.FC = () => {
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
    const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([]);
    const [drawingAnnotations, setDrawingAnnotations] = useState<DrawingAnnotation[]>([]);
    const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'draw' | 'signature' | null>('select');
    const [drawingType, setDrawingType] = useState<'line' | 'rectangle' | 'circle' | 'arrow'>('rectangle');
    const [currentColor, setCurrentColor] = useState<string>('#000000');
    const [fontSize, setFontSize] = useState<number>(12);
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

    function onDocumentLoadError(error: Error) {
        console.error('Error loading PDF:', error);
        setPdfError('Failed to load the PDF file. Please try another file.');
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

        setTextAnnotations([]);
        setImageAnnotations([]);
        setDrawingAnnotations([]);
        setCurrentPage(1);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };


    const addTextAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool !== 'text' || !pageRef.current) return;

        const rect = pageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        const newText: TextAnnotation = {
            id: `text-${Date.now()}`,
            text: 'Double click to edit',
            x,
            y,
            fontSize,
            color: currentColor,
            page: currentPage
        };

        setTextAnnotations([...textAnnotations, newText]);
        setActiveTool('select');
    };

    const startDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool !== 'draw' || !pageRef.current) return;

        const rect = pageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setIsDrawing(true);
        setCurrentDrawing({
            id: `drawing-${Date.now()}`,
            type: drawingType,
            points: [{ x, y }],
            color: currentColor,
            strokeWidth: 2,
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
            const editedFile = await saveEditedPdf(
                file,
                textAnnotations,
                imageAnnotations,
                drawingAnnotations
            );

            const url = URL.createObjectURL(editedFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited-${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert('Failed to save the edited PDF. Please try again.');
        }
    };

    return (
        <ToolLayout
            title="PDF Editor"
            description="Edit your PDF documents directly in your browser. Add text, shapes, and annotations securely."
            icon={<PenTool className="w-10 h-10 text-blue-600" />}
        >
            {!file ? (
                <div className="max-w-3xl mx-auto py-12">
                    <FileDropzone
                        isDragging={isDragging}
                        isConverting={false}
                        progress={null}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onFileInput={handleFileInput}
                        mode="pdf-to-image" // Reusing styling
                    />
                </div>
            ) : (
                <div className="flex flex-col h-[80vh] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">

                    {/* Toolbar */}
                    <div className="bg-white border-b border-gray-200 p-2 shadow-sm flex items-center gap-2 overflow-x-auto">

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
                                variant={activeTool === 'text' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTool('text')}
                                title="Add Text"
                            >
                                <Type className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={activeTool === 'draw' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTool('draw')}
                                title="Draw Shape"
                            >
                                <Square className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" disabled title="Add Image (Coming Soon)">
                                <ImageIcon className="w-4 h-4 opacity-50" />
                            </Button>
                        </div>

                        <div className="h-6 w-px bg-gray-300 mx-1"></div>

                        {/* Text Properties */}
                        {activeTool === 'text' && (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <input
                                    type="number"
                                    min="8"
                                    max="72"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="w-16 px-2 py-1 rounded border border-gray-300 text-sm"
                                    title="Font Size"
                                />
                                <input
                                    type="color"
                                    value={currentColor}
                                    onChange={(e) => setCurrentColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    title="Text Color"
                                />
                            </div>
                        )}

                        {/* Draw Properties */}
                        {activeTool === 'draw' && (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <select
                                    value={drawingType}
                                    onChange={(e) => setDrawingType(e.target.value as any)}
                                    className="rounded border border-gray-300 py-1 text-sm bg-white"
                                >
                                    <option value="rectangle">Rectangle</option>
                                    <option value="circle">Circle</option>
                                    <option value="line">Line</option>
                                    <option value="arrow">Arrow</option>
                                </select>
                                <input
                                    type="color"
                                    value={currentColor}
                                    onChange={(e) => setCurrentColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    title="Shape Color"
                                />
                            </div>
                        )}

                        <div className="flex-1"></div>

                        {/* Zoom & Page Controls */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setScale(Math.max(0.5, scale - 0.25))}><ZoomOut className="w-4 h-4" /></Button>
                            <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                            <Button size="sm" variant="ghost" onClick={() => setScale(Math.min(2.5, scale + 0.25))}><ZoomIn className="w-4 h-4" /></Button>
                        </div>

                        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                            <Button size="sm" variant="ghost" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-xs font-mono px-2">
                                {currentPage} / {numPages || '-'}
                            </span>
                            <Button size="sm" variant="ghost" disabled={currentPage >= numPages} onClick={() => setCurrentPage(p => p + 1)}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="h-6 w-px bg-gray-300 mx-1"></div>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => { setFile(null); setPdfData(null); }}
                            className="bg-red-100 text-red-700 hover:bg-red-200"
                        >
                            <X className="w-4 h-4 mr-1" /> Close
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            loading={isLoading}
                        >
                            <Save className="w-4 h-4 mr-1" /> Save
                        </Button>

                    </div>

                    {/* Error Message */}
                    {pdfError && (
                        <div className="bg-red-50 text-red-700 p-2 text-center text-sm border-b border-red-100 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 mr-2" /> {pdfError}
                        </div>
                    )}

                    {/* Canvas Area */}
                    <div className="flex-1 bg-gray-500 overflow-auto flex justify-center p-8">
                        <Document
                            file={pdfData ? { data: pdfData } : undefined}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={<div className="text-white mt-10">Loading PDF...</div>}
                            error={<div className="text-white bg-red-500 p-4 rounded mt-10">Failed to load PDF</div>}
                            className="shadow-2xl"
                        >
                            <div
                                className="relative bg-white"
                                ref={pageRef}
                                onClick={activeTool === 'text' ? addTextAnnotation : undefined}
                                onMouseDown={activeTool === 'draw' ? startDrawing : undefined}
                                onMouseMove={activeTool === 'draw' ? continueDrawing : undefined}
                                onMouseUp={activeTool === 'draw' ? finishDrawing : undefined}
                                onMouseLeave={activeTool === 'draw' ? finishDrawing : undefined}
                            >
                                <Page
                                    pageNumber={currentPage}
                                    scale={scale}
                                    loading={<div className="w-[600px] h-[800px] bg-white animate-pulse"></div>}
                                />

                                {/* Annotations Layer */}
                                {textAnnotations
                                    .filter(a => a.page === currentPage)
                                    .map(a => (
                                        <div
                                            key={a.id}
                                            className="absolute p-0.5 border border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                                            style={{ left: a.x, top: a.y, fontSize: `${a.fontSize}px`, color: a.color, cursor: activeTool === 'select' ? 'move' : 'text' }}
                                            contentEditable={activeTool === 'select'}
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const text = e.currentTarget.textContent || '';
                                                setTextAnnotations(prev => prev.map(p => p.id === a.id ? { ...p, text } : p));
                                            }}
                                        >
                                            {a.text}
                                        </div>
                                    ))
                                }

                                {drawingAnnotations
                                    .filter(a => a.page === currentPage)
                                    .map(a => (
                                        <svg key={a.id} className="absolute inset-0 w-full h-full pointer-events-none">
                                            {a.type === 'rectangle' && a.points.length >= 2 && (
                                                <rect
                                                    x={Math.min(a.points[0].x, a.points[1].x)}
                                                    y={Math.min(a.points[0].y, a.points[1].y)}
                                                    width={Math.abs(a.points[1].x - a.points[0].x)}
                                                    height={Math.abs(a.points[1].y - a.points[0].y)}
                                                    stroke={a.color}
                                                    strokeWidth={a.strokeWidth}
                                                    fill="none"
                                                />
                                            )}
                                            {a.type === 'circle' && a.points.length >= 2 && (
                                                <ellipse
                                                    cx={(a.points[0].x + a.points[1].x) / 2}
                                                    cy={(a.points[0].y + a.points[1].y) / 2}
                                                    rx={Math.abs(a.points[1].x - a.points[0].x) / 2}
                                                    ry={Math.abs(a.points[1].y - a.points[0].y) / 2}
                                                    stroke={a.color}
                                                    strokeWidth={a.strokeWidth}
                                                    fill="none"
                                                />
                                            )}
                                            {a.type === 'line' && a.points.length >= 2 && (
                                                <line
                                                    x1={a.points[0].x}
                                                    y1={a.points[0].y}
                                                    x2={a.points[1].x}
                                                    y2={a.points[1].y}
                                                    stroke={a.color}
                                                    strokeWidth={a.strokeWidth}
                                                />
                                            )}
                                        </svg>
                                    ))
                                }

                                {currentDrawing && currentDrawing.page === currentPage && (
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        {currentDrawing.type === 'rectangle' && currentDrawing.points.length >= 2 && (
                                            <rect
                                                x={Math.min(currentDrawing.points[0].x, currentDrawing.points[1].x)}
                                                y={Math.min(currentDrawing.points[0].y, currentDrawing.points[1].y)}
                                                width={Math.abs(currentDrawing.points[1].x - currentDrawing.points[0].x)}
                                                height={Math.abs(currentDrawing.points[1].y - currentDrawing.points[0].y)}
                                                stroke={currentDrawing.color}
                                                strokeWidth={currentDrawing.strokeWidth}
                                                fill="none"
                                            />
                                        )}
                                        {currentDrawing.type === 'line' && currentDrawing.points.length >= 2 && (
                                            <line
                                                x1={currentDrawing.points[0].x}
                                                y1={currentDrawing.points[0].y}
                                                x2={currentDrawing.points[1].x}
                                                y2={currentDrawing.points[1].y}
                                                stroke={currentDrawing.color}
                                                strokeWidth={currentDrawing.strokeWidth}
                                            />
                                        )}
                                    </svg>
                                )}

                            </div>
                        </Document>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
};

export default PdfEditorPage;