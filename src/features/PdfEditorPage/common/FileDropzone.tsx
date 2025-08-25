// components/common/FileDropzone.tsx
import React, { useState, DragEvent, ChangeEvent } from 'react';
import { Upload, FileImage, FileText, Loader2 } from 'lucide-react';

export interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;   // ✅ Single-file callback
  acceptedFileTypes?: string[];           // Optional allowed types
  maxFileSize?: number;                   // Optional max file size
  mode?: 'image-to-pdf' | 'pdf-to-image'; // Optional mode for UI text
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileAccepted,
  acceptedFileTypes,
  maxFileSize,
  mode = 'pdf-to-image'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files.length) return;

    const file = e.dataTransfer.files[0];
    if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
      alert('Invalid file type');
      return;
    }

    if (maxFileSize && file.size > maxFileSize) {
      alert('File is too large');
      return;
    }

    onFileAccepted(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
      alert('Invalid file type');
      return;
    }

    if (maxFileSize && file.size > maxFileSize) {
      alert('File is too large');
      return;
    }

    onFileAccepted(file);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
        ${isDragging ? 'border-blue-400 bg-blue-50 scale-105' : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'}
        ${isProcessing ? 'pointer-events-none opacity-70' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={acceptedFileTypes?.join(',')}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />

      <div className="flex flex-col items-center space-y-4">
        {isProcessing ? (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <p className="text-xl font-semibold text-gray-700">Processing...</p>
          </>
        ) : (
          <>
            <div className="flex space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileImage className="w-8 h-8 text-blue-600" />
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <FileText className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-700">
              Drop files here or click to browse
            </p>
            {mode === 'image-to-pdf' ? (
              <p className="text-sm text-gray-500 mt-2">
                Supports: JPG, PNG, GIF, WebP → PDF
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Supports: PDF → JPG, PNG
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
