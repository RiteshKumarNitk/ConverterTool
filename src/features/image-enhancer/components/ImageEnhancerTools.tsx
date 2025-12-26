import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { Sparkles, Download, RefreshCw, Image as ImageIcon, Sliders, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import Upscaler from 'upscaler';

const ImageEnhancerTools: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        upscaleMode: 'none' as 'none' | 'fast' | 'ai',
        upscaleFactor: 2 as 2 | 4,
        sharpen: 0, // 0-10
        denoise: 0, // 0-10
        brightness: 100, // 100 is default
        contrast: 100, // 100 is default
        saturation: 100 // 100 is default
    });
    const [processing, setProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            loadFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            loadFile(e.target.files[0]);
        }
    };

    const loadFile = (f: File) => {
        setFile(f);
        setOriginalImage(URL.createObjectURL(f));
        setProcessedImage(null); // Reset prev result
    };

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Helper for applying convolution matrix (for sharpening)
    const applyConvolution = (ctx: CanvasRenderingContext2D, width: number, height: number, kernel: number[]) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const side = Math.round(Math.sqrt(kernel.length));
        const halfSide = Math.floor(side / 2);
        const src = imageData.data;
        const output = ctx.createImageData(width, height);
        const dst = output.data;

        // Simple convolution loop
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0; // a = 0;
                const dstIdx = (y * width + x) * 4;

                // Kernel loop
                for (let ky = 0; ky < side; ky++) {
                    for (let kx = 0; kx < side; kx++) {
                        const cy = y + ky - halfSide;
                        const cx = x + kx - halfSide;

                        // Edge handling: clamp
                        const scy = Math.min(height - 1, Math.max(0, cy));
                        const scx = Math.min(width - 1, Math.max(0, cx));

                        const srcIdx = (scy * width + scx) * 4;
                        const wt = kernel[ky * side + kx];

                        r += src[srcIdx] * wt;
                        g += src[srcIdx + 1] * wt;
                        b += src[srcIdx + 2] * wt;
                    }
                }

                dst[dstIdx] = r;
                dst[dstIdx + 1] = g;
                dst[dstIdx + 2] = b;
                dst[dstIdx + 3] = src[dstIdx + 3]; // Alpha copy
            }
        }
        ctx.putImageData(output, 0, 0);
    };

    const processImage = async () => {
        if (!file || !canvasRef.current) return;
        setProcessing(true);

        const img = new Image();
        img.src = originalImage || "";
        // Improve loading reliability
        img.crossOrigin = "anonymous";
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let processedImgSource = img;

        // 1. AI Upscaling (if enabled)
        // Uses UpscalerJS with default GANS model (2x or 4x usually)
        if (settings.upscaleMode === 'ai') {
            try {
                const upscaler = new Upscaler();
                // Upscale returns a base64 string
                const upscaledSrc = await upscaler.upscale(img, {
                    patchSize: 64, // Process in chunks to avoid memory crash
                    padding: 4
                });

                // Load result back into an Image object
                const upscaledImg = new Image();
                upscaledImg.src = upscaledSrc;
                await new Promise(r => upscaledImg.onload = r);
                processedImgSource = upscaledImg;

                // Second pass if 4x requested
                if (settings.upscaleFactor === 4) {
                    const upscaler2 = new Upscaler();
                    const upscaledSrc2 = await upscaler2.upscale(upscaledImg, {
                        patchSize: 64,
                        padding: 4
                    });
                    const currentImg2 = new Image();
                    currentImg2.src = upscaledSrc2;
                    await new Promise(r => currentImg2.onload = r);
                    processedImgSource = currentImg2;
                }
            } catch (err) {
                console.error("Upscaling failed", err);
                // Fallback to manual if AI fails
            }
        }

        // 2. Adjust Dimensions & Draw
        let width = processedImgSource.width;
        let height = processedImgSource.height;

        // Fast Upscale (Canvas resizing)
        if (settings.upscaleMode === 'fast') {
            width = img.width * settings.upscaleFactor;
            height = img.height * settings.upscaleFactor;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.imageSmoothingQuality = 'high';

        // 3. Apply Filters (Brightness, Contrast, Saturation, Denoise)
        const blurAmount = settings.denoise > 0 ? `blur(${settings.denoise * 0.5}px)` : '';
        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) ${blurAmount}`;
        ctx.drawImage(processedImgSource, 0, 0, width, height);
        ctx.filter = 'none';

        // 4. Sharpening via Convolution (Post-processing)
        if (settings.sharpen > 0) {
            // Apply sharpening to the (possibly upscaled) image
            const s = settings.sharpen * 0.1;
            const k = [
                0, -s, 0,
                -s, 1 + 4 * s, -s,
                0, -s, 0
            ];
            // Yield for UI update
            await new Promise(r => setTimeout(r, 10));
            applyConvolution(ctx, width, height, k);
        }

        setProcessedImage(canvas.toDataURL((file.type === 'image/png' ? 'image/png' : 'image/jpeg'), 0.9));
        setProcessing(false);
    };

    // Auto-process on initial load, but not on every slider change because it's heavy
    useEffect(() => {
        if (file && !processedImage) {
            processImage();
        }
    }, [file]);

    return (
        <ToolLayout
            title="Image Enhancer"
            description="Upscale to 4K, reduce noise, and refine details with advanced processing."
            icon={<Sparkles className="w-10 h-10 text-purple-600" />}
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
                            onDrop={handleDrop}
                            onFileInput={handleFileChange}
                            mode="enhance-image"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-xl border border-purple-100 shadow-sm h-fit">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Sliders className="w-4 h-4" /> Adjustment Settings
                            </h3>

                            <div className="space-y-4">
                                {/* Upscale Mode Selection */}
                                <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                                    <label className="text-sm font-medium text-gray-700 block">Upscale Mode</label>
                                    <div className="flex bg-white rounded-md p-1 border border-gray-200">
                                        <button
                                            onClick={() => handleSettingChange('upscaleMode', 'none')}
                                            className={`flex-1 text-sm py-1.5 rounded ${settings.upscaleMode === 'none' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            None
                                        </button>
                                        <button
                                            onClick={() => handleSettingChange('upscaleMode', 'fast')}
                                            className={`flex-1 text-sm py-1.5 rounded ${settings.upscaleMode === 'fast' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            Fast
                                        </button>
                                        <button
                                            onClick={() => handleSettingChange('upscaleMode', 'ai')}
                                            className={`flex-1 text-sm py-1.5 rounded ${settings.upscaleMode === 'ai' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            AI
                                        </button>
                                    </div>

                                    {/* Factor Selection (Hidden if None) */}
                                    {settings.upscaleMode !== 'none' && (
                                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Factor:</span>
                                            <div className="flex gap-2">
                                                {[2, 4].map(f => (
                                                    <button
                                                        key={f}
                                                        onClick={() => handleSettingChange('upscaleFactor', f)}
                                                        className={`px-3 py-1 text-xs rounded border ${settings.upscaleFactor === f ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
                                                    >
                                                        {f}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sharpening</label>
                                        <span className="text-xs text-gray-400">{settings.sharpen}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="10" step="1" value={settings.sharpen}
                                        onChange={(e) => handleSettingChange('sharpen', parseFloat(e.target.value))}
                                        className="w-full mt-2 accent-purple-600"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Denoise</label>
                                        <span className="text-xs text-gray-400">{settings.denoise}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="10" step="1" value={settings.denoise}
                                        onChange={(e) => handleSettingChange('denoise', parseFloat(e.target.value))}
                                        className="w-full mt-2 accent-purple-600"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-4">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brightness</span>
                                        <input type="range" min="50" max="150" value={settings.brightness} onChange={(e) => handleSettingChange('brightness', parseFloat(e.target.value))} className="w-full mt-2 accent-purple-600" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contrast</span>
                                        <input type="range" min="50" max="150" value={settings.contrast} onChange={(e) => handleSettingChange('contrast', parseFloat(e.target.value))} className="w-full mt-2 accent-purple-600" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saturation</span>
                                        <input type="range" min="0" max="200" value={settings.saturation} onChange={(e) => handleSettingChange('saturation', parseFloat(e.target.value))} className="w-full mt-2 accent-purple-600" />
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
                                    onClick={processImage}
                                    disabled={processing}
                                >
                                    {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    {processing ? 'Processing...' : 'Apply Changes'}
                                </Button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 min-h-[400px] flex items-center justify-center relative bg-[url('https://transparenttextures.com/patterns/cubes.png')] h-[600px]">
                                {processedImage && originalImage ? (
                                    <ReactCompareSlider
                                        itemOne={<ReactCompareSliderImage src={originalImage} alt="Original" />}
                                        itemTwo={<ReactCompareSliderImage src={processedImage} alt="Enhanced" />}
                                        className="h-full w-full object-contain"
                                        style={{ height: '100%', width: '100%' }}
                                    />
                                ) : (
                                    <div className="text-gray-400 flex flex-col items-center">
                                        {processing ? <Loader2 className="w-10 h-10 animate-spin mb-2" /> : <ImageIcon className="w-12 h-12 mb-2 opacity-50" />}
                                        <p>{processing ? 'Enhancing...' : 'Preview will appear here'}</p>
                                    </div>
                                )}
                            </div>

                            {processedImage && (
                                <div className="flex justify-between items-center bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <div className="text-sm text-purple-800">
                                        <span className="font-semibold">Tip:</span> Drag the slider to compare before/after.
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setFile(null)}
                                            className="text-red-500 hover:bg-red-50"
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.download = `enhanced-${file?.name || 'image'}`;
                                                link.href = processedImage;
                                                link.click();
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Download
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Hidden Canvas for Processing */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </ToolLayout>
    );
};

export default ImageEnhancerTools;
