import React from 'react';
import {  AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { ConversionResults } from '../../../components/common/ConversionResults';
import { FeaturesSection } from '../../../components/common/FeaturesSection';
// import { useFileConverter } from '../../hooks/useFileConverter';
import { usePDFToImageConverter } from '../../pdf-to-image/hooks/usePDFToImageConverter';

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
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
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
            mode="pdf-to-image" // 👈 pass here
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
        {/* <Card className="p-8 text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileImage className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon: Advanced Image Tools</h2>
          <p className="text-gray-600 mb-6">
            We're working on professional image conversion and optimization tools.
            Check back soon for features like batch processing, format conversion,
            and resolution enhancement.
          </p>
          <Button className="mx-auto">
            Notify Me When Available
          </Button>
        </Card> */}

        {isMobile && (
          <div className="mt-4">
            <Card className="p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-blue-700">
                For best results with large files, use a desktop browser
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
