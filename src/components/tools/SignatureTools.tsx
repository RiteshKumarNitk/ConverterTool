import React, { useState } from 'react';
import { PenTool, FileCheck, Loader2, X, AlertTriangle, CheckCircle, ArrowDownToLine, KeyRound, Upload } from 'lucide-react';
import { ToolLayout } from '../layout/ToolLayout';
import { FileDropzone } from '../common/FileDropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { signPdfDocument, signPdfWithGeneratedCert } from '../../utils/digital-signature';

// Ensure worker is configured
import '../../utils/pdf-worker';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  isSigned: boolean | null; // null = checking, true = signed, false = unsigned
  pageCount: number;
}

export const SignatureTools: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Signing State
  const [signMode, setSignMode] = useState<'auto' | 'p12'>('auto'); // Default to Auto
  const [p12File, setP12File] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [signStatus, setSignStatus] = useState<string>('');

  // Function to check for signatures
  const checkSignature = async (file: File): Promise<boolean> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use standard loading task
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@5.3.93/cmaps/',
        cMapPacked: true,
      });
      const pdf = await loadingTask.promise;

      let hasSignature = false;

      // Iterate pages for Annotations
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const annotations = await page.getAnnotations();

        for (const annotation of annotations) {
          // Standard Digital Signature: Widget with FT: Sig
          if (annotation.subtype === 'Widget' && (annotation.fieldType === 'Sig')) {
            hasSignature = true;
            break;
          }

          // Heuristic: Check for 'Signature' in field name if type is missing or generic
          if (annotation.fieldName && annotation.fieldName.toLowerCase().includes('signature')) {
            hasSignature = true;
            break;
          }
        }
        if (hasSignature) break;
      }

      return hasSignature;
    } catch (error) {
      console.error("Error checking signature for file:", file.name, error);
      return false;
    }
  };

  const processFiles = async (files: File[]) => {
    const newFiles: PdfFile[] = files.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      name: f.name,
      isSigned: null, // Start as checking
      pageCount: 0
    }));

    setPdfFiles(prev => [...prev, ...newFiles]);

    // Process signatures for new files
    for (const pdfFile of newFiles) {
      checkSignature(pdfFile.file).then(isSigned => {
        setPdfFiles(prev => prev.map(p => p.id === pdfFile.id ? { ...p, isSigned } : p));
      });

      // Get page count for display
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      loadingTask.promise.then(pdf => {
        setPdfFiles(prev => prev.map(p => p.id === pdfFile.id ? { ...p, pageCount: pdf.numPages } : p));
      }).catch(console.error);
    }
  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length > 0) {
      processFiles(files);
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      if (files.length > 0) processFiles(files);
    }
  };

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleP12Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setP12File(e.target.files[0]);
    }
  };

  const signDocument = async (pdfFile: PdfFile) => {

    if (signMode === 'p12' && (!p12File || !password)) {
      alert("Please upload a .p12 certificate and enter the password.");
      return;
    }

    setIsSigning(true);
    setSignStatus('Initializing...');

    try {
      const pdfBuffer = await pdfFile.file.arrayBuffer();
      let signedPdfBytes: Uint8Array;

      if (signMode === 'auto') {
        setSignStatus('Generating Digital ID and Signing...');
        signedPdfBytes = await signPdfWithGeneratedCert(pdfBuffer);
      } else {
        setSignStatus('Signing with your ID...');
        if (!p12File) throw new Error("No P12 file");
        const p12Buffer = await p12File.arrayBuffer();
        signedPdfBytes = await signPdfDocument(pdfBuffer, p12Buffer, password);
      }

      // Download
      const blob = new Blob([signedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed-${pdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSignStatus('Signed successfully!');
      setTimeout(() => setSignStatus(''), 3000);
    } catch (e: any) {
      console.error(e);
      alert("Signing failed: " + e.message);
      setSignStatus('Failed.');
    } finally {
      setIsSigning(false);
    }
  };


  return (
    <ToolLayout
      title="Professional Signatures"
      description="View, verify, and manage signed PDF documents. Automatically detects digital signatures in your uploaded files."
      icon={<PenTool className="w-10 h-10 text-rose-600" />}
    >
      <div className="space-y-8 max-w-6xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Upload & List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">1. PDF File</h3>
              <FileDropzone
                isDragging={isDragging}
                isConverting={false}
                progress={null}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileInput={handleFileInput}
                mode="pdf"
                accept=".pdf"
              />
            </div>

            {/* Files List */}
            {pdfFiles.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {pdfFiles.map((pdf) => (
                  <Card key={pdf.id} className="p-4 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow">

                    {/* Preview Thumbnail (First Page) */}
                    <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative">
                      <Document file={pdf.file} className="w-full h-full">
                        <Page
                          pageNumber={1}
                          width={96}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          loading={<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>}
                        />
                      </Document>
                      {/* Badge Overlay */}
                      {pdf.isSigned === true && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white p-1 rounded-full shadow-lg z-10" title="Signed PDF">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate" title={pdf.name}>
                        {pdf.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{pdf.pageCount > 0 ? `${pdf.pageCount} Pages` : 'Loading pages...'}</span>
                        <span>•</span>
                        <span className="uppercase">{pdf.file.size > 1024 * 1024 ? `${(pdf.file.size / (1024 * 1024)).toFixed(2)} MB` : `${(pdf.file.size / 1024).toFixed(2)} KB`}</span>
                      </div>

                      {/* Status Indicator */}
                      <div className="mt-3 flex items-center gap-2">
                        {pdf.isSigned === null ? (
                          <span className="inline-flex items-center text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Verifying signature...
                          </span>
                        ) : pdf.isSigned ? (
                          <span className="inline-flex items-center text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ring-green-600/20">
                            <CheckCircle className="w-3 h-3 mr-1" /> Signature Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <AlertTriangle className="w-3 h-3 mr-1" /> No Signature Found
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={p12File || signMode === 'auto' ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => signDocument(pdf)}
                        disabled={isSigning}
                        className={p12File || signMode === 'auto' ? "" : "text-gray-400"}
                        title="Sign Document"
                      >
                        {isSigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4 mr-1" />}
                        Sign
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => removeFile(pdf.id)} className="text-gray-400 hover:text-red-500" title="Remove">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Signing Controls */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-rose-500" />
                2. Digital Signature
              </h3>

              {/* Mode Switch */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button
                  onClick={() => setSignMode('auto')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${signMode === 'auto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Auto-Generated ID
                </button>
                <button
                  onClick={() => setSignMode('p12')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${signMode === 'p12' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Upload My ID (.p12)
                </button>
              </div>

              {signMode === 'auto' ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">Instant Digital ID</h4>
                        <p className="text-sm text-green-700 mt-1">
                          We will automatically generate a digital certificate for you and sign the document.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Ready to sign. Just click "Sign" on your file.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* P12 Upload UI */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                    <input
                      type="file"
                      accept=".p12,.pfx"
                      onChange={handleP12Upload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center">
                      {p12File ? (
                        <>
                          <FileCheck className="w-8 h-8 text-green-500 mb-2" />
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{p12File.name}</p>
                          <p className="text-xs text-green-600 mt-1">Ready to sign</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Upload .p12 or .pfx file</p>
                          <p className="text-xs text-gray-400 mt-1">Your Digital Certificate</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter password..."
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 leading-relaxed">
                    <p className="font-semibold mb-1">About Digital Signing:</p>
                    To produce a valid "Green Check" signature, you must use a valid Digital ID issued by a trusted Certificate Authority (CA).
                  </div>
                </div>
              )}

              {signStatus && (
                <div className={`mt-4 p-4 rounded-lg text-sm text-center font-medium ${signStatus.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {signStatus}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </ToolLayout>
  );
};