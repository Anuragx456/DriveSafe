import {
  HARSH_BRAKING_G_DELTA,
  HARSH_BRAKING_WINDOW_MS,
  HARSH_ACCEL_G_DELTA,
  HARSH_ACCEL_WINDOW_MS,
  SHARP_TURN_RADS,
  SHARP_TURN_DURATION_MS,
  AGGRESSIVE_STEERING_RADS,
  AGGRESSIVE_STEERING_DURATION_MS,
  EXCESSIVE_MOVEMENT_GPS,
  PHONE_HANDLING_ROTATION_RADS,
  PHONE_HANDLING_ACCEL_G,
  EventType,
} from '../constants/THRESHOLDS';

export interface AccelReading {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface GyroReading {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface DeviceMotionReading {
  rotationRate: {
    alpha: number; // Z-axis rotation
    beta: number;  // X-axis rotation
    gamma: number; // Y-axis rotation
    x?: number;
    y?: number;
    z?: number;
  };
  userAcceleration: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
}

/**
 * Pure function to detect Harsh Braking.
 * Condition: accelerometer X-axis delta > 1.5 g in under 200ms.
 * Returns true if a pair of readings in the window has a delta exceeding threshold.
 */
export function detectHarshBraking(buffer: AccelReading[]): boolean {
  if (buffer.length < 2) return false;

  for (let i = 0; i < buffer.length; i++) {
    for (let j = i + 1; j < buffer.length; j++) {
      const timeDelta = buffer[j].timestamp - buffer[i].timestamp;
      if (timeDelta > 0 && timeDelta <= HARSH_BRAKING_WINDOW_MS) {
        const xDelta = buffer[j].x - buffer[i].x;
        if (xDelta > HARSH_BRAKING_G_DELTA) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Pure function to detect Harsh Acceleration.
 * Condition: accelerometer X-axis delta < -1.5 g in under 200ms.
 * Returns true if a pair of readings in the window has a negative delta below threshold.
 */
export function detectHarshAcceleration(buffer: AccelReading[]): boolean {
  if (buffer.length < 2) return false;

  for (let i = 0; i < buffer.length; i++) {
    for (let j = i + 1; j < buffer.length; j++) {
      const timeDelta = buffer[j].timestamp - buffer[i].timestamp;
      if (timeDelta > 0 && timeDelta <= HARSH_ACCEL_WINDOW_MS) {
        const xDelta = buffer[j].x - buffer[i].x;
        if (xDelta < HARSH_ACCEL_G_DELTA) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Helper to check if gyro absolute Z-axis value exceeds a threshold sustained for a duration.
 */
function isGyroZValueSustained(
  buffer: GyroReading[],
  threshold: number,
  durationMs: number
): boolean {
  if (buffer.length < 2) return false;

  // Search for a contiguous sub-segment of samples where ALL samples satisfy |z| > threshold,
  // and the duration between the first and last sample of that sub-segment is >= durationMs.
  let startIdx = 0;
  while (startIdx < buffer.length) {
    if (Math.abs(buffer[startIdx].z) > threshold) {
      let endIdx = startIdx;
      while (endIdx < buffer.length && Math.abs(buffer[endIdx].z) > threshold) {
        const duration = buffer[endIdx].timestamp - buffer[startIdx].timestamp;
        if (duration >= durationMs) {
          return true;
        }
        endIdx++;
      }
      startIdx = endIdx; // skip past non-matching or matching group
    } else {
      startIdx++;
    }
  }

  return false;
}

/**
 * Pure function to detect Sharp Turn.
 * Condition: gyroscope Z-axis absolute value > 1.2 rad/s sustained for > 300ms.
 */
export function detectSharpTurn(buffer: GyroReading[]): boolean {
  return isGyroZValueSustained(buffer, SHARP_TURN_RADS, SHARP_TURN_DURATION_MS);
}

/**
 * Pure function to detect Aggressive Steering.
 * Condition: gyroscope Z-axis absolute value > 0.8 rad/s sustained for > 500ms.
 */
export function detectAggressiveSteering(buffer: GyroReading[]): boolean {
  return isGyroZValueSustained(buffer, AGGRESSIVE_STEERING_RADS, AGGRESSIVE_STEERING_DURATION_MS);
}

/**
 * Pure function to detect Excessive Device Movement.
 * Condition: total accelerometer magnitude changes > 2.0 g/s.
 * We calculate magnitude change between consecutive readings: |mag_t - mag_{t-1}| / dt.
 */
export function detectExcessiveMovement(buffer: AccelReading[]): boolean {
  if (buffer.length < 2) return false;

  for (let i = 1; i < buffer.length; i++) {
    const p1 = buffer[i - 1];
    const p2 = buffer[i];

    const dt = (p2.timestamp - p1.timestamp) / 1000; // in seconds
    if (dt <= 0) continue;

    const mag1 = Math.sqrt(p1.x * p1.x + p1.y * p1.y + p1.z * p1.z);
    const mag2 = Math.sqrt(p2.x * p2.x + p2.y * p2.y + p2.z * p2.z);

    const rateOfChange = Math.abs(mag2 - mag1) / dt;
    if (rateOfChange > EXCESSIVE_MOVEMENT_GPS) {
      return true;
    }
  }

  return false;
}

/**
 * Pure function to detect Phone Handling.
 * Condition: DeviceMotion rotation rate > 1.5 rad/s on Y or Z axis
 *            AND magnitude of user acceleration > 0.5 g.
 * Checks the latest DeviceMotion reading.
 */
export function detectPhoneHandling(reading: DeviceMotionReading | null): boolean {
  if (!reading) return false;

  const rot = reading.rotationRate;
  // Fallbacks in case format uses alpha/beta/gamma or x/y/z
  const rotY = Math.abs(rot.gamma !== undefined ? rot.gamma : (rot.y !== undefined ? rot.y : 0));
  const rotZ = Math.abs(rot.alpha !== undefined ? rot.alpha : (rot.z !== undefined ? rot.z : 0));

  const userAcc = reading.userAcceleration;
  // Convert acceleration from m/s² (SI units) to g's (1g ≈ 9.81 m/s²) to align with threshold units
  const userAccG = {
    x: userAcc.x / 9.81,
    y: userAcc.y / 9.81,
    z: userAcc.z / 9.81,
  };
  const userAccMag = Math.sqrt(
    userAccG.x * userAccG.x + userAccG.y * userAccG.y + userAccG.z * userAccG.z
  );

  const meetsRotation = rotY > PHONE_HANDLING_ROTATION_RADS || rotZ > PHONE_HANDLING_ROTATION_RADS;
  const meetsAcceleration = userAccMag > PHONE_HANDLING_ACCEL_G;

  return meetsRotation && meetsAcceleration;
}

/**
 * Evaluates all detectors on the current sensor buffers and returns detected EventTypes.
 */
export function runEventDetection(
  accelBuffer: AccelReading[],
  gyroBuffer: GyroReading[],
  latestDeviceMotion: DeviceMotionReading | null
): EventType[] {
  const events: EventType[] = [];

  if (detectHarshBraking(accelBuffer)) {
    events.push('HARSH_BRAKING');
  }
  if (detectHarshAcceleration(accelBuffer)) {
    events.push('HARSH_ACCELERATION');
  }
  if (detectSharpTurn(gyroBuffer)) {
    events.push('SHARP_TURN');
  }
  if (detectAggressiveSteering(gyroBuffer)) {
    events.push('AGGRESSIVE_STEERING');
  }
  if (detectExcessiveMovement(accelBuffer)) {
    events.push('EXCESSIVE_MOVEMENT');
  }
  if (detectPhoneHandling(latestDeviceMotion)) {
    events.push('PHONE_HANDLING');
  }

  return events;
}
