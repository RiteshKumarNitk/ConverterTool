import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploaderProps {
    onFileUpload: (file: File) => void;
    isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            validateAndUpload(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndUpload(e.target.files[0]);
        }
    };

    const validateAndUpload = (file: File) => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/png'];
        if (validTypes.includes(file.type)) {
            onFileUpload(file);
        } else {
            alert("Please upload a PDF or Image file (JPG, PNG).");
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 bg-white'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
            />

            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    ) : (
                        <UploadCloud className="w-10 h-10 text-blue-600" />
                    )}
                </div>

                <h3 className="text-2xl font-bold text-gray-800">
                    {isLoading ? "Processing..." : "Upload Document"}
                </h3>

                <p className="text-gray-500 max-w-md mx-auto">
                    Drag & drop your PDF or Image here, or click to browse.
                    <br />
                    <span className="text-sm mt-2 inline-block text-gray-400">
                        Supports: PDF, JPG, PNG (Max 10MB)
                    </span>
                </p>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-200/50 disabled:bg-gray-400"
                >
                    Select File
                </button>
            </div>
        </div>
    );
};
