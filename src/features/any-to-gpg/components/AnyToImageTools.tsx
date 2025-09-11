import React, { useState } from 'react';
import { useAnyFileToImageConverter } from '../hooks/useAnyFileToImageConverter';
import { Download, FolderDown, FileDown, Upload, File, Image, FileText, ChevronDown, AlertCircle } from 'lucide-react';

const AnyToImageTools: React.FC = () => {
  // State for UI controls
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'pdf'>('jpeg');
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  
  // Conversion hook
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

  // File handling
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files), outputFormat);
      setActiveTab('results');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files), outputFormat);
      setActiveTab('results');
    }
  };

  // Format selection with icons
  const formatOptions = [
     { value: 'jpg', label: 'JPG', icon: <Image className="w-4 h-4" /> },
    { value: 'jpeg', label: 'JPEG', icon: <Image className="w-4 h-4" /> },
    { value: 'png', label: 'PNG', icon: <Image className="w-4 h-4" /> },
    { value: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header with clear title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">File Format Converter</h1>
        <p className="text-gray-600">
          Convert between PDF, JPG, PNG files with high quality output
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="w-5 h-5" /> Upload Files
        </button>
        {results.length > 0 && (
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'results' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('results')}
          >
            <File className="w-5 h-5" /> Results ({results.length})
          </button>
        )}
      </div>

      {/* Main content area */}
      <div className="space-y-6">
        {activeTab === 'upload' ? (
          <div className="space-y-6">
            {/* File upload area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">
                    Drag & drop files here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: PDF, JPG, PNG
                  </p>
                </div>
                <label className="cursor-pointer mt-4">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition inline-flex items-center">
                    Select Files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </span>
                </label>
              </div>
            </div>

            {/* Format selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FileDown className="w-5 h-5" /> Output Format
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOutputFormat(option.value as any)}
                    className={`p-3 rounded-md border flex items-center justify-center gap-2 ${outputFormat === option.value ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <File className="w-6 h-6" /> Converted Files
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={resetConverter}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition"
                >
                  Convert More
                </button>
              </div>
            </div>

            {/* File list */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-y-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {result.type === 'pdf' ? (
                              <FileText className="flex-shrink-0 h-5 w-5 text-red-500" />
                            ) : (
                              <Image className="flex-shrink-0 h-5 w-5 text-blue-500" />
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{result.fileName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                            {result.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={result.downloadUrl}
                            download={result.fileName}
                            className="text-blue-600 hover:text-blue-900 hover:underline flex items-center justify-end gap-1"
                          >
                            <Download className="w-4 h-4" /> Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bulk actions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Bulk Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={downloadAllAsZip}
                  disabled={isGeneratingZip || isGeneratingPDF}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingZip ? (
                    'Preparing ZIP...'
                  ) : (
                    <>
                      <FolderDown className="w-5 h-5 mr-2" /> Download All as ZIP
                    </>
                  )}
                </button>

                {outputFormat !== 'pdf' && (
                  <button
                    onClick={downloadAllAsPDF}
                    disabled={isGeneratingZip || isGeneratingPDF}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPDF ? (
                      'Merging PDF...'
                    ) : (
                      <>
                        <FileDown className="w-5 h-5 mr-2" /> Merge to Single PDF
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status messages */}
        {isConverting && (
          <div className="p-4 bg-blue-50 text-blue-700 rounded-md flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            Converting files... Please wait
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnyToImageTools;