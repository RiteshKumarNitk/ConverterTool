export interface ConversionResult {
  fileName: string;
  downloadUrl: string;
  type: 'pdf' | 'image';
  originalFile?: File;
}

export type ToolType = 'home' | 'pdf' | 'image' | 'FilterImageName' | 'QRCodeGenerator' | 'fontconverter' | 'PDFEdit' | 'signature' | 'AnyFile' | 'Compress' | 'any-to-image' | 'merge' | 'rename-image' | 'ImageConverter' | 'split-pdf';
