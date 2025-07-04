import React from 'react';
import { ToolType } from './types';
import { Navbar } from './components/layout/Navbar';
import { PdfTools } from './components/tools/PdfTools';
import { ImageTools } from './components/tools/ImageTools';
import { SignatureTools } from './components/tools/SignatureTools';
import { MergeTools } from './components/tools/MergeTools';
import { useMobileDetection } from './hooks/useMobileDetection';

export const App: React.FC = () => {
  const [activeTool, setActiveTool] = React.useState<ToolType>('pdf');
  const isMobile = useMobileDetection();

  const renderTool = () => {
    switch (activeTool) {
      case 'pdf':
        return <PdfTools />;
      case 'image':
        return <ImageTools isMobile={isMobile} />;
      case 'signature':
        return <SignatureTools />;
      case 'merge':
        return <MergeTools />;
      default:
        return <PdfTools />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Navbar activeTool={activeTool} setActiveTool={setActiveTool} />
      
      <div className="container mx-auto px-4 py-8">
        {renderTool()}
      </div>
    </div>
  );
};


// import React, { useState, useCallback, useEffect } from 'react';
// import { Upload, FileImage, FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
// import { convertImageToPDF, convertPDFToImages } from './utils/fileConverter';
// import * as pdfjsLib from 'pdfjs-dist';


// interface ConversionResult {
//   fileName: string;
//   downloadUrl: string;
//   type: 'pdf' | 'image';
// }

// function App() {
//   const [isDragging, setIsDragging] = useState(false);
//   const [isConverting, setIsConverting] = useState(false);
//   const [results, setResults] = useState<ConversionResult[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [conversionWarning, setConversionWarning] = useState<string | null>(null);
//   const [isMobile, setIsMobile] = useState(false);
//   const [progress, setProgress] = useState<{current: number, total: number} | null>(null);

//   // Detect mobile devices
//   useEffect(() => {
//     const checkIfMobile = () => {
//       setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
//     };
//     checkIfMobile();
//     window.addEventListener('resize', checkIfMobile);
//     return () => window.removeEventListener('resize', checkIfMobile);
//   }, []);

//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   }, []);

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//   }, []);

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = Array.from(e.dataTransfer.files);
//     handleFiles(files);
//   }, []);

//   const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     handleFiles(files);
//   }, []);

//   const handleFiles = async (files: File[]) => {
//     if (files.length === 0) return;

//     setIsConverting(true);
//     setError(null);
//     setConversionWarning(null);
//     setResults([]);
//     setProgress(null);

//     try {
//       const newResults: ConversionResult[] = [];
//       let hasLargeFile = false;
//       let totalPages = 0;
//       let processedPages = 0;

//       // Calculate total pages for progress tracking
//       for (const file of files) {
//         if (file.type === 'application/pdf') {
//           const arrayBuffer = await file.arrayBuffer();
//           const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
//           totalPages += pdf.numPages;
//         } else {
//           totalPages += 1; // Each image counts as one
//         }
//       }

//       for (const file of files) {
//         const fileType = file.type;
        
//         if (fileType.startsWith('image/')) {
//           // Convert image to PDF
//           const pdfBlob = await convertImageToPDF(file);
//           const downloadUrl = URL.createObjectURL(pdfBlob);
//           newResults.push({
//             fileName: `${file.name.split('.')[0]}.pdf`,
//             downloadUrl,
//             type: 'pdf'
//           });
          
//           // Update progress
//           processedPages += 1;
//           setProgress({ current: processedPages, total: totalPages });
//         } else if (fileType === 'application/pdf') {
//           // Check file size for PDFs
//           if (file.size > 50 * 1024 * 1024) {
//             hasLargeFile = true;
//             continue;
//           }
          
//           // Convert PDF to images
//           try {
//             const imageBlobs = await convertPDFToImages(file);
//             imageBlobs.forEach((blob, index) => {
//               const downloadUrl = URL.createObjectURL(blob);
//               newResults.push({
//                 fileName: `${file.name.split('.')[0]}_page_${index + 1}.png`,
//                 downloadUrl,
//                 type: 'image'
//               });
              
//               // Update progress
//               processedPages += 1;
//               setProgress({ current: processedPages, total: totalPages });
//             });
//           } catch (err) {
//             setConversionWarning(
//               err instanceof Error ? err.message : 'Conversion failed for this PDF'
//             );
//           }
//         } else {
//           throw new Error(`Unsupported file type: ${fileType}`);
//         }
//       }

//       if (hasLargeFile) {
//         setConversionWarning(
//           'Large PDF files (>50MB) were skipped for performance reasons'
//         );
//       }

//       setResults(newResults);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred during conversion');
//     } finally {
//       setIsConverting(false);
//       setProgress(null);
//     }
//   };

//   const downloadFile = (result: ConversionResult) => {
//     const link = document.createElement('a');
//     link.href = result.downloadUrl;
//     link.download = result.fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const downloadAll = () => {
//     results.forEach(result => downloadFile(result));
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
//             Professional File Converter
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Convert images to PDF or PDF files to high-quality 600 DPI images with e-signature support. 
//             Simply drag and drop your files or click to browse.
//           </p>
//         </div>

//         {/* Upload Area */}
//         <div className="max-w-2xl mx-auto mb-8">
//           <div
//             className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
//               isDragging
//                 ? 'border-blue-400 bg-blue-50 scale-105'
//                 : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
//             } ${isConverting ? 'pointer-events-none opacity-75' : ''}`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             <input
//               type="file"
//               multiple
//               accept="image/*,application/pdf"
//               onChange={handleFileInput}
//               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               disabled={isConverting}
//             />
            
//             <div className="flex flex-col items-center space-y-4">
//               {isConverting ? (
//                 <>
//                   <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
//                   <p className="text-xl font-semibold text-gray-700">Converting files...</p>
//                   <p className="text-sm text-gray-500">
//                     Processing high-quality images - this may take a moment
//                   </p>
//                   {progress && (
//                     <div className="w-full bg-gray-200 rounded-full h-2.5">
//                       <div 
//                         className="bg-blue-600 h-2.5 rounded-full" 
//                         style={{ width: `${(progress.current / progress.total) * 100}%` }}
//                       ></div>
//                     </div>
//                   )}
//                   <p className="text-sm text-gray-500">
//                     {progress ? `Processing page ${progress.current} of ${progress.total}` : 'Starting conversion...'}
//                   </p>
//                 </>
//               ) : (
//                 <>
//                   <div className="flex space-x-4 mb-4">
//                     <div className="p-3 bg-blue-100 rounded-full">
//                       <FileImage className="w-8 h-8 text-blue-600" />
//                     </div>
//                     <div className="p-3 bg-emerald-100 rounded-full">
//                       <FileText className="w-8 h-8 text-emerald-600" />
//                     </div>
//                   </div>
//                   <Upload className="w-12 h-12 text-gray-400 mb-4" />
//                   <p className="text-xl font-semibold text-gray-700">
//                     Drop files here or click to browse
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Supports: JPG, PNG, GIF, WebP → PDF | PDF → PNG Images (600 DPI)
//                   </p>
//                   <p className="text-xs text-gray-400 mt-2">
//                     E-signatures are preserved in PDF to PNG conversions
//                   </p>
//                 </>
//               )}
//             </div>
//           </div>
          
//           {error && (
//             <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
//               <AlertCircle className="w-6 h-6 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
//               <p className="text-red-700 font-medium">{error}</p>
//             </div>
//           )}

//           {conversionWarning && (
//             <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
//               <AlertCircle className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
//               <p className="text-yellow-700 font-medium">{conversionWarning}</p>
//             </div>
//           )}

//           {isMobile && (
//             <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
//               <AlertCircle className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
//               <p className="text-blue-700">
//                 For best results with large files, use a desktop browser
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Results */}
//         {results.length > 0 && (
//           <div className="max-w-4xl mx-auto">
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//               <div className="flex items-center space-x-2">
//                 <CheckCircle className="w-6 h-6 text-green-500" />
//                 <h2 className="text-2xl font-bold text-gray-800">
//                   Conversion Complete
//                 </h2>
//               </div>
//               {results.length > 1 && (
//                 <button
//                   onClick={downloadAll}
//                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
//                 >
//                   <Download className="w-5 h-5" />
//                   <span>Download All</span>
//                 </button>
//               )}
//             </div>

//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//               {results.map((result, index) => (
//                 <div
//                   key={index}
//                   className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
//                 >
//                   <div className="flex items-center space-x-3 mb-4">
//                     {result.type === 'pdf' ? (
//                       <div className="p-2 bg-red-100 rounded-lg">
//                         <FileText className="w-6 h-6 text-red-600" />
//                       </div>
//                     ) : (
//                       <div className="p-2 bg-blue-100 rounded-lg">
//                         <FileImage className="w-6 h-6 text-blue-600" />
//                       </div>
//                     )}
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-gray-900 truncate">
//                         {result.fileName}
//                       </p>
//                       <p className="text-xs text-gray-500 capitalize">
//                         {result.type} file
//                       </p>
//                     </div>
//                   </div>
                  
//                   <button
//                     onClick={() => downloadFile(result)}
//                     className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
//                   >
//                     <Download className="w-4 h-4" />
//                     <span>Download</span>
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Features */}
//         <div className="max-w-4xl mx-auto mt-16">
//           <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
//             Why Choose Our Converter?
//           </h3>
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="text-center p-6 bg-white rounded-xl shadow-sm">
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Upload className="w-6 h-6 text-blue-600" />
//               </div>
//               <h4 className="text-lg font-semibold text-gray-800 mb-2">E-Signature Support</h4>
//               <p className="text-gray-600">
//                 Preserves digital signatures when converting PDFs to images.
//               </p>
//             </div>
            
//             <div className="text-center p-6 bg-white rounded-xl shadow-sm">
//               <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <CheckCircle className="w-6 h-6 text-emerald-600" />
//               </div>
//               <h4 className="text-lg font-semibold text-gray-800 mb-2">Professional Quality</h4>
//               <p className="text-gray-600">
//                 600 DPI resolution for crystal-clear document conversions.
//               </p>
//             </div>
            
//             <div className="text-center p-6 bg-white rounded-xl shadow-sm">
//               <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Download className="w-6 h-6 text-purple-600" />
//               </div>
//               <h4 className="text-lg font-semibold text-gray-800 mb-2">Instant Download</h4>
//               <p className="text-gray-600">
//                 Get your converted files immediately with one-click downloads.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;