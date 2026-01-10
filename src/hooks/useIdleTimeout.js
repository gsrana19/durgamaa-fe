import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle idle timeout
 * @param {number} timeoutMinutes - Timeout duration in minutes
 * @param {function} onTimeout - Callback function when timeout occurs
 */
export const useIdleTimeout = (timeoutMinutes = 5, onTimeout) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning at 4 minutes (1 minute before logout)
    warningTimeoutRef.current = setTimeout(() => {
      console.log('Session will expire in 1 minute due to inactivity');
    }, (timeoutMinutes - 1) * 60 * 1000);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      console.log('Session expired due to inactivity');
      if (onTimeout) {
        onTimeout();
      } else {
        // Default behavior: logout and redirect
        localStorage.removeItem('isAuthenticated');
        navigate('/admin/login', { 
          state: { message: 'Session expired due to inactivity. Please login again.' }
        });
      }
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, onTimeout, navigate]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Reset timer on any user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [resetTimer]);

  return { resetTimer };
};

