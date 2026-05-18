
'use client';

import { useEffect, useCallback, useRef } from 'react';

interface UseInactivityTimerProps {
  timeoutMilliseconds: number;
  onTimeout: () => void;
  isActive: boolean; // To control whether the timer should be running
}

export function useInactivityTimer({
  timeoutMilliseconds,
  onTimeout,
  isActive,
}: UseInactivityTimerProps) {
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
    }
    // Only set a new timer if the hook is supposed to be active
    if (isActive) {
      timerIdRef.current = setTimeout(onTimeout, timeoutMilliseconds);
    }
  }, [onTimeout, timeoutMilliseconds, isActive]);

  useEffect(() => {
    // If not active, ensure any existing timer is cleared and do nothing else
    if (!isActive) {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }

    // Start the timer initially if active
    resetTimer();

    const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];

    // Event handler for detected activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners for various activity types
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup function to remove event listeners and clear the timer
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, isActive]); // Dependencies: resetTimer will change if its own dependencies change. isActive controls overall behavior.
}
