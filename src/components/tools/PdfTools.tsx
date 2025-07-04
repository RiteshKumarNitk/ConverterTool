import React from 'react';
import { FileDropzone } from '../common/FileDropzone';
import { ConversionResults } from '../common/ConversionResults';
import { FeaturesSection } from '../common/FeaturesSection';
// import { useFileConverter } from '../../hooks/useFileConverter';
import { useImageToPDFConverter } from '../../features/image-to-pdf/hooks/useImageToPDFConverter';


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
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <FileDropzone
        isDragging={isDragging}
        isConverting={isConverting}
        progress={progress}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInput={handleFileInput}
        mode="image-to-pdf" // 👈 pass here
      />
      </div>

      {results.length > 0 && (
        <ConversionResults 
          results={results} 
          warning={warning}
          error={error}
          onReset={resetConverter}
        />
      )}

      <FeaturesSection />
    </div>
  );
};