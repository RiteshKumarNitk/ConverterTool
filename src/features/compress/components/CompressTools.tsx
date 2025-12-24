import React, { useRef, useState } from "react";
import { useCompressor } from "../hooks/useCompressor";
import { ToolLayout } from "../../../components/layout/ToolLayout";
import { Minimize2, Download, Trash2, Sliders } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { FileDropzone } from "../../../components/common/FileDropzone";

const CompressTools = () => {
  const {
    files,
    compressedFiles,
    handleFileUpload,
    handleCompression,
    downloadZip,
    reset,
    loading,
    compressionLevel,
    setCompressionLevel,
    progress,
    timeTaken
  } = useCompressor();

  const [isDragging, setIsDragging] = useState(false);

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
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };


  return (
    <ToolLayout
      title="Compress PDF & Images"
      description="Reduce file size while maintaining quality. Choose your compression level for optimal results."
      icon={<Minimize2 className="w-10 h-10 text-indigo-600" />}
    >
      <div className="space-y-8">

        {/* Upload Area - Show if no files or if we want to allow adding more (but logic seems to handle 'files' state) */}
        {files.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <FileDropzone
              isDragging={isDragging}
              isConverting={loading}
              progress={null}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileInput={handleFileInput}
              mode="any-to-image" // Reusing generic styling
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Configuration Panel */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Sliders className="w-5 h-5 text-indigo-700 mr-2" />
                <h3 className="font-semibold text-indigo-900">Compression Settings</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setCompressionLevel(level)}
                    className={`
                                py-3 px-4 rounded-lg font-medium border-2 transition-all text-center
                                ${compressionLevel === level
                        ? 'border-indigo-600 bg-white text-indigo-700 shadow-md ring-2 ring-indigo-200'
                        : 'border-transparent bg-white/50 text-gray-600 hover:bg-white hover:border-indigo-200'
                      }
                            `}
                  >
                    <div className="capitalize text-lg">{level}</div>
                    <div className="text-xs text-gray-400 font-normal mt-1">
                      {level === 'low' ? 'Smallest Size' : level === 'medium' ? 'Balanced' : 'Best Quality'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end mt-6 gap-3">
                <Button variant="outline" onClick={reset} className="text-red-600 hover:bg-red-50 border-red-200">
                  Clear All
                </Button>
                <Button onClick={handleCompression} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                  {loading ? 'Compressing...' : 'Compress Now'}
                </Button>
              </div>
            </div>

            {/* Results & Comparison */}
            {compressedFiles.length > 0 && (
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Compression Results</h3>
                  {timeTaken && <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Time: {timeTaken}</span>}
                </div>
                <div className="divide-y">
                  {files.map((file, idx) => {
                    const compressedVar = compressedFiles[idx];
                    if (!compressedVar) return null;
                    const isSmaller = compressedVar.size < file.size;
                    const reduction = isSmaller ? ((file.size - compressedVar.size) / file.size * 100).toFixed(0) : 0;

                    return (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="min-w-0 flex-1 pr-4">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <div className="flex items-center space-x-2 text-sm mt-1">
                            <span className="text-gray-500 line-through">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span className="text-gray-400">→</span>
                            <span className={isSmaller ? "text-green-600 font-bold" : "text-gray-700"}>
                              {(compressedVar.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {isSmaller && (
                              <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">
                                -{reduction}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                  <Button onClick={downloadZip} className="bg-green-600 hover:bg-green-700 text-white">
                    <Download className="w-4 h-4 mr-2" /> Download All (ZIP)
                  </Button>
                </div>
              </div>
            )}

            {loading && progress && (
              <div className="text-center p-8">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-indigo-900 font-medium">{progress}</p>
              </div>
            )}

          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CompressTools;
