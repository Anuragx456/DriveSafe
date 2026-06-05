import { useState, useEffect, useCallback, useRef } from 'react';
import {
  setAccelerometerInterval,
  subscribeAccelerometer,
  isAccelerometerAvailable,
  requestAccelerometerPermissions,
  getAccelerometerPermissions,
  AccelerometerData,
  SensorSubscription,
} from '../sensors/accelerometer';
import {
  setGyroscopeInterval,
  subscribeGyroscope,
  isGyroscopeAvailable,
  requestGyroscopePermissions,
  getGyroscopePermissions,
  GyroscopeData,
} from '../sensors/gyroscope';
import {
  setDeviceMotionInterval,
  subscribeDeviceMotion,
  isDeviceMotionAvailable,
  requestDeviceMotionPermissions,
  getDeviceMotionPermissions,
  DeviceMotionData,
} from '../sensors/deviceMotion';
import {
  setMagnetometerInterval,
  subscribeMagnetometer,
  isMagnetometerAvailable,
  requestMagnetometerPermissions,
  getMagnetometerPermissions,
  MagnetometerData,
} from '../sensors/magnetometer';
import { AccelReading, GyroReading, DeviceMotionReading } from '../detection/detector';

export interface SensorStatus {
  accelerometer: boolean;
  gyroscope: boolean;
  deviceMotion: boolean;
  magnetometer: boolean;
}

export function useSensorData() {
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);
  const [sensorAvailability, setSensorAvailability] = useState<SensorStatus>({
    accelerometer: false,
    gyroscope: false,
    deviceMotion: false,
    magnetometer: false,
  });

  const [isActive, setIsActive] = useState(false);

  // Subscriptions refs
  const accelSubRef = useRef<SensorSubscription | null>(null);
  const gyroSubRef = useRef<SensorSubscription | null>(null);
  const motionSubRef = useRef<SensorSubscription | null>(null);
  const magSubRef = useRef<SensorSubscription | null>(null);

  // Throttled sensor data callback
  const onDataCallbackRef = useRef<
    ((data: {
      accel: AccelReading;
      gyro: GyroReading;
      motion: DeviceMotionReading | null;
      heading: number | null;
    }) => void) | null
  >(null);

  // Latest readings cached in refs for alignment
  const latestAccelRef = useRef<AccelReading | null>(null);
  const latestGyroRef = useRef<GyroReading | null>(null);
  const latestMotionRef = useRef<DeviceMotionReading | null>(null);
  const latestHeadingRef = useRef<number | null>(null);

  // Checks sensor availability
  const checkAvailability = useCallback(async () => {
    const accAvail = await isAccelerometerAvailable();
    const gyroAvail = await isGyroscopeAvailable();
    const motionAvail = await isDeviceMotionAvailable();
    const magAvail = await isMagnetometerAvailable();

    setSensorAvailability({
      accelerometer: accAvail,
      gyroscope: gyroAvail,
      deviceMotion: motionAvail,
      magnetometer: magAvail,
    });
  }, []);

  // Checks existing permissions for available sensors
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const accAvail = await isAccelerometerAvailable();
      const gyroAvail = await isGyroscopeAvailable();
      const motionAvail = await isDeviceMotionAvailable();
      const magAvail = await isMagnetometerAvailable();

      let accGranted = true;
      let gyroGranted = true;
      let motionGranted = true;
      let magGranted = true;

      if (accAvail) accGranted = await getAccelerometerPermissions();
      if (gyroAvail) gyroGranted = await getGyroscopePermissions();
      if (motionAvail) motionGranted = await getDeviceMotionPermissions();
      if (magAvail) magGranted = await getMagnetometerPermissions();

      // Core sensors (accelerometer & gyroscope) must be physically available AND permissions granted
      const coreAvailable = accAvail && gyroAvail;
      const allGranted = coreAvailable && accGranted && gyroGranted && motionGranted && magGranted;
      setPermissionsGranted(allGranted);
      return allGranted;
    } catch (e) {
      console.warn('Error checking permissions:', e);
      return false;
    }
  }, []);

  // Requests permission for available sensors
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const accAvail = await isAccelerometerAvailable();
      const gyroAvail = await isGyroscopeAvailable();
      const motionAvail = await isDeviceMotionAvailable();
      const magAvail = await isMagnetometerAvailable();

      let accGranted = true;
      let gyroGranted = true;
      let motionGranted = true;
      let magGranted = true;

      if (accAvail) accGranted = await requestAccelerometerPermissions();
      if (gyroAvail) gyroGranted = await requestGyroscopePermissions();
      if (motionAvail) motionGranted = await requestDeviceMotionPermissions();
      if (magAvail) magGranted = await requestMagnetometerPermissions();

      // Core sensors (accelerometer & gyroscope) must be physically available AND permissions granted
      const coreAvailable = accAvail && gyroAvail;
      const allGranted = coreAvailable && accGranted && gyroGranted && motionGranted && magGranted;
      setPermissionsGranted(allGranted);
      return allGranted;
    } catch (error) {
      console.warn('Error requesting sensor permissions:', error);
      setPermissionsGranted(false);
      return false;
    }
  }, []);

  // Configure update intervals (Step 3: Accelerometer 100ms, Gyroscope 100ms, DeviceMotion 100ms, Magnetometer 250ms)
  useEffect(() => {
    const initialize = async () => {
      await checkAvailability();
      await checkPermissions();
    };
    initialize();
    setAccelerometerInterval(100);
    setGyroscopeInterval(100);
    setDeviceMotionInterval(100);
    setMagnetometerInterval(250);
  }, [checkAvailability, checkPermissions]);

  // Stops all subscriptions
  const stopSubscriptions = useCallback(() => {
    if (accelSubRef.current) {
      accelSubRef.current.remove();
      accelSubRef.current = null;
    }
    if (gyroSubRef.current) {
      gyroSubRef.current.remove();
      gyroSubRef.current = null;
    }
    if (motionSubRef.current) {
      motionSubRef.current.remove();
      motionSubRef.current = null;
    }
    if (magSubRef.current) {
      magSubRef.current.remove();
      magSubRef.current = null;
    }
    setIsActive(false);

    // Clear caches
    latestAccelRef.current = null;
    latestGyroRef.current = null;
    latestMotionRef.current = null;
    latestHeadingRef.current = null;
  }, []);

  // Starts subscriptions and routes raw data to onData callback
  const startSubscriptions = useCallback(
    (onData: (data: {
      accel: AccelReading;
      gyro: GyroReading;
      motion: DeviceMotionReading | null;
      heading: number | null;
    }) => void) => {
      // First stop any active subscriptions
      stopSubscriptions();

      onDataCallbackRef.current = onData;
      setIsActive(true);

      // 1. Accelerometer Subscription
      if (sensorAvailability.accelerometer) {
        accelSubRef.current = subscribeAccelerometer((data: AccelerometerData) => {
          const timestamp = Date.now();
          const reading: AccelReading = { ...data, timestamp };
          latestAccelRef.current = reading;
          
          // Trigger callbacks when we get accelerometer updates (synchronized)
          if (onDataCallbackRef.current && latestGyroRef.current) {
            onDataCallbackRef.current({
              accel: reading,
              gyro: latestGyroRef.current,
              motion: latestMotionRef.current,
              heading: latestHeadingRef.current,
            });
          }
        });
      }

      // 2. Gyroscope Subscription
      if (sensorAvailability.gyroscope) {
        gyroSubRef.current = subscribeGyroscope((data: GyroscopeData) => {
          const timestamp = Date.now();
          const reading: GyroReading = { ...data, timestamp };
          latestGyroRef.current = reading;
        });
      }

      // 3. DeviceMotion Subscription
      if (sensorAvailability.deviceMotion) {
        motionSubRef.current = subscribeDeviceMotion((data: DeviceMotionData) => {
          const timestamp = Date.now();
          const reading: DeviceMotionReading = {
            rotationRate: data.rotationRate || { alpha: 0, beta: 0, gamma: 0 },
            userAcceleration: data.acceleration || { x: 0, y: 0, z: 0 },
            timestamp,
          };
          latestMotionRef.current = reading;
        });
      }

      // 4. Magnetometer Subscription (Optional for Heading)
      if (sensorAvailability.magnetometer) {
        magSubRef.current = subscribeMagnetometer((data: MagnetometerData) => {
          // Standard magnetic heading formula in degrees: atan2(y, x)
          let heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
          if (heading < 0) heading += 360;
          latestHeadingRef.current = heading;
        });
      }
    },
    [sensorAvailability, stopSubscriptions]
  );

  // Auto clean up
  useEffect(() => {
    return () => {
      stopSubscriptions();
    };
  }, [stopSubscriptions]);

  return {
    permissionsGranted,
    sensorAvailability,
    isActive,
    requestPermissions,
    startSubscriptions,
    stopSubscriptions,
  };
}
