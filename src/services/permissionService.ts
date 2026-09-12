import { Linking, Platform } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { VisionCamera } from 'react-native-vision-camera';

export type CameraPermissionState =
  | 'authorized'
  | 'denied'
  | 'not-determined'
  | 'restricted';

export function getCameraPermissionStatus(): CameraPermissionState {
  return VisionCamera.cameraPermissionStatus as CameraPermissionState;
}

export async function requestCameraPermission(): Promise<boolean> {
  return VisionCamera.requestCameraPermission();
}

export async function openAppSettings(): Promise<void> {
  await Linking.openSettings();
}

export async function ensureGallerySavePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Android 10+ can write via MediaStore without legacy storage permission.
  // CameraRoll handles API differences internally for save operations.
  return true;
}

export async function saveImageToGallery(uri: string): Promise<string> {
  const allowed = await ensureGallerySavePermission();
  if (!allowed) {
    throw new Error('Gallery permission denied');
  }
  const result = await CameraRoll.saveAsset(uri, { type: 'photo' });
  return result.node?.image?.uri ?? uri;
}

export const permissionService = {
  getCameraPermissionStatus,
  requestCameraPermission,
  openAppSettings,
  ensureGallerySavePermission,
  saveImageToGallery,
};
