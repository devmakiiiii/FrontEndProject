import { useState, useEffect } from 'react';

export function useCountdown(endTime: Date) {
  const [timeLeft, setTimeLeft] = useState(() => {
    return Math.max(0, endTime.getTime() - Date.now());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime.getTime() - Date.now());
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return 'Ended';

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isEnded: timeLeft <= 0,
  };
}