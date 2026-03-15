import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';

import { PipelineCard, LimitCard, RecurrentCard, RandomCard } from '../types';
import { CardColors, CardIcons, Colors, Radius, Shadow, Spacing, Typography } from '../theme';
import { formatNextShow, formatSchedule } from '../utils/scheduling';
import { useCardStore } from '../store/useCardStore';
import CardBadge from './CardBadge';
import LimitProgress from './LimitProgress';
import PriorityDot from './PriorityDot';

const SWIPE_THRESHOLD = 100;
const CARD_WIDTH_FRACTION = 0.88;

interface Props {
  card: PipelineCard;
  index: number;
  totalVisible: number;
  onPress?: (card: PipelineCard) => void;
}

export default function SwipeableCard({ card, index, totalVisible, onPress }: Props) {
  const { markDone, sendToBottom, checkLimitCard } = useCardStore();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const colors = CardColors[card.type];
  const isTop = index === 0;

  // Stack peek effect: cards behind the top are scaled down and slightly offset
  const stackScale = isTop ? 1 : 1 - index * 0.04;
  const stackTranslateY = isTop ? 0 : index * 12;
  const stackOpacity = isTop ? 1 : Math.max(0, 1 - index * 0.25);

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.2;
      scale.value = interpolate(
        Math.abs(e.translationX),
        [0, SWIPE_THRESHOLD],
        [1, 0.97],
        Extrapolation.CLAMP
      );
    })
    .onEnd((e) => {
      const velocity = e.velocityX;
      const translation = e.translationX;

      if (translation > SWIPE_THRESHOLD || velocity > 800) {
        // Swipe right → mark done
        translateX.value = withTiming(500, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 }, () => {
          runOnJS(markDone)(card.id);
        });
      } else if (translation < -SWIPE_THRESHOLD || velocity < -800) {
        // Swipe left → send to bottom
        translateX.value = withTiming(-500, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 }, () => {
          runOnJS(sendToBottom)(card.id);
          translateX.value = 0;
          translateY.value = 0;
          opacity.value = 1;
          scale.value = 1;
        });
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        scale.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-200, 0, 200],
      [-12, 0, 12],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + stackTranslateY },
        { scale: scale.value * stackScale },
        { rotate: isTop ? `${rotate}deg` : '0deg' },
      ],
      opacity: opacity.value * stackOpacity,
    };
  });

  // Swipe indicators
  const doneIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const skipIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const handlePress = useCallback(() => {
    if (card.type === 'limit') {
      const limitCard = card as LimitCard;
      if (limitCard.currentCount < limitCard.limit) {
        checkLimitCard(card.id);
      }
    } else if (card.type === 'link' && (card as any).url) {
      Linking.openURL((card as any).url).catch(() => {});
    }
    onPress?.(card);
  }, [card, checkLimitCard, onPress]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
        {/* Swipe indicators */}
        {isTop && (
          <>
            <Animated.View style={[styles.indicator, styles.doneIndicator, doneIndicatorStyle]}>
              <Text style={styles.indicatorText}>DONE ✓</Text>
            </Animated.View>
            <Animated.View style={[styles.indicator, styles.skipIndicator, skipIndicatorStyle]}>
              <Text style={styles.indicatorText}>LATER →</Text>
            </Animated.View>
          </>
        )}

        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handlePress}
          disabled={!isTop}
          style={styles.touchable}
        >
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Glow border */}
            <View style={[styles.glowBorder, { borderColor: colors.accent + (isTop ? '40' : '20') }]} />

            {/* Header row */}
            <View style={styles.header}>
              <CardBadge type={card.type} />
              <View style={styles.headerRight}>
                <PriorityDot priority={card.priority} />
              </View>
            </View>

            {/* Card-type-specific content */}
            <View style={styles.body}>
              {card.type === 'limit' && (
                <LimitCardContent card={card as LimitCard} accent={colors.accent} />
              )}
              {card.type === 'recurrent' && (
                <RecurrentCardContent card={card as RecurrentCard} accent={colors.accent} />
              )}
              {card.type === 'random' && (
                <RandomCardContent card={card as RandomCard} accent={colors.accent} />
              )}
              {!['limit', 'recurrent', 'random'].includes(card.type) && (
                <DefaultCardContent card={card} accent={colors.accent} />
              )}
            </View>

            {/* Tags */}
            {card.tags.length > 0 && (
              <View style={styles.tags}>
                {card.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.accent + '15' }]}>
                    <Text style={[styles.tagText, { color: colors.accent }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Date */}
            <Text style={styles.date}>
              {format(parseISO(card.createdAt), 'MMM d, yyyy')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DefaultCardContent({ card, accent }: { card: PipelineCard; accent: string }) {
  return (
    <>
      <Text style={styles.title} numberOfLines={3}>{card.title}</Text>
      {card.description ? (
        <Text style={styles.description} numberOfLines={3}>{card.description}</Text>
      ) : null}
      {card.type === 'link' && (card as any).url ? (
        <Text style={[styles.url, { color: accent }]} numberOfLines={1}>
          {(card as any).url}
        </Text>
      ) : null}
    </>
  );
}

function LimitCardContent({ card, accent }: { card: LimitCard; accent: string }) {
  const remaining = card.limit - card.currentCount;
  return (
    <View style={styles.limitContainer}>
      <View style={styles.limitText}>
        <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
        {card.description ? (
          <Text style={styles.description} numberOfLines={2}>{card.description}</Text>
        ) : null}
        <Text style={[styles.limitHint, { color: accent }]}>
          {remaining > 0 ? `${remaining} check${remaining !== 1 ? 's' : ''} remaining` : 'Complete!'}
        </Text>
        <Text style={styles.tapHint}>Tap to check in</Text>
      </View>
      <LimitProgress current={card.currentCount} limit={card.limit} accent={accent} size={80} />
    </View>
  );
}

function RecurrentCardContent({ card, accent }: { card: RecurrentCard; accent: string }) {
  return (
    <>
      <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
      {card.description ? (
        <Text style={styles.description} numberOfLines={2}>{card.description}</Text>
      ) : null}
      <View style={[styles.scheduleChip, { backgroundColor: accent + '15', borderColor: accent + '40' }]}>
        <Text style={styles.scheduleIcon}>↻</Text>
        <Text style={[styles.scheduleText, { color: accent }]}>
          {formatSchedule(card)}
        </Text>
        <Text style={[styles.nextShow, { color: accent + '80' }]}>
          · Next: {formatNextShow(card.nextShowAt)}
        </Text>
      </View>
    </>
  );
}

function RandomCardContent({ card, accent }: { card: RandomCard; accent: string }) {
  const remaining = card.timesPerDay - card.timesShownToday;
  return (
    <>
      <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
      {card.description ? (
        <Text style={styles.description} numberOfLines={2}>{card.description}</Text>
      ) : null}
      <View style={[styles.scheduleChip, { backgroundColor: accent + '15', borderColor: accent + '40' }]}>
        <Text style={styles.scheduleIcon}>⁂</Text>
        <Text style={[styles.scheduleText, { color: accent }]}>
          {card.windowStart}–{card.windowEnd}
        </Text>
        <Text style={[styles.nextShow, { color: accent + '80' }]}>
          · {remaining}× today left
        </Text>
      </View>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  touchable: {
    width: '100%',
    borderRadius: Radius.xl,
    ...Shadow.lg,
  },
  card: {
    width: '100%',
    minHeight: 260,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 28,
  },
  description: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  url: {
    fontSize: Typography.sm,
    fontWeight: '500',
    marginTop: Spacing.xs,
    textDecorationLine: 'underline',
  },
  limitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  limitText: {
    flex: 1,
  },
  limitHint: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  tapHint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scheduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
    gap: 4,
  },
  scheduleIcon: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
  },
  scheduleText: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  nextShow: {
    fontSize: Typography.xs,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: Typography.xs,
    fontWeight: '500',
  },
  date: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  indicator: {
    position: 'absolute',
    top: 20,
    zIndex: 100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
  },
  doneIndicator: {
    left: 24,
    borderColor: Colors.done,
    backgroundColor: Colors.done + '20',
  },
  skipIndicator: {
    right: 24,
    borderColor: Colors.textSecondary,
    backgroundColor: Colors.bgElevated,
  },
  indicatorText: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: Typography.sm,
    letterSpacing: 1,
  },
});
