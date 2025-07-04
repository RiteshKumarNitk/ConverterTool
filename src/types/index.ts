export interface ConversionResult {
  fileName: string;
  downloadUrl: string;
  type: 'pdf' | 'image';
}

export type ToolType = 'home' | 'pdf' | 'image' | 'signature' | 'merge';
