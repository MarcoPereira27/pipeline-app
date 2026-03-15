import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardType } from '../types';
import { CardColors, CardIcons, Colors, Radius, Spacing, Typography } from '../theme';

interface Props {
  type: CardType;
}

export default function CardBadge({ type }: Props) {
  const colors = CardColors[type];
  return (
    <View style={[styles.badge, { borderColor: colors.accent + '60', backgroundColor: colors.glow }]}>
      <Text style={[styles.icon, { color: colors.accent }]}>{CardIcons[type]}</Text>
      <Text style={[styles.label, { color: colors.accent }]}>{type.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  icon: {
    fontSize: Typography.sm,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
