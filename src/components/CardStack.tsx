import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PipelineCard } from '../types';
import { Colors, Spacing, Typography } from '../theme';
import SwipeableCard from './SwipeableCard';

const VISIBLE_CARDS = 3;

interface Props {
  cards: PipelineCard[];
  onCardPress?: (card: PipelineCard) => void;
}

export default function CardStack({ cards, onCardPress }: Props) {
  if (cards.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>◈</Text>
        <Text style={styles.emptyTitle}>Pipeline is clear</Text>
        <Text style={styles.emptySubtitle}>Add cards to get started</Text>
      </View>
    );
  }

  const visibleCards = cards.slice(0, VISIBLE_CARDS);

  return (
    <View style={styles.stack}>
      {/* Render from bottom to top so top card is on top */}
      {[...visibleCards].reverse().map((card, reversedIndex) => {
        const index = visibleCards.length - 1 - reversedIndex;
        return (
          <SwipeableCard
            key={card.id}
            card={card}
            index={index}
            totalVisible={visibleCards.length}
            onPress={onCardPress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 56,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: Typography.md,
    color: Colors.textMuted,
  },
});
