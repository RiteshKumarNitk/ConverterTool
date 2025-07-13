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
    targetSizeMB,
    setTargetSizeMB,
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

      {/* Target size input */}
      <div className="mb-4">
        <label className="block font-medium text-sm text-gray-700 mb-1">
          Target Size (MB):
        </label>
        <input
          type="number"
          value={targetSizeMB}
          onChange={(e) => setTargetSizeMB(parseFloat(e.target.value))}
          min={0.1}
          max={10}
          step={0.1}
          className="w-32 border p-2 rounded-md text-sm"
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleCompression}
          disabled={loading || files.length === 0}
          className={`py-2 px-4 rounded font-semibold text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Compressing..." : "Compress"}
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
      </div>

      {/* Size comparison */}
      {compressedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">File Size Comparison:</h3>
          <ul className="text-sm space-y-2">
            {files.map((file, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{file.name}</span>
                <span>
                  {(file.size / 1024 / 1024).toFixed(2)} MB →{" "}
                  {(compressedFiles[idx].size / 1024 / 1024).toFixed(2)} MB
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
