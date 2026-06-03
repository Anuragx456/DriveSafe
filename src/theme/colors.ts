/**
 * Modern color palette for DriveSafe.
 * Light and dark mode colors structured for easy maintenance.
 */

export const Colors = {
  // Primary brand
  primary: '#208AEF',
  primaryLight: '#5DA8F3',
  primaryDark: '#0E5FAF',

  // Semantic
  success: '#34C759',
  successLight: '#5DDA77',
  warning: '#FF9500',
  warningLight: '#FFB340',
  danger: '#FF3B30',
  dangerLight: '#FF6B6B',
  info: '#007AFF',
  infoLight: '#4DA3FF',

  // Neutral
  white: '#FFFFFF',
  offWhite: '#F2F2F7',
  lightGray: '#E5E5EA',
  gray: '#8E8E93',
  darkGray: '#48484A',
  charcoal: '#2C2C2E',
  dark: '#1C1C1E',
  darker: '#121214',

  // Dark background tints
  darkElevated: '#2C2C2E',
  darkSurface: '#1C1C1E',
  darkBase: '#121214',
};

/**
 * Reusable spaced boxShadow values.
 */
export const Shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
};

/**
 * Standard border radii following Apple HIG.
 */
export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
