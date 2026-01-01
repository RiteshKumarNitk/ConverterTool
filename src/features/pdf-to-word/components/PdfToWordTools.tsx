import React, { useState } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileText, Download, Loader2, FileType } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { pdfjs } from 'react-pdf';
import '../../../utils/pdf-worker';

const PdfToWordTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);

    const convertToWord = async () => {
        if (!file) return;
        setIsConverting(true);
        setProgress(0);

        try {
            // 1. Upload
            setProgress(10);
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const { file_id } = await uploadRes.json();

            // 2. Process
            setProgress(40);
            const processRes = await fetch(`http://localhost:8000/process/${file_id}`, {
                method: 'POST'
            });

            if (!processRes.ok) throw new Error('Processing failed');

            // 3. Download
            setProgress(90);
            const downloadUrl = `http://localhost:8000/download/${file_id}/docx`;

            // Trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${file.name.replace('.pdf', '')}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setProgress(100);

        } catch (err) {
            console.error("Conversion failed", err);
            alert("Failed to convert PDF to Word. Ensure backend is running.");
        } finally {
            setIsConverting(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return (
        <ToolLayout
            title="PDF to Word"
            description="Convert PDF documents to editable Word files."
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
                                if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                            }}
                            onFileInput={(e) => {
                                if (e.target.files?.[0]) setFile(e.target.files[0]);
                            }}
                            mode="pdf"
                            accept=".pdf"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="p-4 bg-blue-50 rounded-full">
                            <FileText className="w-12 h-12 text-blue-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900">{file.name}</h3>
                            <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setFile(null)}
                                disabled={isConverting}
                            >
                                Change File
                            </Button>
                            <Button
                                onClick={convertToWord}
                                disabled={isConverting}
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                            >
                                {isConverting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Converting {progress}%...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Word
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 max-w-md text-center">
                            Note: This performs a text-based conversion. Graphic layout fidelity may be limited.
                        </p>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default PdfToWordTools;
