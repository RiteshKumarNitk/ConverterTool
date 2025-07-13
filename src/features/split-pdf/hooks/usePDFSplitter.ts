import { useState } from "react";
import { splitPDF } from "../../../utils/pdfUtils";

export function usePDFSplitter() {
  const [loading, setLoading] = useState(false);
  const [resultFiles, setResultFiles] = useState<Blob[]>([]);

  const handleSplit = async (file: File, pageRanges: string) => {
    setLoading(true);
    try {
      const splittedFiles = await splitPDF(file, pageRanges);
      setResultFiles(splittedFiles);
    } catch (error) {
      console.error("Error splitting PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleSplit, resultFiles, loading };
}
