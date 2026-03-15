import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PipelineCard, CardType } from '../types';
import { CardColors, CardIcons, Colors, Radius, Spacing, Typography } from '../theme';
import { useActiveCards } from '../store/useCardStore';
import PipelineListItem from '../components/PipelineListItem';
import CardDetailSheet from '../components/CardDetailSheet';
import AddCardModal from '../components/AddCardModal';

const FILTERS: Array<{ label: string; value: CardType | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: '✦ Task', value: 'task' },
  { label: '⬡ Link', value: 'link' },
  { label: '◈ Idea', value: 'idea' },
  { label: '▣ Note', value: 'note' },
  { label: '◎ Limit', value: 'limit' },
  { label: '↻ Recurrent', value: 'recurrent' },
  { label: '⁂ Random', value: 'random' },
];

export default function PipelineScreen() {
  const insets = useSafeAreaInsets();
  const activeCards = useActiveCards();
  const [filter, setFilter] = useState<CardType | 'all'>('all');
  const [detailCard, setDetailCard] = useState<PipelineCard | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const filteredCards = useMemo(
    () => (filter === 'all' ? activeCards : activeCards.filter((c) => c.type === filter)),
    [activeCards, filter]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>PIPELINE</Text>
          <Text style={styles.headerTitle}>All Cards</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item }) => {
          const isActive = filter === item.value;
          const accent = item.value !== 'all' ? CardColors[item.value]?.accent : Colors.task;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                isActive && { backgroundColor: (accent || Colors.task) + '20', borderColor: accent || Colors.task },
              ]}
              onPress={() => setFilter(item.value)}
            >
              <Text style={[styles.filterText, isActive && { color: accent || Colors.task }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Count */}
      <Text style={styles.countText}>
        {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PipelineListItem card={item} onPress={setDetailCard} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cards here yet</Text>
          </View>
        }
      />

      <CardDetailSheet card={detailCard} onClose={() => setDetailCard(null)} />
      <AddCardModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
    </View>
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
  addBtn: {
    backgroundColor: Colors.task + '20',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.task + '60',
  },
  addBtnText: {
    color: Colors.task,
    fontWeight: '700',
    fontSize: Typography.sm,
  },
  filterList: {
    flexGrow: 0,
    marginTop: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  filterText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  countText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.md,
  },
});
