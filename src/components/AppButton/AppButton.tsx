import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useAppTheme } from '../../store/AppContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
  accessibilityLabel,
}: Props) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.danger
        : variant === 'secondary'
          ? theme.colors.primaryLight
          : 'transparent';

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? theme.colors.textInverse
      : theme.colors.primary;

  const borderColor =
    variant === 'ghost' || variant === 'secondary'
      ? theme.colors.primary
      : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'ghost' || variant === 'secondary' ? 1.5 : 0,
          opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1,
          minHeight: 48,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? (
            <MaterialDesignIcons
              name={icon}
              size={20}
              color={textColor}
              style={styles.icon}
            />
          ) : null}
          <Text style={[theme.typography.button, { color: textColor }]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
});
