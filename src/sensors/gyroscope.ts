import { Gyroscope } from 'expo-sensors';

export interface SensorSubscription {
  remove: () => void;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

/**
 * Configure gyroscope update interval in milliseconds.
 */
export function setGyroscopeInterval(intervalMs: number): void {
  Gyroscope.setUpdateInterval(intervalMs);
}

/**
 * Check if gyroscope sensor is available on device.
 */
export async function isGyroscopeAvailable(): Promise<boolean> {
  return await Gyroscope.isAvailableAsync();
}

/**
 * Request gyroscope sensor permissions.
 */
export async function requestGyroscopePermissions(): Promise<boolean> {
  const { status } = await Gyroscope.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Check existing gyroscope permissions without prompting the user.
 */
export async function getGyroscopePermissions(): Promise<boolean> {
  const { status } = await Gyroscope.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Subscribe to gyroscope updates.
 */
export function subscribeGyroscope(
  callback: (data: GyroscopeData) => void
): SensorSubscription {
  return Gyroscope.addListener(callback);
}

