/**
 * Hook for managing rest timer between sets
 * Supports audio alerts, vibration, and configurable duration
 *
 * Uses timestamp-based timing to remain accurate even when the screen
 * locks or the browser throttles setInterval (mobile devices)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseRestTimerOptions {
  defaultRestSeconds?: number;
  audioEnabled?: boolean; // Note: Audio alerts are not yet implemented. This parameter is reserved for future use.
  vibrationEnabled?: boolean;
}

interface UseRestTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  startTimer: (seconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  extendTimer: (seconds: number) => void;
  resetTimer: () => void;
}

export function useRestTimer(
  options: UseRestTimerOptions = {}
): UseRestTimerReturn {
  const {
    defaultRestSeconds = 90,
    // audioEnabled - Reserved for future audio alerts implementation
    vibrationEnabled = true,
  } = options;

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Timestamp-based tracking for accuracy across screen locks
  const endTimeRef = useRef<number | null>(null);
  const pausedTimeRemainingRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const hasAlertedRef = useRef(false);

  const playAlert = useCallback(() => {
    // Prevent multiple alerts
    if (hasAlertedRef.current) return;
    hasAlertedRef.current = true;

    // Trigger vibration
    if (vibrationEnabled && 'vibrate' in navigator) {
      try {
        // Vibrate for 200ms, pause 100ms, vibrate 200ms
        navigator.vibrate([200, 100, 200]);
      } catch (error) {
        console.warn('Vibration failed:', error);
      }
    }

    // Note: Audio alerts can be added in the future with a proper sound file
    // For now, vibration provides sufficient feedback
  }, [vibrationEnabled]);

  // Calculate remaining time from end timestamp
  const calculateTimeRemaining = useCallback(() => {
    if (!endTimeRef.current) return 0;
    const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
    return Math.max(0, remaining);
  }, []);

  useEffect(() => {
    if (!isRunning || isPaused) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Use shorter interval (250ms) to catch up quickly after screen wake
    // First tick happens immediately (0ms delay), then every 250ms
    const tick = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        setIsComplete(true);
        playAlert();
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Schedule first update for next tick to avoid synchronous setState in effect
    const immediateId = window.setTimeout(tick, 0);
    intervalRef.current = window.setInterval(tick, 250);

    return () => {
      window.clearTimeout(immediateId);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, playAlert, calculateTimeRemaining]);

  // Also update on visibility change (when screen wakes up)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setIsRunning(false);
          setIsComplete(true);
          playAlert();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isPaused, calculateTimeRemaining, playAlert]);

  const startTimer = useCallback(
    (seconds?: number) => {
      const duration = seconds ?? defaultRestSeconds;
      endTimeRef.current = Date.now() + duration * 1000;
      hasAlertedRef.current = false;
      setTimeRemaining(duration);
      setIsRunning(true);
      setIsPaused(false);
      setIsComplete(false);
    },
    [defaultRestSeconds]
  );

  const pauseTimer = useCallback(() => {
    // Store remaining time when pausing
    pausedTimeRemainingRef.current = calculateTimeRemaining();
    setIsPaused(true);
  }, [calculateTimeRemaining]);

  const resumeTimer = useCallback(() => {
    // Recalculate end time based on remaining time when paused
    endTimeRef.current = Date.now() + pausedTimeRemainingRef.current * 1000;
    setIsPaused(false);
  }, []);

  const stopTimer = useCallback(() => {
    endTimeRef.current = null;
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setIsComplete(false);
  }, []);

  const extendTimer = useCallback(
    (seconds: number) => {
      if (endTimeRef.current) {
        endTimeRef.current += seconds * 1000;
        setTimeRemaining(calculateTimeRemaining());
      } else {
        setTimeRemaining((prev) => prev + seconds);
      }
      setIsComplete(false);
      hasAlertedRef.current = false;
    },
    [calculateTimeRemaining]
  );

  const resetTimer = useCallback(() => {
    endTimeRef.current = null;
    setTimeRemaining(defaultRestSeconds);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
  }, [defaultRestSeconds]);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    isComplete,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    extendTimer,
    resetTimer,
  };
}
