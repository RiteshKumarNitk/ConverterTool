import { useState } from "react";

export const useQRCode = () => {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [padding, setPadding] = useState(10);
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return {
    text, setText,
    size, setSize,
    bgColor, setBgColor,
    fgColor, setFgColor,
    padding, setPadding,
    logo, handleLogoUpload
  };
};
