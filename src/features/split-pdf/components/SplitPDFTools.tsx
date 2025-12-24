import React, { useRef, useState } from "react";
import { usePDFSplitter } from "../hooks/usePDFSplitter";
import * as pdfjsLib from "pdfjs-dist";
import { ToolLayout } from "../../../components/layout/ToolLayout";
import { FilePieChart, Scissors, FileDown, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { FileDropzone } from "../../../components/common/FileDropzone";

// Configure PDF worker
// @ts-ignore
const pdfjs = (pdfjsLib as any).default || pdfjsLib;
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

const SplitPDFTools = () => {
  const { handleSplit, resultFiles, loading } = usePDFSplitter();
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState("");
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetFile = () => {
    setFile(null);
    setRanges("");
    setPageImages([]);
    setPageCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();

    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    setPageCount(pdf.numPages);
    const thumbnails: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 }); // Smaller scale for thumbnails
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        thumbnails.push(canvas.toDataURL());
      } catch (e) {
        console.error("Error rendering page", i, e);
      }
    }
    setPageImages(thumbnails);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

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
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      processFile(selectedFile);
    } else {
      alert("Please drop a valid PDF file.");
    }
  };


  const onSplit = () => {
    if (!file) return;
    if (!ranges.trim()) return alert("Please enter page ranges.");
    handleSplit(file, ranges.trim());
  };

  return (
    <ToolLayout
      title="Split PDF Document"
      description="Extract specific pages or split your PDF into multiple documents. Visual page preview makes it easy to select exactly what you need."
      icon={<FilePieChart className="w-10 h-10 text-orange-500" />}
    >
      <div className="space-y-8">

        {/* Upload Section */}
        {!file ? (
          <div className="max-w-3xl mx-auto">
            <FileDropzone
              isDragging={isDragging}
              isConverting={false}
              progress={null}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileInput={onFileChange}
              mode="pdf-to-image" // Reusing styling
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* File Info Bar */}
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div>
                <p className="font-semibold text-blue-900">{file.name}</p>
                <p className="text-sm text-blue-600">{pageCount} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="outline" onClick={resetFile} className="text-red-600 hover:bg-red-50 border-red-200">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>

            {/* Split Configuration */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Controls */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <label className="block font-semibold text-gray-700 mb-2">Page Ranges</label>
                  <input
                    type="text"
                    placeholder="e.g. 1-3, 5, 8-10"
                    value={ranges}
                    onChange={(e) => setRanges(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Enter single page numbers or ranges separated by commas.<br />
                    Example: <strong>1, 3-5, 10</strong>
                  </p>

                  <Button
                    onClick={onSplit}
                    disabled={loading || !ranges}
                    className={`w-full mt-6 py-3 font-semibold rounded-lg shadow-md transition-all
                                    ${loading || !ranges
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                      }
                                `}
                  >
                    {loading ? "Splitting..." : (
                      <span className="flex items-center justify-center">
                        Split PDF <Scissors className="w-4 h-4 ml-2" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Previews */}
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-700 mb-4">Page Previews</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {pageImages.map((src, index) => (
                    <div key={index} className="relative group">
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-gray-50">
                        <img src={src} alt={`Page ${index + 1}`} className="w-full h-auto object-contain" />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                      <div
                        className="absolute inset-0 bg-orange-500/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center rounded-lg"
                        onClick={() => {
                          // Helper to click-add ranges could be added here
                          setRanges(prev => prev ? `${prev},${index + 1}` : `${index + 1}`);
                        }}
                      >
                        <span className="bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full shadow">Add</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            {resultFiles.length > 0 && (
              <div className="mt-8 border-t pt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <FileDown className="w-6 h-6 mr-2 text-green-600" />
                  Download Extracted Files
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resultFiles.map((blob, index) => (
                    <a
                      key={index}
                      href={URL.createObjectURL(blob)}
                      download={`split-part-${index + 1}.pdf`}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
                    >
                      <div className="bg-orange-100 p-3 rounded-lg mr-4 group-hover:bg-orange-200 transition-colors">
                        <FilePieChart className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">Split Part {index + 1}</p>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                      <FileDown className="w-5 h-5 text-gray-400 group-hover:text-orange-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SplitPDFTools;
