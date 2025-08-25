// PdfEditorPage/components/PdfEditorPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePdfEditor } from '../hooks/usePdfEditor';
import Button from "../common/Button";
import { Alert } from '../../../components/ui/Alert';
import { FileDropzone } from '../common/FileDropzone';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker - using a more reliable approach
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
    const [fileUrl, setFileUrl] = useState<Uint8Array | null>(null);
const [fileBuffer, setFileBuffer] = useState<Uint8Array>();
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.2);
    const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
    const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([]);
    const [drawingAnnotations, setDrawingAnnotations] = useState<DrawingAnnotation[]>([]);
    const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'draw' | 'signature' | null>(null);
    const [drawingType, setDrawingType] = useState<'line' | 'rectangle' | 'circle' | 'arrow'>('rectangle');
    const [currentColor, setCurrentColor] = useState<string>('#000000');
    const [fontSize, setFontSize] = useState<number>(12);
    const [pdfError, setPdfError] = useState<string>('');
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [currentDrawing, setCurrentDrawing] = useState<DrawingAnnotation | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    const { saveEditedPdf, isLoading } = usePdfEditor();

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPdfError('');
    }

    function onDocumentLoadError(error: Error) {
        console.error('Error loading PDF:', error);
        setPdfError('Failed to load the PDF file. Please try another file.');
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
  if (acceptedFiles.length > 0) {
    const file = acceptedFiles[0];
    const url = URL.createObjectURL(file);
    setFileUrl(url);
  }
}, []);
    const handleFileAccepted = (acceptedFile: File) => {
        setFile(acceptedFile);

        const reader = new FileReader();
        reader.onload = () => {
            const typedArray = new Uint8Array(reader.result as ArrayBuffer);
            setFileUrl(typedArray);  // 👈 store ArrayBuffer instead of blob URL
        };
        reader.readAsArrayBuffer(acceptedFile);

        // reset annotations
        setTextAnnotations([]);
        setImageAnnotations([]);
        setDrawingAnnotations([]);
        setCurrentPage(1);
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

            // Download the edited file
            const url = URL.createObjectURL(editedFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited-${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('PDF edited successfully!');
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert('Failed to save the edited PDF. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">PDF Editor</h1>
                <p className="text-gray-600">Edit your PDF documents with our easy-to-use tools</p>
            </header>

            {!file ? (
                <div className="max-w-2xl mx-auto">
                    <FileDropzone
                        onFileAccepted={handleFileAccepted}
                        acceptedFileTypes={['application/pdf']}
                        maxFileSize={25 * 1024 * 1024} // 25MB
                    />
                </div>
            ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
                        <div className="tool-section">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Tools</h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={activeTool === 'select' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTool('select')}
                                >
                                    Select
                                </Button>
                                <Button
                                    variant={activeTool === 'text' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTool('text')}
                                >
                                    Add Text
                                </Button>
                                <Button
                                    variant={activeTool === 'draw' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTool('draw')}
                                >
                                    Draw
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveTool('image')}
                                    disabled
                                >
                                    Add Image
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveTool('signature')}
                                    disabled
                                >
                                    Add Signature
                                </Button>
                            </div>
                        </div>

                        {activeTool === 'text' && (
                            <div className="flex items-center gap-4">
                                <label className="flex flex-col">
                                    <span className="text-xs text-gray-600">Font Size</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min="8"
                                            max="72"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(Number(e.target.value))}
                                            className="w-20"
                                        />
                                        <span className="text-sm">{fontSize}px</span>
                                    </div>
                                </label>
                                <label className="flex flex-col">
                                    <span className="text-xs text-gray-600">Color</span>
                                    <input
                                        type="color"
                                        value={currentColor}
                                        onChange={(e) => setCurrentColor(e.target.value)}
                                        className="w-8 h-8"
                                    />
                                </label>
                            </div>
                        )}

                        {activeTool === 'draw' && (
                            <div className="flex items-center gap-4">
                                <label className="flex flex-col">
                                    <span className="text-xs text-gray-600">Shape</span>
                                    <select
                                        value={drawingType}
                                        onChange={(e) => setDrawingType(e.target.value as any)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="rectangle">Rectangle</option>
                                        <option value="circle">Circle</option>
                                        <option value="line">Line</option>
                                        <option value="arrow">Arrow</option>
                                    </select>
                                </label>
                                <label className="flex flex-col">
                                    <span className="text-xs text-gray-600">Color</span>
                                    <input
                                        type="color"
                                        value={currentColor}
                                        onChange={(e) => setCurrentColor(e.target.value)}
                                        className="w-8 h-8"
                                    />
                                </label>
                            </div>
                        )}

                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium text-gray-700">
                                    Page {currentPage} of {numPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= numPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>

                            <label className="flex flex-col">
                                <span className="text-xs text-gray-600">Zoom</span>
                                <select
                                    value={scale}
                                    onChange={(e) => setScale(Number(e.target.value))}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="0.5">50%</option>
                                    <option value="0.75">75%</option>
                                    <option value="1">100%</option>
                                    <option value="1.2">120%</option>
                                    <option value="1.5">150%</option>
                                    <option value="2">200%</option>
                                </select>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                                if (fileUrl) URL.revokeObjectURL(fileUrl);
                                setFile(null);
                                setFileUrl(null);
                            }}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSave}
                                loading={isLoading}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    {pdfError && (
                        <Alert type="error" className="m-4">
                            {pdfError}
                        </Alert>
                    )}

                    <div className="bg-gray-800 p-8 flex justify-center overflow-auto">
  <Document
    file={fileUrl ? { data: fileUrl } : undefined}
    onLoadSuccess={onDocumentLoadSuccess}
    onLoadError={onDocumentLoadError}
    loading={<div className="text-white">Loading PDF...</div>}
    error={<div className="text-red-500">Failed to load PDF</div>}
  >
    <div
      className="relative shadow-lg"
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
        loading={<div className="text-white">Loading page...</div>}
        error={<div className="text-red-500">Failed to load page</div>}
      />
                                {/* text annotations */}
                                {textAnnotations
                                    .filter(annotation => annotation.page === currentPage)
                                    .map(annotation => (
                                        <div
                                            key={annotation.id}
                                            className="absolute cursor-move p-1 border border-dashed border-transparent 
                       hover:border-blue-500 focus:border-blue-500 focus:outline-none 
                       focus:bg-blue-50 bg-transparent"
                                            style={{
                                                left: annotation.x,
                                                top: annotation.y,
                                                fontSize: `${annotation.fontSize}px`,
                                                color: annotation.color,
                                            }}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updated = textAnnotations.map(a =>
                                                    a.id === annotation.id
                                                        ? { ...a, text: e.currentTarget.textContent || '' }
                                                        : a
                                                );
                                                setTextAnnotations(updated);
                                            }}
                                        >
                                            {annotation.text}
                                        </div>
                                    ))}

                                {/* drawing annotations */}
                                {drawingAnnotations
                                    .filter(annotation => annotation.page === currentPage)
                                    .map(annotation => (
                                        <svg
                                            key={annotation.id}
                                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                        >
                                            {annotation.type === 'rectangle' && annotation.points.length === 2 && (
                                                <rect
                                                    x={Math.min(annotation.points[0].x, annotation.points[1].x)}
                                                    y={Math.min(annotation.points[0].y, annotation.points[1].y)}
                                                    width={Math.abs(annotation.points[1].x - annotation.points[0].x)}
                                                    height={Math.abs(annotation.points[1].y - annotation.points[0].y)}
                                                    stroke={annotation.color}
                                                    strokeWidth={annotation.strokeWidth}
                                                    fill="none"
                                                />
                                            )}
                                            {annotation.type === 'line' && annotation.points.length === 2 && (
                                                <line
                                                    x1={annotation.points[0].x}
                                                    y1={annotation.points[0].y}
                                                    x2={annotation.points[1].x}
                                                    y2={annotation.points[1].y}
                                                    stroke={annotation.color}
                                                    strokeWidth={annotation.strokeWidth}
                                                />
                                            )}
                                        </svg>
                                    ))}

                                {/* current drawing in progress */}
                                {currentDrawing && currentDrawing.page === currentPage && (
                                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                        {currentDrawing.type === 'rectangle' && currentDrawing.points.length === 2 && (
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
                                        {currentDrawing.type === 'line' && currentDrawing.points.length === 2 && (
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
        </div>
    );
};