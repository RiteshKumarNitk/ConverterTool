import React, { useState } from 'react';
import { useRenameImage } from '../hooks/useRenameImage';

const RenameImageTools: React.FC = () => {
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [renamedFiles, setRenamedFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState('profile-');
  const { stripPrefixFromImages, downloadAllAsZip } = useRenameImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    setOriginalFiles(files);
    renameWithPrefix(prefix, files);
  };

  const renameWithPrefix = (prefix: string, files: File[] = originalFiles) => {
    if (!prefix) return;
    const renamed = stripPrefixFromImages(files, prefix);
    setRenamedFiles(renamed);
  };

  const handlePrefixChange = (val: string) => {
    setPrefix(val);
    if (originalFiles.length > 0) renameWithPrefix(val, originalFiles);
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-800">🖼️ Rename Images (Remove Prefix)</h1>
        <p className="text-sm text-gray-500">
          Upload image files and remove a common prefix from filenames (e.g., <code className="bg-gray-100 px-1 rounded">profile-</code>).
        </p>
      </div>

      <div className="border border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-500 transition">
        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="upload" />
        <label htmlFor="upload" className="cursor-pointer text-blue-600 hover:underline font-medium">
          Click to upload images
        </label>
        <p className="text-xs text-gray-400 mt-1">Supports multiple image files</p>
      </div>

      {originalFiles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prefix to remove</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => handlePrefixChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., profile-"
          />
        </div>
      )}

      {renamedFiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">📄 Renamed Files:</h2>
          <ul className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto text-sm space-y-1">
            {renamedFiles.map((file, index) => (
              <li key={index} className="text-gray-700 truncate">
                ✅ <strong>{file.name}</strong>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <div onClick={downloadIndividually}>Download Individually</div>
            <div onClick={() => downloadAllAsZip(renamedFiles)} variant="primary">
              Download as ZIP
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenameImageTools;
