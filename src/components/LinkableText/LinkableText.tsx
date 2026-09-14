import React from 'react';
import {
  Alert,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../store/AppContext';
import { isWebUrl, openWebUrl } from '../../utils/url';

type Props = {
  value: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export function LinkableText({ value, style, numberOfLines }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const link = isWebUrl(value);

  if (!link) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {value}
      </Text>
    );
  }

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => {
        void openWebUrl(value).then(opened => {
          if (!opened) {
            Alert.alert(t('common.error'), t('common.unableOpenLink'));
          }
        });
      }}>
      <Text
        numberOfLines={numberOfLines}
        style={[
          style,
          {
            color: theme.colors.primary,
            textDecorationLine: 'underline',
          },
        ]}>
        {value}
      </Text>
    </Pressable>
  );
}
