import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { Mic, Play, Download, Loader2, Volume2, Languages, Settings2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const TextToSpeechTools: React.FC = () => {
    const [text, setText] = useState('');
    const [language, setLanguage] = useState('en');
    const [speed, setSpeed] = useState(1.0);
    const [pitch, setPitch] = useState(1.0);
    const [voice, setVoice] = useState<string>('');

    // Curated list of high-quality neural voices
    const VOICE_OPTIONS = {
        en: [
            { id: 'en-US-AriaNeural', name: '🇺🇸 US Female (Aria)', gender: 'female' },
            { id: 'en-US-GuyNeural', name: '🇺🇸 US Male (Guy)', gender: 'male' },
            { id: 'en-GB-SoniaNeural', name: '🇬🇧 UK Female (Sonia)', gender: 'female' },
            { id: 'en-GB-RyanNeural', name: '🇬🇧 UK Male (Ryan)', gender: 'male' },
            { id: 'en-IN-NeerjaNeural', name: '🇮🇳 India Female (Neerja)', gender: 'female' },
            { id: 'en-IN-PrabhatNeural', name: '🇮🇳 India Male (Prabhat)', gender: 'male' },
        ],
        hi: [
            { id: 'hi-IN-SwaraNeural', name: '🇮🇳 Hindi Female (Swara)', gender: 'female' },
            { id: 'hi-IN-MadhurNeural', name: '🇮🇳 Hindi Male (Madhur)', gender: 'male' },
        ]
    };

    // Set default voice when language changes
    useEffect(() => {
        const options = VOICE_OPTIONS[language as keyof typeof VOICE_OPTIONS];
        if (options && options.length > 0) {
            setVoice(options[0].id);
        }
    }, [language]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setIsProcessing(true);
        setAudioUrl(null);

        try {
            const response = await fetch('http://localhost:8000/text-to-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    language,
                    voice,
                    speed,
                    pitch
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'TTS Generation failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            // Auto play
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }

        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Text to Speech"
            description="Convert text into natural sounding speech using advanced AI voices."
            icon={<Mic className="w-10 h-10 text-pink-600" />}
        >
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Settings */}
                    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-pink-500" />
                            Voice Settings
                        </h3>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">Language</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${language === 'en'
                                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                                        : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                                        }`}
                                >
                                    🇺🇸 English
                                </button>
                                <button
                                    onClick={() => setLanguage('hi')}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${language === 'hi'
                                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                                        : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                                        }`}
                                >
                                    🇮🇳 Hindi
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">Voice</label>
                            <select
                                value={voice}
                                onChange={(e) => setVoice(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                            >
                                {VOICE_OPTIONS[language as keyof typeof VOICE_OPTIONS]?.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block flex justify-between">
                                <span>Speed</span>
                                <span className="text-gray-400">{speed}x</span>
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                className="w-full accent-pink-600"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block flex justify-between">
                                <span>Pitch</span>
                                <span className="text-gray-400">{pitch}x</span>
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.1"
                                value={pitch}
                                onChange={(e) => setPitch(parseFloat(e.target.value))}
                                className="w-full accent-pink-600"
                            />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter text here to convert to speech..."
                                className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none text-gray-700 text-lg leading-relaxed placeholder:text-gray-400"
                            />

                            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                                <span>{text.length} characters</span>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!text.trim() || isProcessing}
                                    className="bg-pink-600 hover:bg-pink-700 text-white min-w-[140px]"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-4 h-4 mr-2" />
                                            Speak
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Audio Player Result */}
                        {audioUrl && (
                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                <audio ref={audioRef} controls src={audioUrl} className="w-full h-10 accent-pink-600" />
                                <a
                                    href={audioUrl}
                                    download={`speech_${new Date().getTime()}.mp3`}
                                    className="p-3 bg-white text-pink-600 rounded-full shadow-sm hover:shadow hover:bg-pink-50 transition-all border border-pink-100"
                                    title="Download MP3"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
};

export default TextToSpeechTools;
