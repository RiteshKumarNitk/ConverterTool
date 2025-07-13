import React from "react";

interface Props {
  text: string;
  setText: (val: string) => void;
  size: number;
  setSize: (val: number) => void;
  bgColor: string;
  setBgColor: (val: string) => void;
  fgColor: string;
  setFgColor: (val: string) => void;
  padding: number;
  setPadding: (val: number) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const QRCodeForm: React.FC<Props> = ({
  text, setText,
  size, setSize,
  bgColor, setBgColor,
  fgColor, setFgColor,
  padding, setPadding,
  handleLogoUpload
}) => {
  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium">Text</label>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded" placeholder="Enter URL or text" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input type="number" value={size} onChange={(e) => setSize(+e.target.value)} className="border p-2 rounded" placeholder="Size" />
        <input type="number" value={padding} onChange={(e) => setPadding(+e.target.value)} className="border p-2 rounded" placeholder="Padding" />
        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full" />
        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-10 w-full" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Upload Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoUpload} />
      </div>
    </>
  );
};
