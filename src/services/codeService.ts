import { DEFAULT_CURRENCY } from '../constants';
import * as codeRepository from '../database/repositories/codeRepository';
import { CodeRecord, CodeType, GenerateCodeInput } from '../types/code';
import {
  buildBarcodePayload,
  buildQrPayload,
  parseScannedValue,
  stringifyQrPayload,
} from '../utils/codePayload';
import { createId } from '../utils/id';

export async function generateQrCode(
  input: GenerateCodeInput,
): Promise<CodeRecord> {
  const id = createId();
  const payloadObject = buildQrPayload(id, input);
  const payload = stringifyQrPayload(payloadObject);

  return codeRepository.createCode({
    id,
    type: 'QR',
    source: 'GENERATED',
    englishName: input.englishName.trim(),
    urduName: input.urduName?.trim() || undefined,
    price: input.price,
    currency: input.currency ?? DEFAULT_CURRENCY,
    createdDate: input.createdDate,
    expiryDate: input.expiryDate,
    payload,
  });
}

export async function generateBarcode(
  input: GenerateCodeInput,
): Promise<CodeRecord> {
  const id = createId();
  const payload = buildBarcodePayload(id, input);

  return codeRepository.createCode({
    id,
    type: 'BARCODE',
    source: 'GENERATED',
    englishName: input.englishName.trim(),
    urduName: input.urduName?.trim() || undefined,
    price: input.price,
    currency: input.currency ?? DEFAULT_CURRENCY,
    createdDate: input.createdDate,
    expiryDate: input.expiryDate,
    payload,
  });
}

export async function saveScannedValue(params: {
  rawValue: string;
  formatHint?: string;
}): Promise<CodeRecord> {
  const parsed = parseScannedValue(params.rawValue);
  const id = createId();
  const type: CodeType =
    parsed.kind === 'codemate-barcode' ||
    (params.formatHint &&
      ['code-128', 'code-39', 'ean-13', 'ean-8', 'upc-a', 'upc-e'].includes(
        params.formatHint,
      ))
      ? 'BARCODE'
      : 'QR';

  if (parsed.kind === 'codemate-qr') {
    return codeRepository.createCode({
      id: parsed.payload.id || id,
      type: 'QR',
      source: 'SCANNED',
      englishName: parsed.payload.name.en,
      urduName: parsed.payload.name.ur,
      price: parsed.payload.price,
      currency: parsed.payload.currency,
      createdDate: parsed.payload.createdDate,
      expiryDate: parsed.payload.expiryDate,
      payload: params.rawValue,
      rawScannedValue: params.rawValue,
    });
  }

  if (parsed.kind === 'codemate-barcode') {
    const localMatch = await codeRepository.findCodeByBarcodeId(
      parsed.fields.id,
    );
    return codeRepository.createCode({
      id,
      type: 'BARCODE',
      source: 'SCANNED',
      englishName: localMatch?.englishName ?? parsed.fields.name,
      urduName: localMatch?.urduName,
      price: localMatch?.price ?? parsed.fields.price,
      currency: localMatch?.currency ?? DEFAULT_CURRENCY,
      createdDate: localMatch?.createdDate ?? parsed.fields.createdDate,
      expiryDate: localMatch?.expiryDate ?? parsed.fields.expiryDate,
      payload: params.rawValue,
      rawScannedValue: params.rawValue,
    });
  }

  return codeRepository.createCode({
    id,
    type,
    source: 'SCANNED',
    payload: params.rawValue,
    rawScannedValue: params.rawValue,
    englishName: undefined,
  });
}

export const codeService = {
  generateQrCode,
  generateBarcode,
  saveScannedValue,
  getRecentCodes: codeRepository.getRecentCodes,
  getAllCodes: codeRepository.getAllCodes,
  searchCodes: codeRepository.searchCodes,
  getCodeById: codeRepository.getCodeById,
  deleteCode: codeRepository.deleteCode,
  clearCodes: codeRepository.clearCodes,
  updateCode: codeRepository.updateCode,
  findCodeByBarcodeId: codeRepository.findCodeByBarcodeId,
};
