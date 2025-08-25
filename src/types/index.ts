export interface ConversionResult {
  fileName: string;
  downloadUrl: string;
  type: 'pdf' | 'image';
}

export type ToolType = 'home' | 'pdf' | 'image' | 'FilterImageName' | 'QRCodeGenerator'| 'PDFEdit'|'signature' |'AnyFile'|'Compress' | 'any-to-image'| 'merge' |'rename-image'| 'ImageConverter'| 'split-pdf';
