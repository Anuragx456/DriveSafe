import { Magnetometer } from 'expo-sensors';

export interface SensorSubscription {
  remove: () => void;
}

export interface MagnetometerData {
  x: number;
  y: number;
  z: number;
}

/**
 * Configure magnetometer update interval in milliseconds.
 */
export function setMagnetometerInterval(intervalMs: number): void {
  Magnetometer.setUpdateInterval(intervalMs);
}

/**
 * Check if magnetometer sensor is available on device.
 */
export async function isMagnetometerAvailable(): Promise<boolean> {
  return await Magnetometer.isAvailableAsync();
}

/**
 * Request magnetometer sensor permissions.
 */
export async function requestMagnetometerPermissions(): Promise<boolean> {
  const { status } = await Magnetometer.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Check existing magnetometer permissions without prompting the user.
 */
export async function getMagnetometerPermissions(): Promise<boolean> {
  const { status } = await Magnetometer.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Subscribe to magnetometer updates.
 */
export function subscribeMagnetometer(
  callback: (data: MagnetometerData) => void
): SensorSubscription {
  return Magnetometer.addListener(callback);
}

