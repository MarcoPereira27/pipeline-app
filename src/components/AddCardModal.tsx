import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardType, Priority, PipelineCard, RecurrentSchedule } from '../types';
import { CardColors, CardIcons, Colors, Radius, Spacing, Typography } from '../theme';
import { useCardStore } from '../store/useCardStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CARD_TYPES: { type: CardType; label: string; description: string }[] = [
  { type: 'task', label: 'Task', description: 'Something to do' },
  { type: 'link', label: 'Link', description: 'URL to revisit' },
  { type: 'idea', label: 'Idea', description: 'Capture a thought' },
  { type: 'note', label: 'Note', description: 'General note' },
  { type: 'limit', label: 'Limit', description: 'Check-in counter' },
  { type: 'recurrent', label: 'Recurrent', description: 'On a schedule' },
  { type: 'random', label: 'Random', description: 'Appears randomly' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AddCardModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { addCard } = useCardStore();

  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<CardType>('task');

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  // Limit card fields
  const [limitCount, setLimitCount] = useState('5');

  // Recurrent card fields
  const [recSchedule, setRecSchedule] = useState<RecurrentSchedule>('daily');
  const [recDays, setRecDays] = useState<number[]>([1]); // Monday default
  const [recMonthDay, setRecMonthDay] = useState('1');

  // Random card fields
  const [windowStart, setWindowStart] = useState('09:00');
  const [windowEnd, setWindowEnd] = useState('20:00');
  const [timesPerDay, setTimesPerDay] = useState('2');

  const reset = useCallback(() => {
    setStep('type');
    setTitle('');
    setDescription('');
    setUrl('');
    setTags('');
    setPriority('medium');
    setLimitCount('5');
    setRecSchedule('daily');
    setRecDays([1]);
    setRecMonthDay('1');
    setWindowStart('09:00');
    setWindowEnd('20:00');
    setTimesPerDay('2');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleTypeSelect = useCallback((type: CardType) => {
    setSelectedType(type);
    setStep('details');
  }, []);

  const handleCreate = useCallback(() => {
    if (!title.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const base = {
      title: title.trim(),
      description: description.trim() || undefined,
      tags: parsedTags,
      priority,
      status: 'active' as const,
    };

    if (selectedType === 'task') {
      addCard({ ...base, type: 'task' });
    } else if (selectedType === 'link') {
      addCard({ ...base, type: 'link', url: url.trim() || 'https://' });
    } else if (selectedType === 'idea') {
      addCard({ ...base, type: 'idea' });
    } else if (selectedType === 'note') {
      addCard({ ...base, type: 'note' });
    } else if (selectedType === 'limit') {
      addCard({
        ...base,
        type: 'limit',
        limit: Math.max(1, parseInt(limitCount, 10) || 5),
        currentCount: 0,
        checkHistory: [],
      });
    } else if (selectedType === 'recurrent') {
      const days = recSchedule === 'weekly'
        ? recDays
        : recSchedule === 'monthly'
        ? [parseInt(recMonthDay, 10) || 1]
        : [];
      addCard({
        ...base,
        type: 'recurrent',
        schedule: recSchedule,
        scheduleDays: days,
      });
    } else if (selectedType === 'random') {
      addCard({
        ...base,
        type: 'random',
        windowStart,
        windowEnd,
        timesPerDay: Math.max(1, parseInt(timesPerDay, 10) || 2),
        timesShownToday: 0,
      });
    }

    handleClose();
  }, [
    title, description, url, tags, priority, selectedType,
    limitCount, recSchedule, recDays, recMonthDay,
    windowStart, windowEnd, timesPerDay, addCard, handleClose,
  ]);

  const colors = CardColors[selectedType];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.md }]}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={step === 'details' ? () => setStep('type') : handleClose}>
              <Text style={styles.backBtn}>{step === 'details' ? '← Back' : '✕'}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {step === 'type' ? 'Card Type' : `New ${selectedType} card`}
            </Text>
            {step === 'details' ? (
              <TouchableOpacity onPress={handleCreate} disabled={!title.trim()}>
                <Text style={[styles.createBtn, !title.trim() && styles.disabledBtn]}>
                  Create
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {step === 'type' ? (
            <TypeSelector onSelect={handleTypeSelect} />
          ) : (
            <ScrollView
              style={styles.flex}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Common fields */}
              <View style={styles.section}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What's on your mind?"
                  placeholderTextColor={Colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                  multiline
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Optional details..."
                  placeholderTextColor={Colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {selectedType === 'link' && (
                <View style={styles.section}>
                  <Text style={styles.label}>URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://..."
                    placeholderTextColor={Colors.textMuted}
                    value={url}
                    onChangeText={setUrl}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* Type-specific fields */}
              {selectedType === 'limit' && (
                <LimitFields limitCount={limitCount} setLimitCount={setLimitCount} accent={colors.accent} />
              )}
              {selectedType === 'recurrent' && (
                <RecurrentFields
                  schedule={recSchedule}
                  setSchedule={setRecSchedule}
                  days={recDays}
                  setDays={setRecDays}
                  monthDay={recMonthDay}
                  setMonthDay={setRecMonthDay}
                  accent={colors.accent}
                />
              )}
              {selectedType === 'random' && (
                <RandomFields
                  windowStart={windowStart}
                  setWindowStart={setWindowStart}
                  windowEnd={windowEnd}
                  setWindowEnd={setWindowEnd}
                  timesPerDay={timesPerDay}
                  setTimesPerDay={setTimesPerDay}
                  accent={colors.accent}
                />
              )}

              {/* Priority */}
              <View style={styles.section}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.row}>
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.chip,
                        priority === p && {
                          backgroundColor: colors.accent + '20',
                          borderColor: colors.accent,
                        },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={[styles.chipText, priority === p && { color: colors.accent }]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tags */}
              <View style={styles.section}>
                <Text style={styles.label}>Tags (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="work, personal, urgent..."
                  placeholderTextColor={Colors.textMuted}
                  value={tags}
                  onChangeText={setTags}
                  autoCapitalize="none"
                />
              </View>

              <View style={{ height: Spacing.xxl }} />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Type Selector ─────────────────────────────────────────────────────────────

function TypeSelector({ onSelect }: { onSelect: (type: CardType) => void }) {
  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <View style={styles.typeGrid}>
        {CARD_TYPES.map(({ type, label, description }) => {
          const colors = CardColors[type];
          return (
            <TouchableOpacity
              key={type}
              style={[styles.typeCard, { borderColor: colors.accent + '40', backgroundColor: colors.glow }]}
              onPress={() => onSelect(type)}
            >
              <Text style={[styles.typeIcon, { color: colors.accent }]}>{CardIcons[type]}</Text>
              <Text style={[styles.typeLabel, { color: colors.accent }]}>{label}</Text>
              <Text style={styles.typeDesc}>{description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Limit fields ──────────────────────────────────────────────────────────────

function LimitFields({
  limitCount,
  setLimitCount,
  accent,
}: {
  limitCount: string;
  setLimitCount: (v: string) => void;
  accent: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Check-in limit</Text>
      <Text style={styles.fieldHint}>Card completes when you reach this count</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 10"
        placeholderTextColor={Colors.textMuted}
        value={limitCount}
        onChangeText={setLimitCount}
        keyboardType="number-pad"
      />
    </View>
  );
}

// ─── Recurrent fields ──────────────────────────────────────────────────────────

function RecurrentFields({
  schedule, setSchedule, days, setDays, monthDay, setMonthDay, accent,
}: {
  schedule: RecurrentSchedule;
  setSchedule: (s: RecurrentSchedule) => void;
  days: number[];
  setDays: (d: number[]) => void;
  monthDay: string;
  setMonthDay: (d: string) => void;
  accent: string;
}) {
  const toggleDay = (d: number) => {
    setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Schedule</Text>
      <View style={styles.row}>
        {(['daily', 'weekly', 'monthly'] as RecurrentSchedule[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.chip,
              schedule === s && { backgroundColor: accent + '20', borderColor: accent },
            ]}
            onPress={() => setSchedule(s)}
          >
            <Text style={[styles.chipText, schedule === s && { color: accent }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {schedule === 'weekly' && (
        <View style={[styles.row, { marginTop: Spacing.md }]}>
          {DAY_LABELS.map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayChip,
                days.includes(index) && { backgroundColor: accent + '30', borderColor: accent },
              ]}
              onPress={() => toggleDay(index)}
            >
              <Text style={[styles.dayChipText, days.includes(index) && { color: accent }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {schedule === 'monthly' && (
        <>
          <Text style={[styles.fieldHint, { marginTop: Spacing.sm }]}>Day of month</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 15"
            placeholderTextColor={Colors.textMuted}
            value={monthDay}
            onChangeText={setMonthDay}
            keyboardType="number-pad"
          />
        </>
      )}
    </View>
  );
}

// ─── Random fields ─────────────────────────────────────────────────────────────

function RandomFields({
  windowStart, setWindowStart, windowEnd, setWindowEnd, timesPerDay, setTimesPerDay, accent,
}: {
  windowStart: string;
  setWindowStart: (v: string) => void;
  windowEnd: string;
  setWindowEnd: (v: string) => void;
  timesPerDay: string;
  setTimesPerDay: (v: string) => void;
  accent: string;
}) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>Time window</Text>
        <Text style={styles.fieldHint}>Card appears randomly within this window (HH:MM)</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="09:00"
            placeholderTextColor={Colors.textMuted}
            value={windowStart}
            onChangeText={setWindowStart}
          />
          <Text style={styles.timeSeparator}>→</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="20:00"
            placeholderTextColor={Colors.textMuted}
            value={windowEnd}
            onChangeText={setWindowEnd}
          />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Times per day</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 3"
          placeholderTextColor={Colors.textMuted}
          value={timesPerDay}
          onChangeText={setTimesPerDay}
          keyboardType="number-pad"
        />
      </View>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  backBtn: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  createBtn: {
    fontSize: Typography.md,
    color: Colors.task,
    fontWeight: '700',
  },
  disabledBtn: {
    color: Colors.textMuted,
  },
  placeholder: { width: 60 },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  typeCard: {
    width: '47%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typeIcon: {
    fontSize: 32,
  },
  typeLabel: {
    fontSize: Typography.md,
    fontWeight: '700',
  },
  typeDesc: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fieldHint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeInput: {
    flex: 1,
    textAlign: 'center',
  },
  timeSeparator: {
    color: Colors.textMuted,
    fontSize: Typography.lg,
    paddingHorizontal: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
  },
  chipText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
