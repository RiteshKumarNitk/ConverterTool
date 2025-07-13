import React from "react";
import { useQRCode } from "../hooks/useQRCode";
import { QRCodeForm } from "./QRCodeForm";
import { QRCodeDisplay } from "./QRCodeDisplay";

const QRCodeGenerator = () => {
  const {
    text, setText,
    size, setSize,
    bgColor, setBgColor,
    fgColor, setFgColor,
    padding, setPadding,
    logo, handleLogoUpload
  } = useQRCode();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">QR Code Generator</h1>
        <QRCodeForm
          text={text} setText={setText}
          size={size} setSize={setSize}
          bgColor={bgColor} setBgColor={setBgColor}
          fgColor={fgColor} setFgColor={setFgColor}
          padding={padding} setPadding={setPadding}
          handleLogoUpload={handleLogoUpload}
        />
        <QRCodeDisplay
          text={text}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          padding={padding}
          logo={logo}
        />
      </div>
    </div>
  );
};

export default QRCodeGenerator;
