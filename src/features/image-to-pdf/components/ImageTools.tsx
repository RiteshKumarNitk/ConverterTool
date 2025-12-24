import React from 'react';
import { AlertCircle, FileText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { ConversionResults } from '../../../components/common/ConversionResults';
import { FeaturesSection } from '../../../components/common/FeaturesSection';
import { usePDFToImageConverter } from '../../pdf-to-image/hooks/usePDFToImageConverter';
import { ToolLayout } from '../../../components/layout/ToolLayout';

interface ImageToolsProps {
  isMobile: boolean;
}

export const ImageTools: React.FC<ImageToolsProps> = ({ isMobile }) => {
  const {
    results,
    isConverting,
    error,
    warning,
    progress,
    handleFiles,
    resetConverter
  } = usePDFToImageConverter();

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
      title="PDF to Image Converter"
      description="Extract high-quality images from your PDF documents. Save pages as PNG or JPG files with optimal resolution."
      icon={<FileText className="w-10 h-10 text-emerald-600" />}
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
            mode="pdf-to-image"
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

        {isMobile && (
          <div className="mt-4">
            <Card className="p-4 flex items-start bg-blue-50 border-blue-100">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-blue-700 text-sm">
                For best results with large files, please use a desktop browser.
              </p>
            </Card>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
