import React, { useState } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileText, Download, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';

const PdfToImageTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrls, setResultUrls] = useState<string[]>([]);

    const handleFileSelect = (uploadedFile: File) => {
        setFile(uploadedFile);
        setResultUrls([]);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setResultUrls([]);

        const formData = new FormData();
        // Uses the generic process endpoint which should handle PDF -> Images
        // Or we can create a specific endpoint. 
        // Let's use generic first if it supports it, but earlier processor.py had _process_image.
        // processor.py _process_pdf returns text.
        // We probably need a specific endpoint for PDF -> Image extraction.

        // Let's hit a new endpoint /pdf-to-image which we will create next.
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/pdf-to-image', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Conversion failed');

            // Expecting list of image URLs or a zip
            // For simplicity, let's assume it returns a JSON with list of saved image filenames
            const data = await res.json();
            // data.images = ["filename1.png", "filename2.png"]

            // Construct full URLs
            const urls = data.images.map((img: string) => `http://localhost:8000/download/${img}/file`);
            // Note: need to adjust download endpoint to support direct file access or specific images
            // Simply use static serving or download endpoint with loose format.

            // Actually, main.py download endpoint requires file_id. 
            // Let's assume the backend returns direct download URLs or we construct them.
            // Let's refine backend first.
            setResultUrls(data.images.map((img: string) => `http://localhost:8000/outputs/${img}`));

        } catch (e) {
            console.error(e);
            alert("Failed to convert PDF to Image.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="PDF to Image"
            description="Convert PDF pages to high-quality images."
            icon={<FileText className="w-10 h-10 text-emerald-600" />}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    {!file ? (
                        <FileDropzone
                            isDragging={false}
                            isConverting={false}
                            progress={null}
                            onDragOver={(e) => e.preventDefault()}
                            onDragLeave={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                            }}
                            onFileInput={(e) => {
                                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                            }}
                            mode="any-to-image"
                            accept=".pdf"
                        />
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-emerald-600" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{file.name}</h4>
                                        <p className="text-xs text-emerald-700">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} className="text-sm text-gray-500 hover:text-red-500">
                                    Remove
                                </button>
                            </div>

                            <Button
                                onClick={handleConvert}
                                disabled={isProcessing}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Converting...
                                    </>
                                ) : "Convert to Images"}
                            </Button>
                        </div>
                    )}
                </div>

                {resultUrls.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Converted Pages
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {resultUrls.map((url, i) => (
                                <div key={i} className="group relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border">
                                    {/* Note: We rely on main.py serving outputs statically or via download endpoint */}
                                    <img src={url} alt={`Page ${i + 1}`} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a
                                            href={url}
                                            download={`page_${i + 1}.png`}
                                            className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-100"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default PdfToImageTools;
