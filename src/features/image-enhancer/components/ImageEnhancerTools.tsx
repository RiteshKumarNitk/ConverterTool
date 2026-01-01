import React, { useState } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { Wand2, Upload, Download, Loader2, Sparkles, Zap, Image as ImageIcon, ScanEye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

const ImageEnhancerTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Configuration
    const [mode, setMode] = useState<'auto' | 'deblur' | 'sharpen' | 'contrast' | 'denoise'>('auto');
    const [upscale, setUpscale] = useState<1 | 2 | 4>(1);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setEnhancedUrl(null); // Reset previous result
    };

    const handleProcess = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('image_file', file);
            formData.append('enhancement_type', mode);
            formData.append('upscale_factor', upscale.toString());

            const response = await fetch('http://localhost:8000/image-enhancer', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Enhancement failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setEnhancedUrl(url);

        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (enhancedUrl) {
            const link = document.createElement('a');
            link.href = enhancedUrl;
            link.download = `enhanced_${file?.name || 'image.png'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Modes configuration
    const modes = [
        { id: 'auto', label: 'Auto Enhance', icon: Wand2, desc: 'Balanced improvement for general photos' },
        { id: 'deblur', label: 'Deblur', icon: ScanEye, desc: 'Fixes out-of-focus or motion blurred images' },
        { id: 'sharpen', label: 'Sharpen', icon: Zap, desc: 'Enhances edges and fine details' },
        { id: 'contrast', label: 'Color & Contrast', icon: Sparkles, desc: 'Improves lighting and vibrancy' },
        { id: 'denoise', label: 'Denoise', icon: ImageIcon, desc: 'Removes grain from low-light photos' },
    ];

    return (
        <ToolLayout
            title="AI Image Enhancer"
            description="Unblur, sharpen, and upscale your images using advanced computer vision."
            icon={<Wand2 className="w-10 h-10 text-violet-600" />}
        >
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Upload Section */}
                {!file ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
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
                            mode="image"
                            accept="image/*"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left: Controls */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-violet-500" />
                                    Enhancement Mode
                                </h3>
                                <div className="space-y-3">
                                    {modes.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setMode(m.id as any)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${mode === m.id
                                                    ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500'
                                                    : 'border-gray-200 hover:border-violet-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${mode === m.id ? 'bg-violet-200 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                                                <m.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className={`font-medium ${mode === m.id ? 'text-violet-900' : 'text-gray-900'}`}>{m.label}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <h3 className="font-semibold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                                    <ScanEye className="w-5 h-5 text-blue-500" />
                                    Resolution Upscale
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 4].map((scale) => (
                                        <button
                                            key={scale}
                                            onClick={() => setUpscale(scale as 1 | 2 | 4)}
                                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${upscale === scale
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {scale}x
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 space-y-3">
                                    <Button
                                        onClick={handleProcess}
                                        disabled={isProcessing}
                                        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-lg shadow-lg shadow-violet-200"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Enhancing...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-5 h-5 mr-2" />
                                                Enhance Image
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setFile(null);
                                            setEnhancedUrl(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="w-full"
                                        disabled={isProcessing}
                                    >
                                        Upload New Image
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Preview */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-medium text-gray-700">Preview Result</h3>
                                    {enhancedUrl && (
                                        <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Enhanced
                                        </Button>
                                    )}
                                </div>

                                <div className="flex-1 bg-[url('https://repo.sourcelib.org/patterns/transparent-bg.png')] bg-repeat min-h-[500px] flex items-center justify-center relative p-4">
                                    {enhancedUrl ? (
                                        <div className="relative shadow-2xl rounded-lg overflow-hidden max-h-[600px] w-full max-w-2xl border-4 border-white">
                                            <ReactCompareSlider
                                                itemOne={<ReactCompareSliderImage src={previewUrl!} alt="Original" />}
                                                itemTwo={<ReactCompareSliderImage src={enhancedUrl} alt="Enhanced" />}
                                                style={{ width: '100%', height: '100%' }} // ensure it fills container
                                            />
                                            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm pointer-events-none">Original</div>
                                            <div className="absolute top-4 right-4 bg-violet-600/80 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm pointer-events-none">Enhanced</div>
                                        </div>
                                    ) : (
                                        <div className="relative shadow-xl rounded-lg overflow-hidden max-h-[600px]">
                                            <img src={previewUrl!} alt="Preview" className="max-w-full max-h-[600px] object-contain" />
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg text-center">
                                                    <Wand2 className="w-8 h-8 text-violet-500 mx-auto mb-2 animate-pulse" />
                                                    <p className="font-medium text-gray-900">Ready to Enhance</p>
                                                    <p className="text-xs text-gray-500 mt-1">Select options and click Enhance Image</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default ImageEnhancerTools;
