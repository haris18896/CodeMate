import Share, { Social } from 'react-native-share';

export async function shareImage(params: {
  uri: string;
  message?: string;
  title?: string;
}): Promise<void> {
  await Share.open({
    url: params.uri.startsWith('file://') ? params.uri : `file://${params.uri}`,
    type: 'image/png',
    title: params.title ?? 'CodeMate',
    message: params.message ?? 'Shared from CodeMate',
    failOnCancel: false,
  });
}

export async function shareText(value: string): Promise<void> {
  await Share.open({
    message: value,
    title: 'CodeMate',
    failOnCancel: false,
  });
}

export async function shareToWhatsApp(params: {
  uri?: string;
  message?: string;
}): Promise<void> {
  try {
    await Share.shareSingle({
      social: Social.Whatsapp,
      url: params.uri
        ? params.uri.startsWith('file://')
          ? params.uri
          : `file://${params.uri}`
        : undefined,
      message: params.message,
      type: params.uri ? 'image/png' : undefined,
    });
  } catch {
    if (params.uri) {
      await shareImage({ uri: params.uri, message: params.message });
    } else if (params.message) {
      await shareText(params.message);
    }
  }
}

export const shareService = {
  shareImage,
  shareText,
  shareToWhatsApp,
};
