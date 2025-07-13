import React from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";

interface Props {
  text: string;
  size: number;
  bgColor: string;
  fgColor: string;
  padding: number;
  logo: string | null;
}

export const QRCodeDisplay: React.FC<Props> = ({ text, size, bgColor, fgColor, padding, logo }) => {

  const handleDownloadPNG = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    const newCanvas = document.createElement("canvas");
    const ctx = newCanvas.getContext("2d")!;
    const totalSize = size + padding * 2;

    newCanvas.width = totalSize;
    newCanvas.height = totalSize;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalSize, totalSize);
    ctx.drawImage(canvas, padding, padding, size, size);

    if (logo) {
      const img = new Image();
      img.src = logo;
      img.onload = () => {
        const logoSize = size / 4;
        ctx.drawImage(img, totalSize / 2 - logoSize / 2, totalSize / 2 - logoSize / 2, logoSize, logoSize);
        triggerDownload(newCanvas);
      };
    } else {
      triggerDownload(newCanvas);
    }
  };

  const triggerDownload = (canvas: HTMLCanvasElement) => {
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.png";
    link.click();
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById("qr-svg") as SVGElement;
    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.svg";
    link.click();
  };

  if (!text) return null;

  return (
    <div className="text-center">
      <div className="bg-gray-100 p-4 rounded mb-4 inline-block">
        <QRCodeCanvas id="qr-canvas" value={text} size={size} bgColor={bgColor} fgColor={fgColor} />
        <QRCodeSVG id="qr-svg" value={text} size={size} bgColor={bgColor} fgColor={fgColor} style={{ display: "none" }} />
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={handleDownloadPNG} className="bg-blue-600 text-white px-4 py-2 rounded">Download PNG</button>
        <button onClick={handleDownloadSVG} className="bg-green-600 text-white px-4 py-2 rounded">Download SVG</button>
      </div>
    </div>
  );
};
