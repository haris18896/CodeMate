import type { RefObject } from 'react';

type CaptureOptions = {
  format?: 'png' | 'jpg' | 'webm' | 'raw';
  quality?: number;
  result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
};

export function captureRef(
  _viewRef: RefObject<unknown> | number,
  _options?: CaptureOptions,
): Promise<string> {
  throw new Error('view-shot stub should not run in tests');
}

export function captureScreen(_options?: CaptureOptions): Promise<string> {
  throw new Error('view-shot stub should not run in tests');
}

export default function ViewShot() {
  return null;
}
