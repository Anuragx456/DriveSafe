/**
 * Theme entry point for DriveSafe.
 * Provides colors, spacing tokens, typography, and glass effect helpers.
 */

import { Colors, Shadows, Radii } from './colors';

export { Colors, Shadows, Radii };

/**
 * Responsive padding scale based on window width.
 * Use in inline styles where needed, or as a static scale.
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

/**
 * Typography scale aligned with Apple HIG.
 * Sizes in points (same as px on iOS).
 */
export const Typography = {
  xxs: { fontSize: 10, lineHeight: 12, letterSpacing: 0.5, fontWeight: '700' },
  xs: { fontSize: 11, lineHeight: 14, letterSpacing: 0.4, fontWeight: '600' },
  sm: { fontSize: 13, lineHeight: 18, letterSpacing: -0.2, fontWeight: '600' },
  base: { fontSize: 15, lineHeight: 20, letterSpacing: -0.3, fontWeight: '700' },
  lg: { fontSize: 18, lineHeight: 24, letterSpacing: -0.4, fontWeight: '800' },
  xl: { fontSize: 22, lineHeight: 28, letterSpacing: -0.5, fontWeight: '900' },
  '2xl': { fontSize: 28, lineHeight: 34, letterSpacing: -0.7, fontWeight: '900' },
  '3xl': { fontSize: 36, lineHeight: 42, letterSpacing: -0.8, fontWeight: '900' },
} as const;

/**
 * Predefined card style for dark surfaces.
 * Inline style approach per project guidelines.
 */
export function darkCardStyle(overrides?: Record<string, any>) {
  return {
    backgroundColor: Colors.darkSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.darkElevated,
    boxShadow: Shadows.md,
    ...overrides,
  };
}

/**
 * Convenience for continuous rounded corners on iOS.
 */
export const continuousBorder = { borderCurve: 'continuous' as const };
