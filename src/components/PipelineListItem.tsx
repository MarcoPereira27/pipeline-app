import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PipelineCard, LimitCard, RecurrentCard, RandomCard } from '../types';
import { CardColors, CardIcons, Colors, Radius, Spacing, Typography } from '../theme';
import { formatNextShow } from '../utils/scheduling';
import PriorityDot from './PriorityDot';

interface Props {
  card: PipelineCard;
  onPress: (card: PipelineCard) => void;
}

export default function PipelineListItem({ card, onPress }: Props) {
  const colors = CardColors[card.type];

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: colors.accent }]}
      onPress={() => onPress(card)}
      activeOpacity={0.7}
    >
      {/* Left accent stripe is handled by borderLeft */}

      <View style={styles.inner}>
        {/* Icon */}
        <View style={[styles.iconWrapper, { backgroundColor: colors.glow }]}>
          <Text style={[styles.icon, { color: colors.accent }]}>{CardIcons[card.type]}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{card.title}</Text>
          <Text style={styles.meta}>{renderMeta(card)}</Text>
        </View>

        {/* Right side */}
        <View style={styles.right}>
          <PriorityDot priority={card.priority} size={6} />
          {card.type === 'limit' && (
            <Text style={[styles.limitBadge, { color: colors.accent }]}>
              {(card as LimitCard).currentCount}/{(card as LimitCard).limit}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function renderMeta(card: PipelineCard): string {
  switch (card.type) {
    case 'limit': {
      const lc = card as LimitCard;
      return `${lc.limit - lc.currentCount} checks remaining`;
    }
    case 'recurrent': {
      const rc = card as RecurrentCard;
      return `Next: ${formatNextShow(rc.nextShowAt)}`;
    }
    case 'random': {
      const rnd = card as RandomCard;
      return `${rnd.windowStart}–${rnd.windowEnd} · ${rnd.timesPerDay}×/day`;
    }
    case 'link':
      return (card as any).url || card.type;
    default:
      return card.description || card.type;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: Typography.lg,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: Typography.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  limitBadge: {
    fontSize: Typography.xs,
    fontWeight: '700',
  },
});
