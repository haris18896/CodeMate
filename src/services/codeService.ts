import { DEFAULT_CURRENCY } from '../constants';
import * as codeRepository from '../database/repositories/codeRepository';
import * as formTemplateRepository from '../database/repositories/formTemplateRepository';
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
    englishName: input.englishName.trim() || undefined,
    urduName: input.urduName?.trim() || undefined,
    expiryDate: input.expiryDate,
    fields: input.fields,
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
    englishName: input.englishName.trim() || undefined,
    urduName: input.urduName?.trim() || undefined,
    expiryDate: input.expiryDate,
    fields: input.fields,
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
      fields: parsed.payload.fields,
      payload: params.rawValue,
      rawScannedValue: params.rawValue,
    });
  }

  if (parsed.kind === 'codemate-barcode') {
    const localMatch = parsed.fields.id
      ? await codeRepository.findCodeByBarcodeId(parsed.fields.id)
      : null;
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
      fields: localMatch?.fields ?? parsed.fields.fields,
      payload: params.rawValue,
      rawScannedValue: params.rawValue,
    });
  }

  // Old shared labels sometimes only decoded the short ID under the bars.
  const raw = params.rawValue.trim();
  if (/^[A-F0-9]{10,16}$/i.test(raw)) {
    const localMatch = await codeRepository.findCodeByBarcodeId(raw);
    if (localMatch) {
      return codeRepository.createCode({
        id,
        type: 'BARCODE',
        source: 'SCANNED',
        englishName: localMatch.englishName,
        urduName: localMatch.urduName,
        price: localMatch.price,
        currency: localMatch.currency ?? DEFAULT_CURRENCY,
        createdDate: localMatch.createdDate,
        expiryDate: localMatch.expiryDate,
        fields: localMatch.fields,
        payload: localMatch.payload,
        rawScannedValue: params.rawValue,
      });
    }
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

export const formTemplateService = {
  listTemplates: formTemplateRepository.listTemplates,
  getTemplateById: formTemplateRepository.getTemplateById,
  getDefaultTemplate: formTemplateRepository.getDefaultTemplate,
  createTemplate: formTemplateRepository.createTemplate,
  updateTemplate: formTemplateRepository.updateTemplate,
  deleteTemplate: formTemplateRepository.deleteTemplate,
  setDefaultTemplate: formTemplateRepository.setDefaultTemplate,
  slugifyFieldKey: formTemplateRepository.slugifyFieldKey,
};
