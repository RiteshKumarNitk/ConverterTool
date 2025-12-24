import React from 'react';
import { Upload, FileImage, FileText, Loader2, Layers } from 'lucide-react';

interface FileDropzoneProps {
  isDragging: boolean;
  isConverting: boolean;
  progress: { current: number; total: number } | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode: 'image-to-pdf' | 'pdf-to-image' | 'merge' | 'any-to-image';
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  isDragging,
  isConverting,
  progress,
  onDragOver,
  onDragLeave,
  onDrop,
  mode,
  onFileInput
}) => {
  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${isDragging
        ? 'border-blue-400 bg-blue-50 scale-105'
        : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
        } ${isConverting ? 'pointer-events-none opacity-75' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >

      <input
        type="file"
        multiple
        accept={mode === 'image-to-pdf' ? 'image/*' : 'application/pdf'}
        onChange={onFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isConverting}
      />

      <div className="flex flex-col items-center space-y-4">
        {isConverting ? (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <p className="text-xl font-semibold text-gray-700">Processing files...</p>
            <p className="text-sm text-gray-500">
              Please wait while we process your documents
            </p>
            {progress && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md mt-4">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
                <p className="text-sm text-gray-500 mt-2">
                  {`Processing ${progress.current} of ${progress.total}`}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex space-x-4 mb-4">
              {mode === 'image-to-pdf' && <div className="p-3 bg-blue-100 rounded-full"><FileImage className="w-8 h-8 text-blue-600" /></div>}
              {(mode === 'pdf-to-image' || mode === 'merge') && <div className="p-3 bg-red-100 rounded-full"><FileText className="w-8 h-8 text-red-600" /></div>}
              {mode === 'merge' && <div className="p-3 bg-yellow-100 rounded-full"><Layers className="w-8 h-8 text-yellow-600" /></div>}
            </div>
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-700">
              Drop files here or click to browse
            </p>
            {mode === 'image-to-pdf' && (
              <p className="text-sm text-gray-500">
                Supports: JPG, PNG, GIF, WebP → PDF
              </p>
            )}
            {mode === 'pdf-to-image' && (
              <p className="text-sm text-gray-500">
                Supports: PDF → PNG, JPG
              </p>
            )}
            {mode === 'merge' && (
              <p className="text-sm text-gray-500">
                Select multiple PDF files to combine
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};