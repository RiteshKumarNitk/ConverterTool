import { useState, useEffect } from "react";

export type QRCodeType = 'text' | 'url' | 'wifi' | 'email' | 'vcard';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export const useQRCode = () => {
  const [qrType, setQrType] = useState<QRCodeType>('text');
  const [text, setText] = useState(""); // Used for Text/URL

  // WiFi
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // Email
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // VCard
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");

  // Style
  const [size, setSize] = useState(300);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [logo, setLogo] = useState<string | null>(null);
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('H');
  const [includeMargin, setIncludeMargin] = useState(true);

  // Computed Value
  const [finalValue, setFinalValue] = useState("");

  useEffect(() => {
    let val = "";
    switch (qrType) {
      case 'url':
      case 'text':
        val = text;
        break;
      case 'wifi':
        val = `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};H:${wifiHidden};;`;
        break;
      case 'email':
        val = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'vcard':
        val = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
        break;
    }
    setFinalValue(val);
  }, [qrType, text, wifiSsid, wifiPassword, wifiEncryption, wifiHidden, emailTo, emailSubject, emailBody, vcardName, vcardPhone, vcardEmail, vcardOrg]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
        setErrorLevel('H'); // Force High error correction for logos
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setLogo(null);

  return {
    qrType, setQrType,
    text, setText,
    wifiSsid, setWifiSsid,
    wifiPassword, setWifiPassword,
    wifiEncryption, setWifiEncryption,
    wifiHidden, setWifiHidden,
    emailTo, setEmailTo,
    emailSubject, setEmailSubject,
    emailBody, setEmailBody,
    vcardName, setVcardName,
    vcardPhone, setVcardPhone,
    vcardEmail, setVcardEmail,
    vcardOrg, setVcardOrg,
    size, setSize,
    bgColor, setBgColor,
    fgColor, setFgColor,
    logo, handleLogoUpload, removeLogo, setLogo,
    errorLevel, setErrorLevel,
    includeMargin, setIncludeMargin,
    finalValue
  };
};
