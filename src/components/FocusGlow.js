import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function FocusGlow({ color, size = 160, style }) {
  const pulse = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.2,
    transform: [{ scale: 0.88 + pulse.value * 0.2 }],
  }));

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600 }),
        withTiming(0, { duration: 2600 }),
      ),
      -1,
      false,
    );

    return () => cancelAnimation(pulse);
  }, [pulse]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.glow,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
});
