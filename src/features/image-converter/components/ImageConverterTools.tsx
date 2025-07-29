import { useState } from 'react';
import { useImageConverter } from '../hooks/useImageConverter';

export default function ImageConverterTools() {
  const { convertImage, convertedFile, error } = useImageConverter();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [outputName, setOutputName] = useState('');
  const [quality, setQuality] = useState(0.95);
  const [maxWidth, setMaxWidth] = useState(0);
  const [preserveMetadata, setPreserveMetadata] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleConvert = async () => {
    if (file) {
      await convertImage({
        file,
        targetFormat: format,
        outputName,
        quality,
        maxWidth,
        preserveMetadata
      });
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-sm space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800">Professional Image Converter</h2>
      
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Source Image</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">Convert to</label>
          <select
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            Quality: {Math.round(quality * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full"
            disabled={format === 'png'}
          />
          {format === 'png' && (
            <p className="text-sm text-gray-500">PNG uses lossless compression</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            Max Width (px): {maxWidth || 'Original'}
          </label>
          <input
            type="range"
            min="0"
            max="3840"
            step="100"
            value={maxWidth}
            onChange={(e) => setMaxWidth(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700">Metadata</label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={preserveMetadata}
              onChange={(e) => setPreserveMetadata(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="ml-2 text-gray-700">Preserve EXIF data</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Output Filename</label>
        <input
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Output filename (optional)"
          value={outputName}
          onChange={(e) => setOutputName(e.target.value)}
        />
      </div>

      <button
        onClick={handleConvert}
        disabled={!file}
        className={`px-6 py-3 font-medium rounded-md w-full ${
          file 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90 transition-opacity'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {file ? 'Convert Image' : 'Select an image first'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {convertedFile && (
        <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-md">
          <h3 className="font-medium text-green-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Conversion Complete!
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-gray-700">
              {convertedFile.name} ({Math.round(convertedFile.size / 1024)} KB)
            </span>
            <a
              href={URL.createObjectURL(convertedFile)}
              download={convertedFile.name}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}