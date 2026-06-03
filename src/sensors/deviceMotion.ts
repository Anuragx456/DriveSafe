import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';

export interface SensorSubscription {
  remove: () => void;
}

// Re-export DeviceMotionMeasurement as part of our module types
export type DeviceMotionData = DeviceMotionMeasurement;

/**
 * Configure DeviceMotion update interval in milliseconds.
 */
export function setDeviceMotionInterval(intervalMs: number): void {
  DeviceMotion.setUpdateInterval(intervalMs);
}

/**
 * Check if DeviceMotion sensor is available on device.
 */
export async function isDeviceMotionAvailable(): Promise<boolean> {
  return await DeviceMotion.isAvailableAsync();
}

/**
 * Request DeviceMotion sensor permissions.
 */
export async function requestDeviceMotionPermissions(): Promise<boolean> {
  const { status } = await DeviceMotion.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Check existing DeviceMotion permissions without prompting the user.
 */
export async function getDeviceMotionPermissions(): Promise<boolean> {
  const { status } = await DeviceMotion.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Subscribe to DeviceMotion updates.
 */
export function subscribeDeviceMotion(
  callback: (data: DeviceMotionMeasurement) => void
): SensorSubscription {
  return DeviceMotion.addListener(callback);
}

