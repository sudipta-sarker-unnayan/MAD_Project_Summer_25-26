import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../theme/colors';

export const SkeletonBox = ({ width = '100%', height = 16, radius = 8, style }) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.border }, animatedStyle, style]}
    />
  );
};