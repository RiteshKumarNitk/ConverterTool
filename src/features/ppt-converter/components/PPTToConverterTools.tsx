import React, { useRef, useState } from "react";

const PPTToConverterTools = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"jpeg" | "pdf">("jpeg");
  const [loading, setLoading] = useState(false);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResultUrls([]);
    }
  };

  const reset = () => {
    setFile(null);
    setResultUrls([]);
    fileInputRef.current!.value = "";
  };

  const simulateConversion = () => {
    if (!file) return alert("Please upload a PPTX file first");
    setLoading(true);

    setTimeout(() => {
      // Simulate fake download blobs
      const urls = Array.from({ length: 3 }).map((_, i) =>
        format === "jpeg"
          ? `https://via.placeholder.com/600x400?text=Slide+${i + 1}`
          : URL.createObjectURL(new Blob([`Fake PDF part ${i + 1}`], { type: "application/pdf" }))
      );
      setResultUrls(urls);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Convert PPT to JPEG or PDF</h2>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Upload PPT or PPTX File:</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ppt,.pptx"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-md bg-gray-50"
        />
        {file && (
          <p className="text-sm mt-2 text-gray-600">
            Selected: {file.name}{" "}
            <button onClick={reset} className="text-red-500 ml-2 underline text-xs">
              Remove
            </button>
          </p>
        )}
      </div>

      {/* Format Select */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Choose Output Format:</label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="jpeg"
              checked={format === "jpeg"}
              onChange={() => setFormat("jpeg")}
            />
            <span>JPEG</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="pdf"
              checked={format === "pdf"}
              onChange={() => setFormat("pdf")}
            />
            <span>PDF</span>
          </label>
        </div>
      </div>

      {/* Convert Button */}
      <button
        onClick={simulateConversion}
        disabled={loading || !file}
        className={`w-full py-2 px-4 rounded-md font-semibold text-white transition ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Converting..." : "Convert"}
      </button>

      {/* Results */}
      {resultUrls.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">
            Download {format === "jpeg" ? "Slides" : "PDF File"}:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {resultUrls.map((url, idx) =>
              format === "jpeg" ? (
                <div key={idx} className="border rounded p-2">
                  <img src={url} alt={`Slide ${idx + 1}`} className="rounded w-full" />
                  <a
                    href={url}
                    download={`slide-${idx + 1}.jpeg`}
                    className="block mt-2 text-blue-600 text-sm underline"
                  >
                    Download Slide {idx + 1}
                  </a>
                </div>
              ) : (
                <a
                  key={idx}
                  href={url}
                  download={`slides-part-${idx + 1}.pdf`}
                  className="text-blue-600 underline text-sm block"
                >
                  Download Part {idx + 1}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PPTToConverterTools;
