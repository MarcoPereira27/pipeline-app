import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Priority } from '../types';
import { Colors } from '../theme';

const PRIORITY_COLOR: Record<Priority, string> = {
  low: Colors.priorityLow,
  medium: Colors.priorityMedium,
  high: Colors.priorityHigh,
};

interface Props {
  priority: Priority;
  size?: number;
}

export default function PriorityDot({ priority, size = 8 }: Props) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: PRIORITY_COLOR[priority],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    marginRight: 6,
  },
});
