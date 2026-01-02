import React, { useState } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { Mic, Upload, FileAudio, CheckCircle, Copy, Download, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';

const AudioToTextTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState<string>('');
    const [detectedLang, setDetectedLang] = useState<string>('');

    // Config
    const [modelSize, setModelSize] = useState('base');
    const [language, setLanguage] = useState(''); // Empty = auto

    const handleFileSelect = (uploadedFile: File) => {
        setFile(uploadedFile);
        setTranscript('');
    };

    const handleTranscribe = async () => {
        if (!file) return;
        setIsProcessing(true);
        setTranscript('');

        const formData = new FormData();
        formData.append('audio_file', file);
        formData.append('model_size', modelSize);
        if (language) formData.append('language', language);

        try {
            const res = await fetch('http://localhost:8000/audio-to-text', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || 'Generic Error');

            setTranscript(data.text);
            setDetectedLang(data.language);

        } catch (e: any) {
            console.error(e);
            alert(`Transcription Failed: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(transcript);
        alert("Copied to clipboard!");
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([transcript], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "transcript.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <ToolLayout
            title="Audio to Text (Whisper)"
            description="Transcribe audio files with high accuracy using OpenAI Whisper."
            icon={<Mic className="w-10 h-10 text-emerald-600" />}
        >
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Upload Section */}
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
                            mode="any-to-image" // Reusing mode safely
                            accept="audio/*,.mp3,.wav,.m4a,.ogg"
                        />
                    ) : (
                        <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <FileAudio className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">{file.name}</h4>
                                    <p className="text-xs text-emerald-700">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="text-sm text-gray-500 hover:text-red-500">
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Configuration */}
                {file && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                                <h3 className="font-semibold mb-4">Settings</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model Size</label>
                                        <select
                                            value={modelSize}
                                            onChange={(e) => setModelSize(e.target.value)}
                                            className="w-full p-2 border rounded-lg text-sm"
                                        >
                                            <option value="tiny">Tiny (Fastest, Lower Accuracy)</option>
                                            <option value="base">Base (Balanced)</option>
                                            <option value="small">Small (Better)</option>
                                            <option value="medium">Medium (Slower, High Accuracy)</option>
                                            <option value="large">Large (Slowest, Best Accuracy)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full p-2 border rounded-lg text-sm"
                                        >
                                            <option value="">Auto Detect</option>
                                            <option value="en">English</option>
                                            <option value="hi">Hindi</option>
                                        </select>
                                    </div>

                                    <Button
                                        onClick={handleTranscribe}
                                        disabled={isProcessing}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Transcribing...
                                            </>
                                        ) : "Start Transcription"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Result Area */}
                        <div className="md:col-span-2">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold">Transcript</h3>
                                    {detectedLang && (
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                            Detected: {detectedLang}
                                        </span>
                                    )}
                                </div>

                                <textarea
                                    readOnly
                                    value={transcript}
                                    placeholder="Transcription will appear here..."
                                    className="w-full flex-1 min-h-[300px] p-4 rounded-xl bg-gray-50 border-0 resize-none font-mono text-sm leading-relaxed focus:ring-0"
                                />

                                {transcript && (
                                    <div className="flex gap-3 mt-4 justify-end">
                                        <Button variant="outline" size="sm" onClick={handleCopy}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                        <Button size="sm" onClick={handleDownload} className="bg-gray-900 text-white">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download .txt
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default AudioToTextTools;
