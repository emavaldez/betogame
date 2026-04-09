import { useState, useEffect } from 'react';

export const useInteraction = (isPressed: boolean, onComplete: () => void, duration: number = 1000) => {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPressed) {
      setIsActive(true);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            onComplete();
            return 100;
          }
          return prev + 2; // Ajustar velocidad según necesidad
        });
      }, duration / 50);
    } else {
      setIsActive(false);
      setProgress(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPressed, onComplete, duration]);

  return { progress, isActive };
};
