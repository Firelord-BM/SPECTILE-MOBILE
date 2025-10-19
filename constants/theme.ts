/**
 * Unified Theme Configuration
 * Single point of reference for all app styling
 */

import { Platform } from 'react-native';

/**
 * Font families for different platforms
 */
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Main theme object with colors, spacing, and border radius
 */
export const theme = {
  colors: {
    // Primary brand colors
    primary: '#4B5EAA',
    primaryLight: '#6B7280',
    primaryDark: '#374151',
    
    // Background colors
    background: '#F9FAFB',
    card: '#FFFFFF',
    surface: '#F3F4F6', // Additional surface color for secondary backgrounds
    
    // Text colors
    text: '#111827',
    textLight: '#6B7280',
    textSecondary: '#9CA3AF', // Additional text color for less prominent text
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    error: '#EF4444', // Alias for danger
    info: '#3B82F6', // Additional info color
    
    // UI colors
    border: '#E5E7EB',
    divider: '#E5E7EB', // Alias for border
    overlay: 'rgba(0, 0, 0, 0.5)', // For modals and overlays
    shadow: '#000000', // For shadows
    
    // Additional utility colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    accent:'#E5E7EB'
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48, // Additional larger spacing
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999, // For circular elements
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Shadow presets
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
  },
};

/**
 * Light and Dark mode color schemes
 * Use these with your theme context or color scheme hook
 */
export const Colors = {
  light: {
    tint: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.card,
    surface: theme.colors.surface,
    text: theme.colors.text,
    textSecondary: theme.colors.textLight,
    border: theme.colors.border,
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    error: theme.colors.error,
    info: theme.colors.info,
  },
  dark: {
    tint: theme.colors.primaryLight,
    background: '#111827',
    card: '#1F2937',
    surface: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    primary: theme.colors.primaryLight,
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    error: '#F87171',
    info: '#60A5FA',
  },
};

/**
 * Helper function to get theme colors based on current color scheme
 * @param {string} colorScheme - 'light' or 'dark'
 * @returns {object} Theme colors for the specified scheme
 */
export const getThemeColors = (colorScheme = 'light') => {
  return Colors[colorScheme] || Colors.light;
};

/**
 * Common component styles that can be reused
 */
export const commonStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Card styles
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadow.md,
  },
  
  // Button styles
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  
  // Input styles
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  
  // Text styles
  heading: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  subheading: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  body: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  
  caption: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
};

export default theme;