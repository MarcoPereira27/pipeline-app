import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  leftAction?: {
    label: string;
    onPress: () => void;
  };
}

export default function Header({ title, subtitle, rightAction, leftAction }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.row}>
        {leftAction ? (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.action}>
            <Text style={styles.actionText}>{leftAction.label}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}

        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.action}>
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 1,
  },
  action: {
    minWidth: 60,
    alignItems: 'center',
  },
  actionPlaceholder: {
    minWidth: 60,
  },
  actionText: {
    fontSize: Typography.md,
    color: Colors.task,
    fontWeight: '600',
  },
});
