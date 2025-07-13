import { useState } from "react";

type OutputFormat = "jpeg" | "pdf";

export const usePPTConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [loading, setLoading] = useState(false);
  const [resultUrls, setResultUrls] = useState<string[]>([]);

  const reset = () => {
    setFile(null);
    setResultUrls([]);
  };

  const simulateConversion = () => {
    if (!file) return alert("Please select a PPT file first.");
    setLoading(true);

    // Simulate delay (2 sec)
    setTimeout(() => {
      const fakeUrls = Array.from({ length: 3 }).map((_, i) =>
        format === "jpeg"
          ? `https://via.placeholder.com/600x400?text=Slide+${i + 1}`
          : URL.createObjectURL(
              new Blob([`PDF Slide Part ${i + 1}`], { type: "application/pdf" })
            )
      );

      setResultUrls(fakeUrls);
      setLoading(false);
    }, 2000);
    // Instead of setTimeout...
    // const formData = new FormData();
    // formData.append("file", file);
    // formData.append("format", format);

    // const response = await fetch("/api/convert-ppt", {
    //   method: "POST",
    //   body: formData,
    // });

    // const urls = await response.json();
    // setResultUrls(urls);
  };

  return {
    file,
    setFile,
    format,
    setFormat,
    loading,
    resultUrls,
    simulateConversion,
    reset,
  };
};
