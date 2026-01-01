import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { PreviewPanel } from './PreviewPanel';
import { uploadFile, processDocument } from './apiService';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DocumentIntelligence: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [data, setData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Upload
            const uploadRes = await uploadFile(file);
            console.log("Uploaded:", uploadRes);

            // 2. Process
            const processRes = await processDocument(uploadRes.file_id);
            console.log("Processed:", processRes);

            setCurrentFileId(uploadRes.file_id);
            setData(processRes);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during processing.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <BrainCircuit className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Document Intelligence</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Intro */}
                {!data && !isLoading && (
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                            Unlock insights from your documents
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Upload PDFs or Images. We'll extract text, tables, and convert them to editable Excel and Word formats instantly.
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 flex items-center gap-3">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {/* Uploader or Results */}
                {!data ? (
                    <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
                            <button
                                onClick={() => { setData(null); setCurrentFileId(null); }}
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                Process another file
                            </button>
                        </div>
                        <PreviewPanel data={data} fileId={currentFileId!} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default DocumentIntelligence;
