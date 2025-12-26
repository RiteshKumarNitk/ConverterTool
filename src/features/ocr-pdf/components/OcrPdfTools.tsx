import React, { useState, useEffect } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { ScanText, FileText, Loader2, Download, Copy, RefreshCw, Languages } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { pdfjs } from 'react-pdf';
import Tesseract from 'tesseract.js';
import '../../../utils/pdf-worker';

const OcrPdfTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [extractedText, setExtractedText] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState('eng');

    const processFile = async (f: File) => {
        setFile(f);
        setExtractedText('');
        setProgress(0);
    };

    const runOcr = async () => {
        if (!file) return;
        setIsProcessing(true);
        setExtractedText('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            let fullText = '';

            for (let i = 1; i <= numPages; i++) {
                setStatusText(`Processing page ${i} of ${numPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;
                    const imgData = canvas.toDataURL('image/png');

                    const result = await Tesseract.recognize(
                        imgData,
                        selectedLanguage,
                        {
                            logger: m => {
                                if (m.status === 'recognizing text') {
                                    const pageProgress = m.progress / numPages; // Approximation
                                    const baseProgress = (i - 1) / numPages;
                                    setProgress(Math.round((baseProgress + pageProgress) * 100));
                                }
                            }
                        }
                    );

                    fullText += `--- Page ${i} ---\n\n${result.data.text}\n\n`;
                }
            }

            setExtractedText(fullText);
            setStatusText('Completed!');
            setProgress(100);

        } catch (err) {
            console.error("OCR Failed", err);
            alert("Failed to perform OCR. Please check the file and try again.");
            setStatusText('Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(extractedText);
        // Could show a toast here
        alert("Text copied to clipboard!");
    };

    const handleDownload = () => {
        const blob = new Blob([extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file?.name.replace('.pdf', '')}_ocr.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <ToolLayout
            title="PDF OCR"
            description="Extract text from scanned PDF documents using optical character recognition."
            icon={<ScanText className="w-10 h-10 text-orange-600" />}
        >
            <div className="space-y-8">
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
                            mode="pdf" // Reusing styling
                        />
                        <p className="text-center text-gray-500 mt-4 text-sm">Upload scanned PDFs or images converted to PDF</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Control Bar */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate max-w-[200px]">{file.name}</h3>
                                    <p className="text-sm text-gray-400">PDF Document</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 mr-4">
                                    <Languages className="w-4 h-4 text-gray-500" />
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="text-sm border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500"
                                        disabled={isProcessing}
                                    >
                                        <option value="eng">English</option>
                                        <option value="spa">Spanish</option>
                                        <option value="fra">French</option>
                                        <option value="deu">German</option>
                                        <option value="hin">Hindi</option>
                                        {/* Add more Tesseract languages as needed */}
                                    </select>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setFile(null)}
                                    disabled={isProcessing}
                                >
                                    Change File
                                </Button>
                                <Button
                                    onClick={runOcr}
                                    disabled={isProcessing || extractedText.length > 0}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            {progress > 0 ? `${progress}%` : 'Starting...'}
                                        </>
                                    ) : (
                                        <>
                                            <ScanText className="w-4 h-4 mr-2" />
                                            Start OCR
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Status / Output Area */}
                        {isProcessing && (
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center animate-pulse">
                                {statusText}
                            </div>
                        )}

                        {extractedText && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                                {/* Original File Preview (First page only for context) */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center p-4">
                                    <p className="text-gray-400 text-center">
                                        (File Preview Placeholder)<br />
                                        PDF pages are processed individually.
                                    </p>
                                </div>

                                {/* Extracted Text */}
                                <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                    <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
                                        <h4 className="font-semibold text-gray-700">Extracted Text</h4>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={handleCopy} title="Copy to Clipboard">
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={handleDownload} title="Download Text">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <textarea
                                        className="flex-1 p-4 w-full h-full resize-none focus:outline-none font-mono text-sm bg-white"
                                        value={extractedText}
                                        readOnly
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default OcrPdfTools;
