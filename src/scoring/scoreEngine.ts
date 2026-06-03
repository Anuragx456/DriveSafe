import { EventType, EVENT_DETAILS } from '../constants/THRESHOLDS';

export type SafetyRating = 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';

export interface ScoreDetails {
  score: number;
  rating: SafetyRating;
  color: string;
  deductions: Record<EventType, number>;
}

/**
 * Calculates safety rating information based on a base score of 100.
 */
export function getRatingForScore(score: number): { rating: SafetyRating; color: string } {
  if (score >= 90) {
    return { rating: 'Excellent', color: '#34C759' }; // Green
  } else if (score >= 75) {
    return { rating: 'Good', color: '#14B8A6' }; // Teal
  } else if (score >= 60) {
    return { rating: 'Fair', color: '#FF9500' }; // Amber/Orange
  } else {
    return { rating: 'Needs Improvement', color: '#FF3B30' }; // Red
  }
}

/**
 * Pure function to calculate current driving score and rating details
 * based on logged events.
 * 
 * @param eventCounts Map of EventType to total occurrences.
 * @returns ScoreDetails containing the calculated score, rating, color, and deduction break-down.
 */
export function calculateSafetyScore(eventCounts: Partial<Record<EventType, number>>): ScoreDetails {
  let score = 100;
  const deductions: Record<EventType, number> = {
    HARSH_BRAKING: 0,
    HARSH_ACCELERATION: 0,
    SHARP_TURN: 0,
    AGGRESSIVE_STEERING: 0,
    EXCESSIVE_MOVEMENT: 0,
    PHONE_HANDLING: 0,
  };

  // Process deductions for each event type
  (Object.keys(EVENT_DETAILS) as EventType[]).forEach((type) => {
    const count = eventCounts[type] || 0;
    const deductionPerEvent = EVENT_DETAILS[type].deduction;
    const totalDeduction = count * deductionPerEvent;
    deductions[type] = totalDeduction;
    score -= totalDeduction;
  });

  // Deductions are subtracted directly, allowing score to go below 0 (negative scoring)

  const { rating, color } = getRatingForScore(score);

  return {
    score,
    rating,
    color,
    deductions,
  };
}
