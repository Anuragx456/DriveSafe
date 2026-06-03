/**
 * Threshold constants for driving event detection.
 * All units and detection rationales are documented per specification.
 */

/**
 * Harsh Braking Thresholds
 * Unit: g (standard gravity, 1g ≈ 9.81 m/s²)
 * Rationale: A deceleration force delta of > 1.5g in under 200ms represents sudden, hard braking 
 * that typically occurs during emergency stops or distracted driving.
 */
export const HARSH_BRAKING_G_DELTA = 1.5;
export const HARSH_BRAKING_WINDOW_MS = 200;
export const HARSH_BRAKING_DEBOUNCE_MS = 2000;

/**
 * Harsh Acceleration Thresholds
 * Unit: g (standard gravity, 1g ≈ 9.81 m/s²)
 * Rationale: An acceleration force delta of < -1.5g (negative delta representing rapid forward acceleration 
 * along the device x-axis depending on placement) within 200ms represents rapid gas pedal depression, 
 * typical of aggressive, fuel-inefficient driving behavior.
 */
export const HARSH_ACCEL_G_DELTA = -1.5;
export const HARSH_ACCEL_WINDOW_MS = 200;
export const HARSH_ACCEL_DEBOUNCE_MS = 2000;

/**
 * Sharp Turn Thresholds
 * Unit: rad/s (radians per second)
 * Rationale: An angular velocity absolute value on the device's yaw (Z-axis) exceeding 1.2 rad/s 
 * sustained for more than 300ms indicates a high-speed cornering maneuver that could cause loss of vehicle traction.
 */
export const SHARP_TURN_RADS = 1.2;
export const SHARP_TURN_DURATION_MS = 300;
export const SHARP_TURN_DEBOUNCE_MS = 1500;

/**
 * Aggressive Steering Thresholds
 * Unit: rad/s (radians per second)
 * Rationale: High angular velocity (Z-axis absolute value > 0.8 rad/s) sustained for a longer period (> 500ms) 
 * indicates erratic lane changing or rapid swerving maneuvers.
 */
export const AGGRESSIVE_STEERING_RADS = 0.8;
export const AGGRESSIVE_STEERING_DURATION_MS = 500;
export const AGGRESSIVE_STEERING_DEBOUNCE_MS = 1000;

/**
 * Excessive Device Movement Thresholds
 * Unit: g/s (gravity units change per second)
 * Rationale: Total accelerometer magnitude derivative exceeding 2.0 g/s represents sudden displacement 
 * of the phone itself (e.g., falling from a mount or sliding across the dashboard).
 */
export const EXCESSIVE_MOVEMENT_GPS = 2.0;
export const EXCESSIVE_MOVEMENT_DEBOUNCE_MS = 3000;

/**
 * Phone Handling Thresholds
 * Unit: rad/s (angular velocity) & g (user acceleration magnitude)
 * Rationale: Simultaneous rotation rate of > 1.5 rad/s on Y or Z axis AND a non-gravitational user acceleration 
 * magnitude > 0.5g signifies that the device is actively being picked up, rotated, or handled by the driver.
 */
export const PHONE_HANDLING_ROTATION_RADS = 1.5;
export const PHONE_HANDLING_ACCEL_G = 0.5;
export const PHONE_HANDLING_DEBOUNCE_MS = 5000;

/**
 * Event Types
 */
export type EventType =
  | 'HARSH_BRAKING'
  | 'HARSH_ACCELERATION'
  | 'SHARP_TURN'
  | 'AGGRESSIVE_STEERING'
  | 'EXCESSIVE_MOVEMENT'
  | 'PHONE_HANDLING';

export const EVENT_DETAILS: Record<EventType, { title: string; deduction: number; icon: string; color: string; description: string }> = {
  HARSH_BRAKING: {
    title: 'Harsh Braking',
    deduction: 5,
    icon: 'arrow.down.to.circle',
    color: '#FF3B30',
    description: 'Sudden deceleration force over 1.5g detected.',
  },
  HARSH_ACCELERATION: {
    title: 'Harsh Acceleration',
    deduction: 5,
    icon: 'arrow.up.to.circle',
    color: '#FF9500',
    description: 'Rapid speed increase over 1.5g detected.',
  },
  SHARP_TURN: {
    title: 'Sharp Turn',
    deduction: 3,
    icon: 'arrow.left.and.right',
    color: '#FFCC00',
    description: 'Sudden rotation rate over 1.2 rad/s sustained for 300ms.',
  },
  AGGRESSIVE_STEERING: {
    title: 'Aggressive Steering',
    deduction: 2,
    icon: 'point.3.filled.connected.trianglepath.dotted',
    color: '#E8A500',
    description: 'Erratic swerving or lane changing sustained for 500ms.',
  },
  EXCESSIVE_MOVEMENT: {
    title: 'Excessive Device Movement',
    deduction: 2,
    icon: 'iphone',
    color: '#AF52DE',
    description: 'Sudden displacement of the phone.',
  },
  PHONE_HANDLING: {
    title: 'Phone Handling',
    deduction: 5,
    icon: 'hand.tap',
    color: '#FF2D55',
    description: 'Active pickup or interaction with phone during driving.',
  },
};
