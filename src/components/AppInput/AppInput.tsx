import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useAppTheme } from '../../store/AppContext';

type Props = TextInputProps & {
  label: string;
  error?: string;
  leftIcon?: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  rightIcon?: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  onPressRightIcon?: () => void;
  isRTL?: boolean;
};

export function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onPressRightIcon,
  isRTL,
  style,
  ...rest
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          theme.typography.label,
          {
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs,
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          },
        ]}>
        {label}
      </Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            minHeight: rest.multiline ? 96 : 48,
          },
        ]}>
        {leftIcon ? (
          <MaterialDesignIcons
            name={leftIcon}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.sideIcon}
          />
        ) : null}
        <TextInput
          {...rest}
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.input,
            theme.typography.body,
            {
              color: theme.colors.textPrimary,
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr',
              paddingVertical: rest.multiline ? 12 : 0,
            },
            style,
          ]}
        />
        {rightIcon ? (
          <MaterialDesignIcons
            name={rightIcon}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.sideIcon}
            onPress={onPressRightIcon}
          />
        ) : null}
      </View>
      {error ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.danger, marginTop: 6 },
          ]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  field: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    includeFontPadding: false,
    paddingVertical: 10,
  },
  sideIcon: {
    marginHorizontal: 4,
  },
});
