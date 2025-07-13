import React, { useState } from 'react';
import { useFilterWithName } from '../hooks/useFilterWithName';
import { Download, FolderDown, Trash2 } from 'lucide-react';

const FilterDataWithName: React.FC = () => {
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg');
  const {
    results,
    isConverting,
    error,
    handleFiles,
    downloadAllAsZip,
    downloadSelectedAsZip,
    removeFile,
  } = useFilterWithName();

  const [dragActive, setDragActive] = useState(false);
  const [selectedNames, setSelectedNames] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files), outputFormat);
    }
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles((prev) => {
      const updated = new Set(prev);
      updated.has(fileName) ? updated.delete(fileName) : updated.add(fileName);
      return updated;
    });
  };

  const handleDownloadSelected = () => {
    const namesFromTextarea = selectedNames
      .split(',')
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);
    const combined = new Set([...Array.from(selectedFiles), ...namesFromTextarea]);
    downloadSelectedAsZip(Array.from(combined).join(','));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Convert PDF/JPG/PNG to JPEG or PNG
      </h2>

      <div
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-6 rounded-md text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <p className="text-gray-600">Drag & drop files here or select manually</p>
        <div className="flex items-center gap-3 mt-4">
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files) handleFiles(Array.from(e.target.files), outputFormat);
            }}
            className="file-input file-input-bordered file-input-md w-full"
          />
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png')}
            className="select select-bordered"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>

      {isConverting && <p className="text-blue-600">Converting files...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Download Converted Images</h3>

          <textarea
            placeholder="Enter comma-separated image names (e.g. 2.jpeg, 5.jpeg)"
            value={selectedNames}
            onChange={(e) => setSelectedNames(e.target.value)}
            className="w-full border rounded-md p-2"
          />

          <div className="max-h-64 overflow-y-auto border rounded-md p-2">
            <ul className="space-y-2">
              {results.map((res, index) => (
                <li key={index} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(res.fileName)}
                      onChange={() => toggleFileSelection(res.fileName)}
                    />
                    <span className="truncate">{res.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={res.downloadUrl}
                      download={res.fileName}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </a>
                    <button
                      onClick={() => removeFile(res.fileName)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={handleDownloadSelected}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <FolderDown className="w-4 h-4 mr-2" /> Download Selected as ZIP
            </button>

            <button
              onClick={downloadAllAsZip}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <FolderDown className="w-4 h-4 mr-2" /> Download All as ZIP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDataWithName;
