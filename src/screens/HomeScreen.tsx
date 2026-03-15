import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { PipelineCard } from '../types';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { useActiveCards, useCardStore } from '../store/useCardStore';
import CardStack from '../components/CardStack';
import AddCardModal from '../components/AddCardModal';
import CardDetailSheet from '../components/CardDetailSheet';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const activeCards = useActiveCards();
  const { processScheduledCards } = useCardStore();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailCard, setDetailCard] = useState<PipelineCard | null>(null);

  // Process scheduled cards on mount and every minute
  useEffect(() => {
    processScheduledCards();
    const interval = setInterval(processScheduledCards, 60 * 1000);
    return () => clearInterval(interval);
  }, [processScheduledCards]);

  // Subtle pulsing animation for the + button
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCardPress = useCallback((card: PipelineCard) => {
    setDetailCard(card);
  }, []);

  const countByType = activeCards.reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appName}>PIPELINE</Text>
          <Text style={styles.cardCount}>
            {activeCards.length} card{activeCards.length !== 1 ? 's' : ''} in stack
          </Text>
        </View>

        {/* Mini stats */}
        <View style={styles.stats}>
          {Object.entries(countByType).slice(0, 3).map(([type, count]) => (
            <View key={type} style={styles.statBubble}>
              <Text style={styles.statCount}>{count}</Text>
              <Text style={styles.statType}>{type[0].toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Swipe hints */}
      {activeCards.length > 0 && (
        <View style={styles.hints}>
          <Text style={styles.hint}>← skip</Text>
          <Text style={styles.hintCenter}>swipe to act</Text>
          <Text style={styles.hint}>done →</Text>
        </View>
      )}

      {/* Card Stack */}
      <View style={styles.stackArea}>
        <CardStack cards={activeCards} onCardPress={handleCardPress} />
      </View>

      {/* FAB */}
      <Animated.View style={[styles.fabWrapper, fabStyle]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      <AddCardModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
      <CardDetailSheet card={detailCard} onClose={() => setDetailCard(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: {
    fontSize: Typography.xs,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 3,
  },
  cardCount: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  statBubble: {
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minWidth: 36,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCount: {
    fontSize: Typography.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statType: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  hints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  hintCenter: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: '500',
    opacity: 0.5,
  },
  stackArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.task,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.task,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  fabText: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '300',
    lineHeight: 36,
  },
});
