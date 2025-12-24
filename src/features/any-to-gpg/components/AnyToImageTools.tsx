import React, { useState } from 'react';
import { useAnyFileToImageConverter } from '../hooks/useAnyFileToImageConverter';
import { Download, FolderDown, FileDown, File, Image, FileText, Settings, Zap } from 'lucide-react';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileDropzone } from '../../../components/common/FileDropzone';
import { Button } from '../../../components/ui/Button';

const AnyToImageTools: React.FC = () => {
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'pdf'>('jpeg');
  const [dragActive, setDragActive] = useState(false);

  const {
    results,
    isConverting,
    error,
    handleFiles,
    downloadAllAsZip,
    downloadAllAsPDF,
    isGeneratingZip,
    isGeneratingPDF,
    resetConverter
  } = useAnyFileToImageConverter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files), outputFormat);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files), outputFormat);
    }
  };

  const formatOptions = [
    { value: 'jpg', label: 'JPG', icon: <Image className="w-4 h-4" /> },
    { value: 'jpeg', label: 'JPEG', icon: <Image className="w-4 h-4" /> },
    { value: 'png', label: 'PNG', icon: <Image className="w-4 h-4" /> },
    { value: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <ToolLayout
      title="Any File Converter"
      description="Convert PDF, JPG, PNG and other formats easily. Choose your output format and get high-quality results instantly."
      icon={<Zap className="w-10 h-10 text-purple-600" />}
    >
      <div className="space-y-8">

        {/* Configuration Bar */}
        <div className="flex items-center justify-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="text-gray-700 font-medium flex items-center">
            <Settings className="w-4 h-4 mr-2" /> Output Format:
          </span>
          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setOutputFormat(option.value as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${outputFormat === option.value
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div className="max-w-3xl mx-auto">
          <FileDropzone
            isDragging={dragActive}
            isConverting={isConverting}
            progress={null}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileInput={handleFileInput}
            mode="any-to-image"
          />
        </div>

        {/* Results Area */}
        {results.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <File className="w-5 h-5 mr-2 text-purple-600" />
                Converted Files ({results.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetConverter} className="items-center">
                  Convert More
                </Button>
                <Button onClick={downloadAllAsZip} disabled={isGeneratingZip} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {isGeneratingZip ? 'Zipping...' : <><FolderDown className="w-4 h-4 mr-2" /> Download All (ZIP)</>}
                </Button>
                {outputFormat !== 'pdf' && (
                  <Button onClick={downloadAllAsPDF} disabled={isGeneratingPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isGeneratingPDF ? 'Merging...' : <><FileDown className="w-4 h-4 mr-2" /> Merge to PDF</>}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="bg-gray-100 p-3 rounded-lg mr-4">
                    {result.type === 'pdf' ? <FileText className="w-6 h-6 text-red-500" /> : <Image className="w-6 h-6 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-gray-900 truncate" title={result.fileName}>{result.fileName}</p>
                    <span className="text-xs text-gray-500 uppercase px-2 py-0.5 bg-gray-100 rounded-full">{result.type}</span>
                  </div>
                  <a
                    href={result.downloadUrl}
                    download={result.fileName}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default AnyToImageTools;