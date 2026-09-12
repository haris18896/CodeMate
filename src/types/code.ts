export type CodeType = 'QR' | 'BARCODE';
export type CodeSource = 'GENERATED' | 'SCANNED';
export type CodeStatus = 'ACTIVE' | 'EXPIRES_TODAY' | 'EXPIRED';
export type ThemePreference = 'system' | 'light' | 'dark';
export type AppLanguage = 'en' | 'ur';

export interface CodeRecord {
  id: string;
  type: CodeType;
  source: CodeSource;
  englishName?: string;
  urduName?: string;
  price?: number;
  currency?: string;
  createdDate?: string;
  expiryDate?: string;
  payload: string;
  rawScannedValue?: string;
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeMateQrPayload {
  app: 'CodeMate';
  version: 1;
  id: string;
  name: {
    en: string;
    ur?: string;
  };
  price: number;
  currency: string;
  createdDate: string;
  expiryDate: string;
}

export interface CodeMateBarcodeFields {
  id: string;
  name?: string;
  price?: number;
  createdDate?: string;
  expiryDate?: string;
}

export interface GenerateCodeInput {
  englishName: string;
  urduName?: string;
  price: number;
  currency?: string;
  createdDate: string;
  expiryDate: string;
}

export type ScanParseResult =
  | {
      kind: 'codemate-qr';
      payload: CodeMateQrPayload;
      rawValue: string;
    }
  | {
      kind: 'codemate-barcode';
      fields: CodeMateBarcodeFields;
      rawValue: string;
    }
  | {
      kind: 'generic';
      rawValue: string;
      formatHint?: string;
    };
