import React from 'react';
// import { Navbar } from './components/layout/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AllTools } from './components/tools/AllTools';
import { Navbar } from './components/layout/Navbar';
import { PdfTools } from './components/tools/PdfTools';
import { ImageTools } from './features/image-to-pdf/components/ImageTools';
import { SignatureTools } from './components/tools/SignatureTools';
import { MergeTools } from './components/tools/MergeTools';
import RenameImageTools from './features/rename-image/components/RenameImageTools';
import SplitPDFTools from './features/split-pdf/components/SplitPDFTools';
import AnyToImageTools from './features/any-to-gpg/components/AnyToImageTools';
import CompressTools from './features/compress/components/CompressTools';

import { useMobileDetection } from './hooks/useMobileDetection';
import QRCodeGenerator from './features/QRCodeGenerator/components/QRCodeGenerator';
import FilterDataWithName from './features/AnyToJpeg/components/FilterDataWithName';
import ImageConverterTools from './features/image-converter/components/ImageConverterTools';
import { PdfEditorPage } from './features/PdfEditorPage/components/PdfEditorPage';
import FontConverterTools from './features/fontconverter/components/FontConverterTools';

export const App: React.FC = () => {
  const isMobile = useMobileDetection();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <Navbar />
        <div className="container mx-auto px-4 pb-8 pt-24">
          <Routes>
            <Route path="/" element={<AllTools />} />
            <Route path="/pdf" element={<PdfTools />} />
            <Route path="/image" element={<ImageTools isMobile={isMobile} />} />
            <Route path="/signature" element={<SignatureTools />} />
            <Route path="/merge" element={<MergeTools />} />
            <Route path="/rename-image" element={<RenameImageTools />} />
            <Route path="/split-pdf" element={<SplitPDFTools />} />
            <Route path="/QRCodeGenerator" element={<QRCodeGenerator />} />
            <Route path='/PDFEdit' element={<PdfEditorPage />} />

            <Route path="/fontconverter" element={<FontConverterTools />} />

            <Route path="/any-to-image" element={<AnyToImageTools />} />
            <Route path="/compress" element={<CompressTools />} />
            <Route path="/FilterImageName" element={<FilterDataWithName />} />
            <Route path="/ImageConverter" element={<ImageConverterTools />} />

            {/* Optional fallback route */}
            <Route path="*" element={<AllTools />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};