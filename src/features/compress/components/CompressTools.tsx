import React, { useRef } from "react";
import { useCompressor } from "../hooks/useCompressor";

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

  const fileDropRef = useRef<HTMLDivElement>(null);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    handleFileUpload(droppedFiles);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Compress PDF & Image Files
      </h2>

      {/* Drop zone */}
      <div
        ref={fileDropRef}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center text-gray-600 mb-4 hover:bg-blue-50"
      >
        Drag & drop files here or{" "}
        <label className="text-blue-600 underline cursor-pointer">
          browse
          <input
            type="file"
            multiple
            hidden
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload(e.target.files!)}
          />
        </label>
      </div>

      {/* Compression Level Selection */}
      <div className="mb-6">
        <label className="block font-medium text-sm text-gray-700 mb-2">
          Compression Mode:
        </label>
        <div className="flex space-x-4">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setCompressionLevel(level)}
              className={`flex-1 py-3 px-4 rounded-lg capitalize font-medium border-2 transition-all ${compressionLevel === level
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {level}
              <span className="block text-xs text-gray-500 font-normal mt-1">
                {level === 'low' ? 'Smallest File' : level === 'medium' ? 'Standard' : 'High Quality'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      {loading && progress && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm font-medium animate-pulse text-center">
          {progress}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button
          onClick={handleCompression}
          disabled={loading || files.length === 0}
          className={`py-2 px-4 rounded font-semibold text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Processing..." : "Compress Files"}
        </button>
        {compressedFiles.length > 0 && (
          <button
            onClick={downloadZip}
            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
          >
            Download ZIP
          </button>
        )}
        <button
          onClick={reset}
          className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded font-semibold"
        >
          Clear
        </button>

        {timeTaken && (
          <span className="text-gray-500 text-sm font-medium ml-auto">
            Finished in: {timeTaken}
          </span>
        )}
      </div>

      {/* Size comparison */}
      {compressedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">File Size Comparison:</h3>
          <ul className="text-sm space-y-2">
            {files.map((file, idx) => (
              <li key={idx} className="flex justify-between border-b pb-1">
                <span>{file.name}</span>
                <span className={compressedFiles[idx].size < file.size ? "text-green-600 font-bold" : "text-gray-600"}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB →{" "}
                  {(compressedFiles[idx].size / 1024 / 1024).toFixed(2)} MB
                  {compressedFiles[idx].size >= file.size && " (No reduction)"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompressTools;
