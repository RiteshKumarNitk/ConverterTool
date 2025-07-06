import React, { useState } from 'react';
import { useRenameImage } from '../hooks/useRenameImage';
import { Download, FolderDown, ImagePlus, ArrowSwitch } from 'lucide-react';

const RemovePrefixTools: React.FC = () => {
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [renamedFiles, setRenamedFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState('profile-');
  const [activeTool, setActiveTool] = useState<'remove-prefix' | 'auto-rename'>('remove-prefix');

  const { stripPrefixFromImages, renameImages, downloadAllAsZip } = useRenameImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    setOriginalFiles(files);

    if (activeTool === 'remove-prefix') {
      const stripped = stripPrefixFromImages(files, prefix);
      setRenamedFiles(stripped);
    } else {
      const renamed = renameImages(files);
      setRenamedFiles(renamed);
    }
  };

  const handlePrefixChange = (val: string) => {
    setPrefix(val);
    if (originalFiles.length > 0 && activeTool === 'remove-prefix') {
      const renamed = stripPrefixFromImages(originalFiles, val);
      setRenamedFiles(renamed);
    }
  };

  const downloadIndividually = () => {
    renamedFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-xl p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {activeTool === 'remove-prefix'
                ? '🖼️ Remove Prefix from Image Names'
                : '🖼️ Auto Rename Image Files'}
            </h1>
            <p className="text-sm text-gray-500">
              {activeTool === 'remove-prefix'
                ? 'Upload images and remove a prefix from file names (e.g., profile-123.jpg → 123.jpg).'
                : 'Upload images and rename them automatically in order (image-1.jpg, image-2.jpg, etc.)'}
            </p>
          </div>

          {/* Tool Toggle Button */}
          <button
            onClick={() =>
              setActiveTool((prev) =>
                prev === 'remove-prefix' ? 'auto-rename' : 'remove-prefix'
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
            title="Switch Tool"
          >
            <ArrowSwitch className="w-4 h-4" />
            Switch to {activeTool === 'remove-prefix' ? 'Auto Rename' : 'Remove Prefix'}
          </button>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
          <input
            type="file"
            id="fileInput"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer inline-flex items-center text-blue-600 hover:underline"
          >
            <ImagePlus className="w-5 h-5 mr-2" />
            Click to upload images
          </label>
          <p className="text-xs text-gray-400 mt-1">You can select multiple image files</p>
        </div>

        {/* Prefix Input */}
        {activeTool === 'remove-prefix' && originalFiles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prefix to remove from file names
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => handlePrefixChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., profile-"
            />
          </div>
        )}

        {/* Renamed Files List */}
        {renamedFiles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">📄 Renamed Files</h2>
            <ul className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto text-sm">
              {renamedFiles.map((file, index) => (
                <li key={index} className="text-gray-700 truncate">
                  ✅ <span className="font-medium">{file.name}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadIndividually}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Individually
              </button>

              <button
                onClick={() => downloadAllAsZip(renamedFiles)}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <FolderDown className="w-4 h-4 mr-2" />
                Download as ZIP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemovePrefixTools;
