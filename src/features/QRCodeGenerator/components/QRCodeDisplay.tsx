import React, { useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { ErrorCorrectionLevel } from "../hooks/useQRCode";

interface Props {
  value: string;
  size: number;
  bgColor: string;
  fgColor: string;
  logo: string | null;
  errorLevel: ErrorCorrectionLevel;
  includeMargin: boolean;
}

export const QRCodeDisplay: React.FC<Props> = ({
  value, size, bgColor, fgColor, logo, errorLevel, includeMargin
}) => {
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-main') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadSVG = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const imageSettings = logo ? {
    src: logo,
    height: size * 0.18,
    width: size * 0.18,
    excavate: true,
  } : undefined;

  if (!value) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6 flex justify-center items-center overflow-hidden w-full max-w-sm aspect-square" ref={qrContainerRef}>
        <QRCodeCanvas
          id="qr-code-main"
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={errorLevel}
          includeMargin={includeMargin}
          imageSettings={imageSettings}
          style={{ maxWidth: '100%', height: 'auto', maxHeight: '100%' }}
        />
      </div>

      {/* Hidden SVG for Export */}
      <div style={{ display: 'none' }}>
        <QRCodeSVG
          id="qr-code-svg"
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={errorLevel}
          includeMargin={includeMargin}
          imageSettings={imageSettings}
        />
      </div>

      <div className="w-full flex gap-3">
        <button
          onClick={downloadQRCode}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition-all flex justify-center items-center gap-2"
        >
          <span>PNG</span>
        </button>
        <button
          onClick={downloadSVG}
          className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-semibold shadow-md transition-all flex justify-center items-center gap-2"
        >
          <span>SVG</span>
        </button>
      </div>
      <p className="mt-3 text-xs text-center text-gray-500">
        Generated at {size}x{size}px
      </p>
    </div>
  );
};
