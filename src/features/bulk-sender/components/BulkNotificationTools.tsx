import React, { useState, useEffect } from 'react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { Mail, MessageSquare, Send, Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';

interface Recipient {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
}

const BulkNotificationTools: React.FC = () => {
    // Steps: upload -> compose -> sending
    const [step, setStep] = useState<'upload' | 'compose' | 'sending'>('upload');

    // Data
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [file, setFile] = useState<File | null>(null);

    // Config
    const [message, setMessage] = useState("Hello {{name}},\n\nHere is an update for you.");
    const [subject, setSubject] = useState("Important Update");
    const [channels, setChannels] = useState<{ email: boolean, whatsapp: boolean }>({ email: true, whatsapp: false });

    // Credentials (Optional for simulation)
    const [showCreds, setShowCreds] = useState(false);
    const [creds, setCreds] = useState({
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_user: '',
        smtp_pass: ''
    });

    // Job Status
    const [jobId, setJobId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [statusSummary, setStatusSummary] = useState('');

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const res = await fetch('http://localhost:8000/bulk/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);

            setRecipients(data.recipients); // Store all data in memory for this session
            setStep('compose');
        } catch (e: any) {
            alert(e.message);
            setFile(null);
        }
    };

    const handleSend = async () => {
        const activeChannels = [];
        if (channels.email) activeChannels.push('email');
        if (channels.whatsapp) activeChannels.push('whatsapp');

        if (activeChannels.length === 0) return alert("Select at least one channel");

        setStep('sending');
        setLogs(["Creating job..."]);

        try {
            const res = await fetch('http://localhost:8000/bulk/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    channel: activeChannels.join(','), // simple comma sep
                    template: message,
                    subject,
                    ...creds
                })
            });
            const data = await res.json();
            setJobId(data.job_id);
        } catch (e: any) {
            alert(e.message);
            setStep('compose');
        }
    };

    // Poll Status
    useEffect(() => {
        if (step !== 'sending' || !jobId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/bulk/status/${jobId}`);
                if (res.ok) {
                    const job = await res.json();
                    setProgress(job.progress);
                    setLogs(job.logs?.slice(-10).reverse() || []); // Show last 10 logs reversed

                    if (job.status === 'completed') {
                        setStatusSummary(job.summary);
                        clearInterval(interval);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [step, jobId]);

    return (
        <ToolLayout
            title="Bulk Notification Sender"
            description="Send mass Emails and WhatsApp messages using a CSV list."
            icon={<Mail className="w-10 h-10 text-cyan-600" />}
        >
            <div className="max-w-5xl mx-auto">

                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4">1. Upload Recipient List</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Upload a CSV or Excel file with columns: <code>name</code>, <code>email</code>, <code>phone</code>.
                            </p>
                            <FileDropzone
                                isDragging={false}
                                isConverting={false}
                                progress={null}
                                onDragOver={(e) => e.preventDefault()}
                                onDragLeave={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                                }}
                                onFileInput={(e) => {
                                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                                }}
                                mode="any-to-image"
                                accept=".csv,.xlsx"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Compose */}
                {step === 'compose' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Configuration */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-cyan-600" />
                                    Compose Message
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject (Email)</label>
                                        <input
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-gray-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={6}
                                            className="w-full p-2 rounded-lg border border-gray-200 font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Use <code>{`{{name}}`}</code>, <code>{`{{email}}`}</code> as placeholders.</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setShowCreds(!showCreds)}
                                            className="text-sm text-cyan-600 flex items-center gap-1 font-medium"
                                        >
                                            <Settings className="w-4 h-4" />
                                            {showCreds ? 'Hide SMTP Settings' : 'Configure SMTP (Optional)'}
                                        </button>

                                        {showCreds && (
                                            <div className="mt-4 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                                <input placeholder="SMTP Host" value={creds.smtp_host} onChange={e => setCreds({ ...creds, smtp_host: e.target.value })} className="p-2 border rounded" />
                                                <input placeholder="Port" value={creds.smtp_port} onChange={e => setCreds({ ...creds, smtp_port: parseInt(e.target.value) })} className="p-2 border rounded" />
                                                <input placeholder="Username" value={creds.smtp_user} onChange={e => setCreds({ ...creds, smtp_user: e.target.value })} className="p-2 border rounded" />
                                                <input placeholder="Password" type="password" value={creds.smtp_pass} onChange={e => setCreds({ ...creds, smtp_pass: e.target.value })} className="p-2 border rounded" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4">Target Channels</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" checked={channels.email} onChange={e => setChannels({ ...channels, email: e.target.checked })} className="accent-cyan-600 w-5 h-5" />
                                        <Mail className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium text-gray-700">Email</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" checked={channels.whatsapp} onChange={e => setChannels({ ...channels, whatsapp: e.target.checked })} className="accent-green-600 w-5 h-5" />
                                        <span className="w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-xs font-bold">W</span>
                                        <span className="font-medium text-gray-700">WhatsApp</span>
                                    </label>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500">Recipients:</span>
                                        <span className="font-bold text-gray-900">{recipients.length}</span>
                                    </div>
                                    <Button onClick={handleSend} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Blast
                                    </Button>
                                    <button onClick={() => setStep('upload')} className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Sending */}
                {step === 'sending' && (
                    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-cyan-100">
                            {statusSummary ? (
                                <div className="text-green-600 mb-4 flex justify-center">
                                    <CheckCircle className="w-16 h-16" />
                                </div>
                            ) : (
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-cyan-600">
                                        {progress}%
                                    </div>
                                </div>
                            )}

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {statusSummary ? "Batch Completed!" : "Sending Notifications..."}
                            </h2>
                            <p className="text-gray-500 mb-8">
                                {statusSummary || "Please wait while we process the queue sequentially."}
                            </p>

                            <div className="bg-gray-900 text-left p-4 rounded-xl h-48 overflow-y-auto font-mono text-xs text-green-400 shadow-inner">
                                {logs.length === 0 && <span className="text-gray-500">Initializing...</span>}
                                {logs.map((log, i) => (
                                    <div key={i} className="mb-1">{log}</div>
                                ))}
                            </div>

                            {statusSummary && (
                                <Button onClick={() => setStep('upload')} className="mt-6 bg-cyan-600 text-white">
                                    Start New Batch
                                </Button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </ToolLayout>
    );
};

export default BulkNotificationTools;
