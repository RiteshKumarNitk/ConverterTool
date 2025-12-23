import React from "react";
import { QRCodeType, ErrorCorrectionLevel } from "../hooks/useQRCode";
import { LOGO_PRESETS } from "../assets/logoPresets";

interface Props {
  qrType: QRCodeType;
  setQrType: (val: QRCodeType) => void;
  // Fields
  text: string; setText: (val: string) => void;
  wifiSsid: string; setWifiSsid: (val: string) => void;
  wifiPassword: string; setWifiPassword: (val: string) => void;
  wifiEncryption: string; setWifiEncryption: (val: string) => void;
  wifiHidden: boolean; setWifiHidden: (val: boolean) => void;
  emailTo: string; setEmailTo: (val: string) => void;
  emailSubject: string; setEmailSubject: (val: string) => void;
  emailBody: string; setEmailBody: (val: string) => void;
  vcardName: string; setVcardName: (val: string) => void;
  vcardPhone: string; setVcardPhone: (val: string) => void;
  vcardEmail: string; setVcardEmail: (val: string) => void;
  vcardOrg: string; setVcardOrg: (val: string) => void;

  // Style
  size: number; setSize: (val: number) => void;
  bgColor: string; setBgColor: (val: string) => void;
  fgColor: string; setFgColor: (val: string) => void;
  errorLevel: ErrorCorrectionLevel; setErrorLevel: (val: ErrorCorrectionLevel) => void;
  includeMargin: boolean; setIncludeMargin: (val: boolean) => void;

  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
  logo: string | null;
  setLogo: (val: string | null) => void;
}

export const QRCodeForm: React.FC<Props> = (props) => {
  const types: QRCodeType[] = ['text', 'url', 'wifi', 'email', 'vcard'];

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="flex space-x-2 overflow-auto pb-2 border-b scrollbar-hide">
        {types.map(t => (
          <button
            key={t}
            onClick={() => props.setQrType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-colors ${props.qrType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        {props.qrType === 'text' && (
          <textarea
            className="w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter text content..."
            value={props.text}
            onChange={e => props.setText(e.target.value)}
          />
        )}
        {props.qrType === 'url' && (
          <input
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://example.com"
            value={props.text}
            onChange={e => props.setText(e.target.value)}
          />
        )}
        {props.qrType === 'wifi' && (
          <>
            <input className="w-full p-2 border rounded-md" placeholder="SSID / Network Name" value={props.wifiSsid} onChange={e => props.setWifiSsid(e.target.value)} />
            <input className="w-full p-2 border rounded-md" type="password" placeholder="Password" value={props.wifiPassword} onChange={e => props.setWifiPassword(e.target.value)} />
            <select className="w-full p-2 border rounded-md" value={props.wifiEncryption} onChange={e => props.setWifiEncryption(e.target.value)}>
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Encryption</option>
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" checked={props.wifiHidden} onChange={e => props.setWifiHidden(e.target.checked)} className="rounded text-blue-600" />
              <span>Hidden Network</span>
            </label>
          </>
        )}
        {props.qrType === 'email' && (
          <>
            <input className="w-full p-2 border rounded-md" placeholder="To (Email)" value={props.emailTo} onChange={e => props.setEmailTo(e.target.value)} />
            <input className="w-full p-2 border rounded-md" placeholder="Subject" value={props.emailSubject} onChange={e => props.setEmailSubject(e.target.value)} />
            <textarea className="w-full p-2 border rounded-md" placeholder="Body" value={props.emailBody} onChange={e => props.setEmailBody(e.target.value)} />
          </>
        )}
        {props.qrType === 'vcard' && (
          <>
            <input className="w-full p-2 border rounded-md" placeholder="Full Name" value={props.vcardName} onChange={e => props.setVcardName(e.target.value)} />
            <input className="w-full p-2 border rounded-md" placeholder="Organization" value={props.vcardOrg} onChange={e => props.setVcardOrg(e.target.value)} />
            <input className="w-full p-2 border rounded-md" placeholder="Phone" value={props.vcardPhone} onChange={e => props.setVcardPhone(e.target.value)} />
            <input className="w-full p-2 border rounded-md" placeholder="Email" value={props.vcardEmail} onChange={e => props.setVcardEmail(e.target.value)} />
          </>
        )}
      </div>

      {/* Theme Presets */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2 block">Themes</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { name: 'Classic', fg: '#000000', bg: '#ffffff' },
            { name: 'Dark', fg: '#ffffff', bg: '#000000' },
            { name: 'Blue', fg: '#ffffff', bg: '#0055ff' },
            { name: 'Green', fg: '#e0ffe0', bg: '#006400' },
            { name: 'Candy', fg: '#ff0055', bg: '#ffe5ee' },
            { name: 'Royal', fg: '#ffd700', bg: '#200045' },
          ].map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                props.setFgColor(theme.fg);
                props.setBgColor(theme.bg);
              }}
              className="flex-shrink-0 flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full border shadow-sm group-hover:scale-110 transition-transform relative"
                style={{ backgroundColor: theme.bg, borderColor: theme.fg }}>
                {/* Dot representation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.fg }}></div>
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style Options */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3 block">Customization</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Color</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="text-xs mb-1 block">Foreground</label>
                <input type="color" className="h-8 w-full cursor-pointer rounded border" value={props.fgColor} onChange={e => props.setFgColor(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-xs mb-1 block">Background</label>
                <input type="color" className="h-8 w-full cursor-pointer rounded border" value={props.bgColor} onChange={e => props.setBgColor(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Size & Margin</label>
            <input type="number" className="w-full border p-2 rounded-md mb-2 text-sm" value={props.size} onChange={e => props.setSize(+e.target.value)} min={100} max={2000} placeholder="Size (px)" />
            <label className="flex items-center space-x-2 text-sm">
              <input type="checkbox" checked={props.includeMargin} onChange={e => props.setIncludeMargin(e.target.checked)} className="rounded text-blue-600" />
              <span>Include Margin</span>
            </label>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Error Correction</label>
            <select className="w-full border p-2 rounded-md text-sm" value={props.errorLevel} onChange={e => props.setErrorLevel(e.target.value as ErrorCorrectionLevel)}>
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
          {/* Logo Upload */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Center Logo</label>
            <div className="flex items-center space-x-2">
              <label className="flex-1 cursor-pointer bg-blue-50 text-blue-600 text-center py-2 rounded-md border border-blue-200 hover:bg-blue-100 text-sm">
                Upload
                <input type="file" accept="image/*" onChange={props.handleLogoUpload} className="hidden" />
              </label>
              {props.logo && (
                <button onClick={props.removeLogo} className="text-red-500 text-xs px-2 py-1 bg-red-50 rounded hover:bg-red-100">X</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logo Library Presets */}
      <div>
        <label className="text-xs text-gray-500 block mb-2">Preset Logos</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {LOGO_PRESETS.map((logo) => (
            <button
              key={logo.name}
              title={logo.name}
              onClick={() => {
                props.setLogo(logo.src);
                props.setErrorLevel('H');
              }}
              className="flex-shrink-0 flex flex-col items-center gap-1 group min-w-[50px] outline-none"
            >
              <div className="w-10 h-10 border rounded-lg flex items-center justify-center bg-white shadow-sm group-hover:border-blue-500 group-hover:shadow-md transition-all p-1.5 ring-2 ring-transparent group-focus:ring-blue-100">
                <img src={logo.src} alt={logo.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-[9px] text-gray-500 font-medium truncate max-w-full text-center tracking-tight">{logo.name}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
