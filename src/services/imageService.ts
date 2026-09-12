import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import { formatCompactDate } from '../utils/date';
import { sanitizeFilename } from '../utils/codePayload';
import { permissionService } from './permissionService';

export async function captureCodeCard(
  viewRef: RefObject<unknown>,
): Promise<string> {
  return captureRef(viewRef as never, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
}

export function buildExportFilename(
  name?: string,
  createdDate?: string,
): string {
  const safeName = sanitizeFilename(name || 'code');
  const datePart = createdDate
    ? formatCompactDate(createdDate)
    : formatCompactDate(new Date().toISOString().slice(0, 10));
  return `codemate-${safeName}-${datePart}.png`;
}

export async function saveCapturedImage(uri: string): Promise<string> {
  return permissionService.saveImageToGallery(uri);
}

export const imageService = {
  captureCodeCard,
  buildExportFilename,
  saveCapturedImage,
};
