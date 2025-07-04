import React from 'react';
import { Upload, FileImage, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface FileDropzoneProps {
  isDragging: boolean;
  isConverting: boolean;
  progress: { current: number; total: number } | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode: 'image-to-pdf' | 'pdf-to-image'; // 👈 NEW prop
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
      className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
        isDragging
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isConverting}
      />
      {/* <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={onFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isConverting}
      /> */}
      
      <div className="flex flex-col items-center space-y-4">
        {isConverting ? (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <p className="text-xl font-semibold text-gray-700">Converting files...</p>
            <p className="text-sm text-gray-500">
              Processing high-quality images - this may take a moment
            </p>
            {progress && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {progress ? `Processing page ${progress.current} of ${progress.total}` : 'Starting conversion...'}
            </p>
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
              <>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, GIF, WebP → PDF (exact dimensions)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Images will be converted to PDFs with their original size
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Supports: PDF → PNG, JPG (high-quality page rendering)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Each PDF page will be converted to a separate image
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};