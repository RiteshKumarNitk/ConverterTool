import React from 'react';
import { FileDropzone } from '../common/FileDropzone';
import { ConversionResults } from '../common/ConversionResults';
import { FeaturesSection } from '../common/FeaturesSection';
import { useImageToPDFConverter } from '../../features/image-to-pdf/hooks/useImageToPDFConverter';
import { ToolLayout } from '../layout/ToolLayout';
import { FileImage } from 'lucide-react';

export const PdfTools: React.FC = () => {
  const {
    results,
    isConverting,
    error,
    warning,
    progress,
    handleFiles,
    resetConverter
  } = useImageToPDFConverter();

  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  return (
    <ToolLayout
      title="Image to PDF Converter"
      description="Transform your images (JPG, PNG, GIF) into professional PDF documents in seconds. Merge multiple images into a single PDF file with ease."
      icon={<FileImage className="w-10 h-10 text-blue-600" />}
    >
      <div className="space-y-8">
        <div className="max-w-3xl mx-auto">
          <FileDropzone
            isDragging={isDragging}
            isConverting={isConverting}
            progress={progress}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileInput={handleFileInput}
            mode="image-to-pdf"
          />
        </div>

        {results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ConversionResults
              results={results}
              warning={warning}
              error={error}
              onReset={resetConverter}
            />
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100">
          <FeaturesSection />
        </div>
      </div>
    </ToolLayout>
  );
};