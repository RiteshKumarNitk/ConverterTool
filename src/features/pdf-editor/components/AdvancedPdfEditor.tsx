import React, { useState } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileText, Layers, Scissors, RotateCw, Lock, Unlock, Image as ImageIcon, CheckCircle, Loader2, Download, Minimize2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';

type OperationMode = 'merge' | 'split' | 'rotate' | 'compress' | 'protect' | 'unlock' | 'watermark';

const AdvancedPdfEditor: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [mode, setMode] = useState<OperationMode>('merge');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    // Options
    const [password, setPassword] = useState('');
    const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
    const [rotation, setRotation] = useState(90);
    const [splitRange, setSplitRange] = useState('1'); // for split mode

    const handleFileSelect = (newFile: File) => {
        if (mode === 'merge') {
            setFiles(prev => [...prev, newFile]);
        } else {
            setFiles([newFile]); // Single file for others
        }
        setResultUrl(null);
    };

    const handleProcess = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setResultUrl(null);

        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        formData.append('operation', mode);

        const options: any = {};
        if (mode === 'protect' || mode === 'unlock') options.password = password;
        if (mode === 'watermark') options.text = watermarkText;
        if (mode === 'rotate') options.rotation = rotation;
        if (mode === 'split') {
            options.mode = 'range';
            options.ranges = splitRange;
        }

        formData.append('options', JSON.stringify(options));

        try {
            const res = await fetch('http://localhost:8000/pdf/edit', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Processing failed');
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setResultUrl(url);

        } catch (e: any) {
            console.error(e);
            alert(`Error: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadResult = () => {
        if (resultUrl) {
            const a = document.createElement('a');
            a.href = resultUrl;
            a.download = `edited_pdf_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <ToolLayout
            title="Pro PDF Editor"
            description="Merge, Split, Rotate, Compress, and Secure PDFs."
            icon={<Layers className="w-10 h-10 text-indigo-600" />}
        >
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Mode Selector */}
                <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    {[
                        { id: 'merge', label: 'Merge', icon: Layers },
                        { id: 'split', label: 'Split', icon: Scissors },
                        { id: 'rotate', label: 'Rotate', icon: RotateCw },
                        { id: 'compress', label: 'Compress', icon: Minimize2 },
                        { id: 'protect', label: 'Protect', icon: Lock },
                        { id: 'unlock', label: 'Unlock', icon: Unlock },
                        { id: 'watermark', label: 'Watermark', icon: ImageIcon },
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { setMode(m.id as OperationMode); setFiles([]); setResultUrl(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m.id
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <m.icon className="w-4 h-4" />
                            {m.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold mb-4 text-gray-900">1. Upload Files</h3>
                            <FileDropzone
                                isDragging={false}
                                isConverting={false}
                                progress={null} // Reuse existing props
                                onDragOver={(e) => e.preventDefault()}
                                onDragLeave={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                                }}
                                onFileInput={(e) => {
                                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                                }}
                                mode="any-to-image" // Safe reuse
                                accept=".pdf"
                            />

                            {/* File List */}
                            <div className="mt-4 space-y-2">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm text-gray-600">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="w-4 h-4" />
                                            <span className="truncate max-w-[150px]">{f.name}</span>
                                        </div>
                                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">×</button>
                                    </div>
                                ))}
                                {files.length === 0 && <p className="text-sm text-gray-400 text-center">No files selected</p>}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold mb-4 text-gray-900">2. Configure</h3>

                            {mode === 'split' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Ranges (e.g., 1-3,5)</label>
                                    <input
                                        type="text"
                                        value={splitRange}
                                        onChange={(e) => setSplitRange(e.target.value)}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            )}

                            {mode === 'rotate' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotation (Degrees)</label>
                                    <select
                                        value={rotation}
                                        onChange={(e) => setRotation(Number(e.target.value))}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value={90}>90° Clockwise</option>
                                        <option value={180}>180°</option>
                                        <option value={270}>270° (90° Counter)</option>
                                    </select>
                                </div>
                            )}

                            {(mode === 'protect' || mode === 'unlock') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            )}

                            {mode === 'watermark' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
                                    <input
                                        type="text"
                                        value={watermarkText}
                                        onChange={(e) => setWatermarkText(e.target.value)}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            )}

                            {(mode === 'merge' || mode === 'compress') && (
                                <p className="text-sm text-gray-500 italic">No extra options needed.</p>
                            )}

                            <Button
                                onClick={handleProcess}
                                disabled={isProcessing || files.length === 0}
                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : "Process PDF"}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center min-h-[500px]">
                            {resultUrl ? (
                                <div className="text-center space-y-4 w-full h-full flex flex-col">
                                    <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                                        <CheckCircle className="w-6 h-6" />
                                        <span className="font-semibold">Operation Successful!</span>
                                    </div>
                                    <iframe src={resultUrl} className="w-full flex-1 rounded-lg border border-gray-200" title="PDF Preview"></iframe>
                                    <Button onClick={downloadResult} className="w-full max-w-sm mx-auto bg-gray-900 text-white mt-4">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Edited PDF
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p>Select files and options to see the result here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
};

export default AdvancedPdfEditor;
