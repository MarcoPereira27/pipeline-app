import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography } from '../theme';

interface Props {
  current: number;
  limit: number;
  accent: string;
  size?: number;
}

export default function LimitProgress({ current, limit, accent, size = 72 }: Props) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / limit, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accent + '20'}
          strokeWidth={4}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accent}
          strokeWidth={4}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={[styles.current, { color: accent }]}>{current}</Text>
        <Text style={[styles.total, { color: accent + '80' }]}>/{limit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  current: {
    fontSize: Typography.lg,
    fontWeight: '800',
  },
  total: {
    fontSize: Typography.xs,
    fontWeight: '600',
  },
});
