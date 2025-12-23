import React from "react";
import { useQRCode } from "../hooks/useQRCode";
import { QRCodeForm } from "./QRCodeForm";
import { QRCodeDisplay } from "./QRCodeDisplay";

const QRCodeGenerator = () => {
  const qrProps = useQRCode();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">QR Code Studio</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Create custom QR codes for Wi-Fi, URLs, VCards and more instantly.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Editor */}
          <div className="w-full lg:w-7/12 xl:w-2/3 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 transition-all hover:shadow-2xl">
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Configuration</h2>
            </div>
            <QRCodeForm {...qrProps} />
          </div>

          {/* Right Column: Preview */}
          <div className="w-full lg:w-5/12 xl:w-1/3 space-y-6 lg:sticky lg:top-6">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center relative z-10">Live Preview</h2>
              <div className="relative z-10">
                <QRCodeDisplay
                  value={qrProps.finalValue}
                  size={qrProps.size}
                  bgColor={qrProps.bgColor}
                  fgColor={qrProps.fgColor}
                  logo={qrProps.logo}
                  errorLevel={qrProps.errorLevel}
                  includeMargin={qrProps.includeMargin}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-2">QR Details</h3>
              <div className="text-sm space-y-2 text-gray-500">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium text-gray-800 capitalize">{qrProps.qrType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="font-medium text-gray-800">{qrProps.size}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Level:</span>
                  <span className="font-medium text-gray-800">{qrProps.errorLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
