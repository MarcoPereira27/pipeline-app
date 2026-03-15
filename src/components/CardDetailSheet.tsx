import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';

import { PipelineCard, LimitCard, RecurrentCard, RandomCard } from '../types';
import { CardColors, CardIcons, Colors, Radius, Spacing, Typography } from '../theme';
import { formatNextShow, formatSchedule } from '../utils/scheduling';
import { useCardStore } from '../store/useCardStore';
import LimitProgress from './LimitProgress';
import CardBadge from './CardBadge';

interface Props {
  card: PipelineCard | null;
  onClose: () => void;
}

export default function CardDetailSheet({ card, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { markDone, sendToBottom, archiveCard, deleteCard, checkLimitCard, popToTop } = useCardStore();

  const handleDelete = useCallback(() => {
    if (!card) return;
    Alert.alert('Delete Card', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCard(card.id);
          onClose();
        },
      },
    ]);
  }, [card, deleteCard, onClose]);

  if (!card) return null;

  const colors = CardColors[card.type];

  return (
    <Modal
      visible={!!card}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
          <CardBadge type={card.type} />
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteBtn}>Delete</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
          {/* Card preview */}
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardPreview}
          >
            <View style={[styles.previewBorder, { borderColor: colors.accent + '30' }]} />
            <Text style={styles.previewTitle}>{card.title}</Text>
            {card.description ? (
              <Text style={styles.previewDescription}>{card.description}</Text>
            ) : null}

            {card.type === 'limit' && (
              <View style={styles.previewExtra}>
                <LimitProgress
                  current={(card as LimitCard).currentCount}
                  limit={(card as LimitCard).limit}
                  accent={colors.accent}
                  size={64}
                />
              </View>
            )}
          </LinearGradient>

          {/* Details section */}
          <View style={styles.details}>
            {card.type === 'limit' && <LimitDetail card={card as LimitCard} accent={colors.accent} />}
            {card.type === 'recurrent' && <RecurrentDetail card={card as RecurrentCard} accent={colors.accent} />}
            {card.type === 'random' && <RandomDetail card={card as RandomCard} accent={colors.accent} />}
            {card.type === 'link' && (card as any).url && (
              <DetailRow label="URL">
                <TouchableOpacity onPress={() => Linking.openURL((card as any).url)}>
                  <Text style={[styles.linkText, { color: colors.accent }]} numberOfLines={2}>
                    {(card as any).url}
                  </Text>
                </TouchableOpacity>
              </DetailRow>
            )}

            <DetailRow label="Priority">
              <Text style={styles.detailValue}>{card.priority}</Text>
            </DetailRow>

            <DetailRow label="Created">
              <Text style={styles.detailValue}>
                {format(parseISO(card.createdAt), 'MMM d, yyyy · HH:mm')}
              </Text>
            </DetailRow>

            {card.tags.length > 0 && (
              <DetailRow label="Tags">
                <View style={styles.tagsRow}>
                  {card.tags.map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.accent + '15' }]}>
                      <Text style={[styles.tagText, { color: colors.accent }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </DetailRow>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {card.type === 'limit' && (card as LimitCard).currentCount < (card as LimitCard).limit && (
              <ActionButton
                label={`Check In (${(card as LimitCard).currentCount}/${(card as LimitCard).limit})`}
                accent={colors.accent}
                onPress={() => { checkLimitCard(card.id); onClose(); }}
              />
            )}
            <ActionButton
              label="Pop to Top"
              accent={Colors.textSecondary}
              onPress={() => { popToTop(card.id); onClose(); }}
            />
            <ActionButton
              label="Send to Bottom"
              accent={Colors.textSecondary}
              onPress={() => { sendToBottom(card.id); onClose(); }}
            />
            <ActionButton
              label="Mark Done"
              accent={Colors.done}
              onPress={() => { markDone(card.id); onClose(); }}
            />
            <ActionButton
              label="Archive"
              accent={Colors.textMuted}
              onPress={() => { archiveCard(card.id); onClose(); }}
            />
          </View>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailContent}>{children}</View>
    </View>
  );
}

function ActionButton({
  label, accent, onPress,
}: {
  label: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { borderColor: accent + '40', backgroundColor: accent + '10' }]}
      onPress={onPress}
    >
      <Text style={[styles.actionBtnText, { color: accent }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function LimitDetail({ card, accent }: { card: LimitCard; accent: string }) {
  return (
    <DetailRow label="Progress">
      <Text style={styles.detailValue}>
        {card.currentCount} / {card.limit} check-ins
      </Text>
    </DetailRow>
  );
}

function RecurrentDetail({ card, accent }: { card: RecurrentCard; accent: string }) {
  return (
    <>
      <DetailRow label="Schedule">
        <Text style={styles.detailValue}>{formatSchedule(card)}</Text>
      </DetailRow>
      <DetailRow label="Next pop">
        <Text style={styles.detailValue}>{formatNextShow(card.nextShowAt)}</Text>
      </DetailRow>
    </>
  );
}

function RandomDetail({ card, accent }: { card: RandomCard; accent: string }) {
  return (
    <>
      <DetailRow label="Window">
        <Text style={styles.detailValue}>{card.windowStart} – {card.windowEnd}</Text>
      </DetailRow>
      <DetailRow label="Times/day">
        <Text style={styles.detailValue}>{card.timesPerDay}× (shown today: {card.timesShownToday})</Text>
      </DetailRow>
      <DetailRow label="Next pop">
        <Text style={styles.detailValue}>{formatNextShow(card.nextShowAt)}</Text>
      </DetailRow>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  closeBtn: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    fontWeight: '500',
    padding: Spacing.xs,
  },
  deleteBtn: {
    fontSize: Typography.sm,
    color: Colors.random,
    fontWeight: '600',
  },
  cardPreview: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  previewBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  previewDescription: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  previewExtra: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  details: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  detailContent: {
    flex: 2,
    alignItems: 'flex-end',
  },
  detailValue: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
  },
  linkText: {
    fontSize: Typography.sm,
    fontWeight: '500',
    textDecorationLine: 'underline',
    textAlign: 'right',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'flex-end',
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
  actions: {
    gap: Spacing.sm,
  },
  actionBtn: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: Typography.md,
    fontWeight: '600',
  },
});
