import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSensorData } from './useSensorData';
import { runEventDetection, AccelReading, GyroReading } from '../detection/detector';
import { calculateSafetyScore } from '../scoring/scoreEngine';
import { EventType } from '../constants/THRESHOLDS';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

// Debounce limits per event type
const DEBOUNCE_WINDOWS: Record<EventType, number> = {
  HARSH_BRAKING: 2000,
  HARSH_ACCELERATION: 2000,
  SHARP_TURN: 1500,
  AGGRESSIVE_STEERING: 1000,
  EXCESSIVE_MOVEMENT: 3000,
  PHONE_HANDLING: 5000,
};

export interface DrivingEvent {
  type: EventType;
  timestamp: number;
}

export interface DriveSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  score: number;
  rating: string;
  events: DrivingEvent[];
  eventCounts: Record<EventType, number>;
}

interface SessionState {
  isActive: boolean;
  startTime: number | null;
  duration: number; // seconds
  events: DrivingEvent[];
  eventCounts: Record<EventType, number>;
  score: number;
  heading: number | null;
}

type SessionAction =
  | { type: 'START'; startTime: number }
  | { type: 'TICK' }
  | { type: 'ADD_EVENTS'; events: DrivingEvent[] }
  | { type: 'UPDATE_HEADING'; heading: number | null }
  | { type: 'RESET' };

const initialEventCounts: Record<EventType, number> = {
  HARSH_BRAKING: 0,
  HARSH_ACCELERATION: 0,
  SHARP_TURN: 0,
  AGGRESSIVE_STEERING: 0,
  EXCESSIVE_MOVEMENT: 0,
  PHONE_HANDLING: 0,
};

const initialState: SessionState = {
  isActive: false,
  startTime: null,
  duration: 0,
  events: [],
  eventCounts: { ...initialEventCounts },
  score: 100,
  heading: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START':
      return {
        ...initialState,
        isActive: true,
        startTime: action.startTime,
      };
    case 'TICK':
      return {
        ...state,
        duration: state.duration + 1,
      };
    case 'ADD_EVENTS': {
      const newEvents = [...state.events, ...action.events];
      const newEventCounts = { ...state.eventCounts };
      action.events.forEach((evt) => {
        newEventCounts[evt.type] = (newEventCounts[evt.type] || 0) + 1;
      });

      const { score } = calculateSafetyScore(newEventCounts);

      return {
        ...state,
        events: newEvents,
        eventCounts: newEventCounts,
        score,
      };
    }
    case 'UPDATE_HEADING':
      return {
        ...state,
        heading: action.heading,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const STORAGE_KEY = '@DriveSafe:session_history';
const KEEP_AWAKE_TAG = 'DriveSafe:Session';

function useDriveSessionSource() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const sensor = useSensorData();

  // Refs for tracking rolling sensor data (strictly max 500ms history)
  const accelBufferRef = useRef<AccelReading[]>([]);
  const gyroBufferRef = useRef<GyroReading[]>([]);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Debouncing record
  const lastEventTimesRef = useRef<Record<EventType, number>>({
    HARSH_BRAKING: 0,
    HARSH_ACCELERATION: 0,
    SHARP_TURN: 0,
    AGGRESSIVE_STEERING: 0,
    EXCESSIVE_MOVEMENT: 0,
    PHONE_HANDLING: 0,
  });

  const activeSessionRef = useRef<boolean>(false);
  activeSessionRef.current = state.isActive;

  const currentScoreRef = useRef(100);
  useEffect(() => {
    currentScoreRef.current = state.score;
  }, [state.score]);

  // Load history from AsyncStorage (returns last 5 sessions)
  const getSessionHistory = useCallback(async (): Promise<DriveSession[]> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DriveSession[];
        return parsed.slice(0, 5); // ensure only last 5 are fetched
      }
    } catch (e) {
      console.warn('Failed to load drive session history:', e);
    }
    return [];
  }, []);

  // Save session to history in AsyncStorage
  const saveSessionToHistory = useCallback(
    async (session: DriveSession) => {
      try {
        const history = await getSessionHistory();
        const updated = [session, ...history].slice(0, 5); // store last 5 sessions
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save drive session:', e);
      }
    },
    [getSessionHistory]
  );

  // Stop the driving session and save it
  const endDrive = useCallback(async (): Promise<DriveSession | null> => {
    if (!state.isActive || !state.startTime) return null;

    // Stop keep awake screen lock
    try {
      await deactivateKeepAwake(KEEP_AWAKE_TAG);
    } catch (e) {
      console.warn('Keep awake deactivation failed', e);
    }

    // Stop sensor readings
    sensor.stopSubscriptions();

    // Stop duration timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const endTime = Date.now();
    const finalScoreInfo = calculateSafetyScore(state.eventCounts);

    const completedSession: DriveSession = {
      id: `drive_${state.startTime}`,
      startTime: state.startTime,
      endTime,
      duration: state.duration,
      score: state.score,
      rating: finalScoreInfo.rating,
      events: state.events,
      eventCounts: state.eventCounts,
    };

    await saveSessionToHistory(completedSession);
    
    // Save locally to AsyncStorage as "last_session" for quick references
    try {
      await AsyncStorage.setItem('@DriveSafe:last_session', JSON.stringify(completedSession));
    } catch (e) {
      console.warn('Failed to save last session:', e);
    }

    dispatch({ type: 'RESET' });
    return completedSession;
  }, [state, sensor, saveSessionToHistory]);

  // Start the driving session
  const startDrive = useCallback(async (forceSimulate = false): Promise<boolean> => {
    dispatch({ type: 'RESET' });
    const startTime = Date.now();
    dispatch({ type: 'START', startTime });

    // Enable keep awake lock
    try {
      await activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    } catch (e) {
      console.warn('Keep awake activation failed', e);
    }

    // Reset buffer caches
    accelBufferRef.current = [];
    gyroBufferRef.current = [];
    Object.keys(lastEventTimesRef.current).forEach((key) => {
      lastEventTimesRef.current[key as EventType] = 0;
    });

    // If not forcing simulation, perform formal permission gate check
    if (!forceSimulate) {
      const granted = await sensor.requestPermissions();
      if (!granted) {
        dispatch({ type: 'RESET' });
        return false;
      }
    }

    // Start sensor streams (subscribes to available sensors, whether permissions were formally checked or not)
    sensor.startSubscriptions((data) => {
      const now = Date.now();

      // 1. Enqueue accelerometer
      accelBufferRef.current.push(data.accel);

      // 2. Enqueue gyroscope
      gyroBufferRef.current.push(data.gyro);

      // 3. Prune buffers to maintain STRICTLY maximum 500ms history
      accelBufferRef.current = accelBufferRef.current.filter(
        (r) => now - r.timestamp <= 500
      );
      gyroBufferRef.current = gyroBufferRef.current.filter(
        (r) => now - r.timestamp <= 500
      );

      // 4. Update heading in state (optional, throttled)
      if (data.heading !== null) {
        dispatch({ type: 'UPDATE_HEADING', heading: data.heading });
      }

      // 5. Run pure detectors on rolling buffer
      const detectedEventTypes = runEventDetection(
        accelBufferRef.current,
        gyroBufferRef.current,
        data.motion
      );

      if (detectedEventTypes.length > 0) {
        const eventsToLog: DrivingEvent[] = [];

        detectedEventTypes.forEach((type) => {
          const lastTriggered = lastEventTimesRef.current[type];
          const debounceMs = DEBOUNCE_WINDOWS[type];

          // Apply event debounce
          if (now - lastTriggered >= debounceMs) {
            lastEventTimesRef.current[type] = now;
            eventsToLog.push({ type, timestamp: now });
          }
        });

        // Batch state update for detected events
        if (eventsToLog.length > 0) {
          dispatch({ type: 'ADD_EVENTS', events: eventsToLog });
        }
      }
    });

    // Start timer increment
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return true;
  }, [sensor]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isActive: state.isActive,
    startTime: state.startTime,
    duration: state.duration,
    events: state.events,
    eventCounts: state.eventCounts,
    score: state.score,
    heading: state.heading,
    permissionsGranted: sensor.permissionsGranted,
    sensorAvailability: sensor.sensorAvailability,
    startDrive,
    endDrive,
    getSessionHistory,
    requestPermissions: sensor.requestPermissions,
  };
}

// 1. Create Context
const DriveSessionContext = createContext<ReturnType<typeof useDriveSessionSource> | null>(null);

// 2. Provider component to wrap RootLayout
export function DriveSessionProvider({ children }: { children: React.ReactNode }) {
  const value = useDriveSessionSource();
  return React.createElement(DriveSessionContext.Provider, { value }, children);
}

// 3. Shared Context consumer hook
export function useDriveSession() {
  const context = useContext(DriveSessionContext);
  if (!context) {
    throw new Error('useDriveSession must be used within a DriveSessionProvider');
  }
  return context;
}
