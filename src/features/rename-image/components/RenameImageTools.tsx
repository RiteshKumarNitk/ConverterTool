import React, { useState } from 'react';
import { useRenameImage } from '../hooks/useRenameImage';
import { ToolLayout } from '../../../components/layout/ToolLayout';
import { FileSignature, Download, FolderDown, Type, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/common/FileDropzone';

const RenameImageTools: React.FC = () => {
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [renamedFiles, setRenamedFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState('profile-');
  const [dragActive, setDragActive] = useState(false);
  const { stripPrefixFromImages, downloadAllAsZip } = useRenameImage();

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
      const files = Array.from(e.dataTransfer.files);
      setOriginalFiles(files);
      renameWithPrefix(prefix, files);
    }
  };

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

  const clearAll = () => {
    setOriginalFiles([]);
    setRenamedFiles([]);
    setPrefix('profile-');
  }

  return (
    <ToolLayout
      title="Rename Images"
      description="Batch rename your image files by stripping common prefixes. Useful for organizing files downloaded from social media/bulk sources."
      icon={<FileSignature className="w-10 h-10 text-pink-600" />}
    >
      <div className="space-y-8">

        {originalFiles.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <FileDropzone
              isDragging={dragActive}
              isConverting={false}
              progress={null}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileInput={handleFileChange}
              mode="any-to-image" // Reuse style
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Configuration */}
            <div className="bg-pink-50 p-6 rounded-xl border border-pink-100 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-pink-900 mb-2 flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Prefix to Remove
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => handlePrefixChange(e.target.value)}
                    className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none pl-10"
                    placeholder="e.g., profile-, IMG_"
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400 font-mono text-sm">
                    Abc
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={clearAll} className="text-red-500 hover:bg-red-50 border-red-200">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3 text-center border-b pb-2">Original Filenames</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {originalFiles.map((f, i) => (
                    <li key={i} className="text-sm text-gray-500 truncate px-2 py-1 hover:bg-gray-50 rounded">
                      {f.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border-2 border-green-100 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-green-700 mb-3 text-center border-b border-green-100 pb-2">New Filenames</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {renamedFiles.map((f, i) => (
                    <li key={i} className="text-sm text-gray-800 font-medium truncate px-2 py-1 bg-green-50 rounded flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {f.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button onClick={downloadIndividually} variant="outline" className="border-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Download Individually
              </Button>
              <Button onClick={() => downloadAllAsZip(renamedFiles)} className="bg-pink-600 hover:bg-pink-700 text-white">
                <FolderDown className="w-4 h-4 mr-2" />
                Download as ZIP
              </Button>
            </div>

          </div>
        )}

      </div>
    </ToolLayout>
  );
};

export default RenameImageTools;
