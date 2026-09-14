import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../../store/AppContext';
import { CustomFieldValues } from '../../types/code';
import { LinkableText } from '../LinkableText/LinkableText';

type Props = {
  fields?: CustomFieldValues;
};

export function CustomFieldsList({ fields }: Props) {
  const theme = useAppTheme();
  const entries = Object.entries(fields ?? {}).filter(
    ([, value]) => String(value ?? '').trim().length > 0,
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 8 }}>
      {entries.map(([label, value]) => (
        <View key={label}>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.textSecondary },
            ]}>
            {label}
          </Text>
          <LinkableText
            value={String(value)}
            numberOfLines={4}
            style={[
              theme.typography.bodyBold,
              { color: theme.colors.textPrimary, marginTop: 2 },
            ]}
          />
        </View>
      ))}
    </View>
  );
}
