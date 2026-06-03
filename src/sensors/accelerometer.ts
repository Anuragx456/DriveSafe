import { Accelerometer } from 'expo-sensors';

export interface SensorSubscription {
  remove: () => void;
}

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

/**
 * Configure accelerometer update interval in milliseconds.
 */
export function setAccelerometerInterval(intervalMs: number): void {
  Accelerometer.setUpdateInterval(intervalMs);
}

/**
 * Check if accelerometer sensor is available on device.
 */
export async function isAccelerometerAvailable(): Promise<boolean> {
  return await Accelerometer.isAvailableAsync();
}

/**
 * Request accelerometer sensor permissions (Android specific check/prompt)
 */
export async function requestAccelerometerPermissions(): Promise<boolean> {
  const { status } = await Accelerometer.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Check existing accelerometer permissions without prompting the user.
 */
export async function getAccelerometerPermissions(): Promise<boolean> {
  const { status } = await Accelerometer.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Subscribe to accelerometer updates.
 */
export function subscribeAccelerometer(
  callback: (data: AccelerometerData) => void
): SensorSubscription {
  return Accelerometer.addListener(callback);
}

