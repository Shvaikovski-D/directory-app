/**
 * Токены цветов Material Design для использования в компонентах
 */
export const THEME_COLORS = {
  primary: '#B33B15',
  secondary: '#B88576',
  tertiary: '#A58F44',
  error: '#FF5449',
  neutral: '#998E8C',
  neutralVariant: '#A08C87',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceContainer: '#F5F5F5',
} as const;

export type ThemeColorKey = keyof typeof THEME_COLORS;

/**
 * Хук для получения цветов темы
 * @example
 * const colors = useThemeColors();
 * const primaryColor = colors.primary;
 */
export function useThemeColors() {
  return {
    primary: THEME_COLORS.primary,
    secondary: THEME_COLORS.secondary,
    tertiary: THEME_COLORS.tertiary,
    error: THEME_COLORS.error,
    neutral: THEME_COLORS.neutral,
    neutralVariant: THEME_COLORS.neutralVariant,
    background: THEME_COLORS.background,
    surface: THEME_COLORS.surface,
    surfaceContainer: THEME_COLORS.surfaceContainer,
  };
}

/**
 * Стилевые классы для использования в шаблонах
 */
export const THEME_CLASS_NAMES = {
  primary: 'md-sys-color-primary',
  onPrimary: 'md-sys-color-on-primary',
  secondary: 'md-sys-color-secondary',
  onSecondary: 'md-sys-color-on-secondary',
  tertiary: 'md-sys-color-tertiary',
  onTertiary: 'md-sys-color-on-tertiary',
  error: 'md-sys-color-error',
  onError: 'md-sys-color-on-error',
  background: 'md-sys-color-background',
  onBackground: 'md-sys-color-on-background',
  surface: 'md-sys-color-surface',
  onSurface: 'md-sys-color-on-surface',
  outline: 'md-sys-color-outline',
  surfaceContainer: 'md-sys-color-surface-container',
} as const;