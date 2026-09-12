import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useAppTheme } from '../../store/AppContext';

type Option<T extends string> = {
  label: string;
  value: T;
  icon?: React.ComponentProps<typeof MaterialDesignIcons>['name'];
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.isDark
            ? theme.colors.background
            : theme.colors.surfaceMuted,
          borderRadius: theme.radius.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          padding: 3,
        },
      ]}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: selected
                  ? theme.colors.primary
                  : pressed
                    ? theme.colors.primaryLight
                    : 'transparent',
                borderRadius: theme.radius.sm,
                opacity: pressed && !selected ? 0.9 : 1,
              },
              selected ? theme.shadows.soft : null,
            ]}>
            {option.icon ? (
              <MaterialDesignIcons
                name={option.icon}
                size={16}
                color={
                  selected
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary
                }
                style={styles.icon}
              />
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                theme.typography.caption,
                {
                  color: selected
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary,
                  fontWeight: selected ? '700' : '600',
                  letterSpacing: 0.2,
                },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  icon: {
    marginRight: 2,
  },
});
