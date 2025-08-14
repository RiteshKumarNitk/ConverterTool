export interface ConversionResult {
  fileName: string;
  downloadUrl: string;
  type: 'pdf' | 'image';
}

export type ToolType = 'home' | 'pdf' | 'image' | 'FilterImageName' | 'QRCodeGenerator'| 'signature' |'AnyFile'|'Compress' | 'any-to-image'| 'merge'|'fontconverter' |'rename-image'| 'ImageConverter'| 'split-pdf';
