import React, { useRef, useState } from "react";
import { usePDFSplitter } from "../hooks/usePDFSplitter";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

const SplitPDFTools = () => {
  const { handleSplit, resultFiles, loading } = usePDFSplitter();
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState("");
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFile = () => {
    setFile(null);
    setRanges("");
    setPageImages([]);
    setPageCount(0);
    fileInputRef.current!.value = "";
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      const thumbnails: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        thumbnails.push(canvas.toDataURL());
      }

      setPageImages(thumbnails);
    }
  };

  const onSplit = () => {
    if (!file) return alert("Please upload a PDF file first.");
    if (!ranges.trim()) return alert("Please enter page ranges.");
    handleSplit(file, ranges.trim());
  };

  return (
    <div className="p-6 border rounded-xl shadow-xl max-w-4xl mx-auto bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Split PDF</h2>

      {/* File Upload */}
      <div className="mb-5">
        <label className="block font-medium mb-1 text-gray-700">Upload PDF:</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="block w-full p-2 text-sm text-gray-800 border rounded-lg bg-gray-50 border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>
              <strong>Selected:</strong> {file.name} | <strong>Pages:</strong> {pageCount}
            </span>
            <button onClick={resetFile} className="text-red-600 underline text-xs">
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Page Range Input */}
      <div className="mb-6">
        <label className="block font-medium mb-1 text-gray-700">Page Ranges:</label>
        <input
          type="text"
          placeholder="e.g. 1-3,5,8-10"
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter pages or ranges separated by commas (e.g. <code>1-3,5,7-8</code>)
        </p>
      </div>

      {/* Split Button */}
      <button
        onClick={onSplit}
        disabled={loading || !file || !ranges}
        className={`w-full py-2 px-4 text-white font-semibold rounded-md transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Splitting..." : "Split PDF"}
      </button>

      {/* Thumbnails */}
      {pageImages.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Page Previews:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pageImages.map((src, index) => (
              <div key={index} className="border rounded p-2 bg-gray-50 shadow-sm">
                <img src={src} alt={`Page ${index + 1}`} className="w-full h-auto rounded" />
                <p className="text-center text-xs text-gray-600 mt-1">Page {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Links */}
      {resultFiles.length > 0 && (
        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Download Split Files:</h3>
          <ul className="space-y-2">
            {resultFiles.map((blob, index) => (
              <li key={index}>
                <a
                  href={URL.createObjectURL(blob)}
                  download={`split-part-${index + 1}.pdf`}
                  className="text-blue-600 underline hover:text-blue-800 text-sm"
                >
                  Download Part {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SplitPDFTools;
