import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { PipelineCard } from '../types';
import { CardColors, CardIcons, Colors, Radius, Spacing, Typography } from '../theme';
import { useArchivedCards, useCardStore } from '../store/useCardStore';
import CardDetailSheet from '../components/CardDetailSheet';

export default function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const archivedCards = useArchivedCards();
  const { restoreCard, deleteCard } = useCardStore();
  const [detailCard, setDetailCard] = useState<PipelineCard | null>(null);
  const [filter, setFilter] = useState<'all' | 'done' | 'archived'>('all');

  const filtered = filter === 'all'
    ? archivedCards
    : archivedCards.filter((c) => c.status === filter);

  const doneCount = archivedCards.filter((c) => c.status === 'done').length;
  const archivedCount = archivedCards.filter((c) => c.status === 'archived').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>PIPELINE</Text>
          <Text style={styles.headerTitle}>Archive</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: Colors.done }]}>{doneCount}</Text>
            <Text style={styles.statLabel}>done</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: Colors.textMuted }]}>{archivedCount}</Text>
            <Text style={styles.statLabel}>archived</Text>
          </View>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {(['all', 'done', 'archived'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.tabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArchiveItem
            card={item}
            onPress={() => setDetailCard(item)}
            onRestore={() => restoreCard(item.id)}
            onDelete={() => deleteCard(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◎</Text>
            <Text style={styles.emptyText}>Nothing here yet</Text>
          </View>
        }
      />

      <CardDetailSheet card={detailCard} onClose={() => setDetailCard(null)} />
    </View>
  );
}

function ArchiveItem({
  card, onPress, onRestore, onDelete,
}: {
  card: PipelineCard;
  onPress: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const colors = CardColors[card.type];
  const isDone = card.status === 'done';

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.itemIcon, { backgroundColor: colors.glow }]}>
        <Text style={[styles.itemIconText, { color: colors.accent + '80' }]}>
          {CardIcons[card.type]}
        </Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{card.title}</Text>
        <View style={styles.itemMeta}>
          <View style={[styles.statusBadge, isDone ? styles.doneBadge : styles.archivedBadge]}>
            <Text style={[styles.statusText, isDone ? styles.doneText : styles.archivedText]}>
              {isDone ? '✓ Done' : '⊘ Archived'}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {format(parseISO(card.updatedAt), 'MMM d')}
          </Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={onRestore} style={styles.miniBtn}>
          <Text style={styles.miniBtnText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={[styles.miniBtn, styles.deleteMiniBtn]}>
          <Text style={[styles.miniBtnText, styles.deleteText]}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLabel: {
    fontSize: Typography.xs,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 3,
  },
  headerTitle: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: Typography.xl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  tabActive: {
    backgroundColor: Colors.task + '20',
    borderColor: Colors.task,
  },
  tabText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.task,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    opacity: 0.8,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconText: {
    fontSize: Typography.lg,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: Typography.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  doneBadge: {
    backgroundColor: Colors.done + '15',
  },
  archivedBadge: {
    backgroundColor: Colors.textMuted + '15',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  doneText: {
    color: Colors.done,
  },
  archivedText: {
    color: Colors.textMuted,
  },
  dateText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  miniBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteMiniBtn: {
    borderColor: Colors.random + '40',
    backgroundColor: Colors.random + '10',
  },
  miniBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.md,
    fontWeight: '700',
  },
  deleteText: {
    color: Colors.random,
    fontSize: Typography.xs,
  },
  empty: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    color: Colors.textMuted,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.md,
  },
});
