import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoNavigationProps {
  onNavigate: () => Promise<void>;
  countdownSeconds?: number;
}

export const useAutoNavigation = ({ onNavigate, countdownSeconds = 5 }: UseAutoNavigationProps) => {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isNavigating, setIsNavigating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const navigationPromiseRef = useRef<Promise<void> | null>(null);

  const clearCountDownTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }
  
  const startAutoNavigation = () => {
    setIsActive(true);
    clearCountDownTimer();
  };

  const cancelAutoNavigation = () => {
    setIsActive(false);
    clearInterval(timerRef.current)
  };

  const proceedImmediately = useCallback(async () => {
    // Prevent multiple simultaneous navigation attempts
    if (navigationPromiseRef.current) {
      console.log('Navigation already in progress, skipping');
      return;
    }

    setIsActive(false);
    setIsNavigating(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      clearCountDownTimer();
    }

    const navigationPromise = (async () => {
      try {
        console.log('Auto-navigation: Starting navigation');
        await onNavigate();
        console.log('Auto-navigation: Navigation completed successfully');
      } catch (error) {
        console.error('Auto-navigation: Error during navigation:', error);
        throw error; // Re-throw to handle in UI if needed
      } finally {
        setIsNavigating(false);
        setCountdown(countdownSeconds);
        navigationPromiseRef.current = null;
      }
    })();

    navigationPromiseRef.current = navigationPromise;
    return navigationPromise;
  }, [onNavigate, countdownSeconds]);

  // Countdown effect with proper async handling
  useEffect(() => {
    if (isActive && countdown > 0) {
      timerRef.current = setTimeout(async () => {
        const newCountdown = countdown - 1;
        
        if (newCountdown <= 0) {
          // Auto proceed when countdown reaches 0
          setCountdown(0);
          try {
            await proceedImmediately();
          } catch (error) {
            console.error('Auto-navigation: Failed to proceed automatically:', error);
            // Reset state on error
            setIsActive(false);
            setIsNavigating(false);
            setCountdown(countdownSeconds);
          }
        } else {
          setCountdown(newCountdown);
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [isActive, countdown, proceedImmediately, countdownSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Cancel any pending navigation
      if (navigationPromiseRef.current) {
        console.log('Auto-navigation: Cleanup - canceling pending navigation');
        navigationPromiseRef.current = null;
      }
    };
  }, []);

  return {
    isActive,
    countdown,
    isNavigating,
    startAutoNavigation,
    cancelAutoNavigation,
    proceedImmediately
  };
};