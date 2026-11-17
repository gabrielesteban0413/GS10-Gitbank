import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  isAccelerometerAvailable,
  setUpdateInterval,
  subscribe,
  magnitude
} from '../services/sensorService';

export default function useAccelerometer(interval = 200, enabled = true) {
  const [reading, setReading] = useState({ x: 0, y: 0, z: 0 });
  const [active, setActive] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let subscription = null;
    let mounted = true;

    async function start() {
      if (!enabled) {
        setActive(false);
        return;
      }

      if (Platform.OS === 'web') {
        setAvailable(false);
        return;
      }

      const isAvailable = await isAccelerometerAvailable();
      if (!mounted) return;
      setAvailable(isAvailable);
      if (!isAvailable) return;

      setUpdateInterval(interval);
      subscription = subscribe((data) => {
        setReading(data);
      });
      setActive(true);
    }

    start();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.remove();
      }
      setActive(false);
    };
  }, [interval, enabled]);

  return {
    reading,
    active,
    available,
    magnitude: magnitude(reading)
  };
}
