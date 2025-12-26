import React, { useState, useRef } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileText, Download, Loader2, FileType } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const WordToPdfTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

    const processFile = async (f: File) => {
        setFile(f);
        const arrayBuffer = await f.arrayBuffer();
        try {
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setPreviewHtml(result.value);
        } catch (err) {
            console.error("Mammoth error", err);
            alert("Failed to read Word file. Ensure it is a valid .docx file.");
        }
    };

    const handleDownload = async () => {
        if (!contentRef.current) return;
        setIsConverting(true);

        try {
            await new Promise(r => setTimeout(r, 100)); // Yield

            // Temporary Scale for better quality
            const canvas = await html2canvas(contentRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${file?.name.replace(/\.[^/.]+$/, "")}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
            alert("Failed to generate PDF");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <ToolLayout
            title="Word to PDF"
            description="Convert your Word documents (.docx) to professional PDF files."
            icon={<FileText className="w-10 h-10 text-blue-600" />}
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
                            accept=".docx"
                            mode="pdf-to-image" // Reusing style
                        />
                        <p className="text-center text-gray-500 mt-4 text-sm">Supports .docx files</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileType className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                                    <p className="text-sm text-gray-400">Word Document • Ready to convert</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setFile(null)}
                                    className="text-gray-500"
                                >
                                    Change File
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    disabled={isConverting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isConverting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                    Convert to PDF
                                </Button>
                            </div>
                        </div>

                        {/* Preview Area (Rendered as HTML) */}
                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm overflow-auto max-h-[800px] flex justify-center bg-gray-50">
                            <div
                                ref={contentRef}
                                className="bg-white p-12 shadow-md min-h-[1000px] w-full max-w-[800px] prose prose-blue prose-sm sm:prose lg:prose-lg"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default WordToPdfTools;
