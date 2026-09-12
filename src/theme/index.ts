import { darkColors, lightColors, ThemeColors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export type AppTheme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  shadows: typeof shadows;
  isDark: boolean;
};

export const createTheme = (isDark: boolean): AppTheme => ({
  colors: isDark ? darkColors : lightColors,
  spacing,
  typography,
  radius,
  shadows,
  isDark,
});

export { darkColors, lightColors, radius, shadows, spacing, typography };
export type { ThemeColors };
