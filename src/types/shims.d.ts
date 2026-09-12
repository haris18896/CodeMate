declare module 'react-native-view-shot' {
  import type { RefObject } from 'react';

  export type CaptureOptions = {
    format?: 'png' | 'jpg' | 'webm' | 'raw';
    quality?: number;
    result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
    height?: number;
    width?: number;
    snapshotContentContainer?: boolean;
    handleGLSurfaceViewOnAndroid?: boolean;
  };

  export function captureRef(
    viewRef: RefObject<unknown> | number,
    options?: CaptureOptions,
  ): Promise<string>;

  export function captureScreen(options?: CaptureOptions): Promise<string>;

  const ViewShot: React.ComponentType<Record<string, unknown>>;
  export default ViewShot;
}

declare module 'react-native/Libraries/Types/CodegenTypes' {
  export type Float = number;
  export type Double = number;
  export type Int32 = number;
  export type UnsafeObject = object;
}
