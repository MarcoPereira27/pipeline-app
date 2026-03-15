import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
  CardStore,
  PipelineCard,
  LimitCard,
  RecurrentCard,
  RandomCard,
} from '../types';
import { computeNextRecurrentDate, computeNextRandomTime, isToday } from '../utils/scheduling';

const STACK_ORDER_STEP = 1000;

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],

      addCard: (cardData) => {
        const { cards } = get();
        const activeCards = cards.filter((c) => c.status === 'active');
        const maxOrder = activeCards.length > 0
          ? Math.max(...activeCards.map((c) => c.stackOrder))
          : 0;

        const now = new Date().toISOString();
        const newCard: PipelineCard = {
          ...cardData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          stackOrder: maxOrder + STACK_ORDER_STEP,
        } as PipelineCard;

        // For recurrent cards, compute next show date
        if (newCard.type === 'recurrent') {
          const recCard = newCard as RecurrentCard;
          recCard.nextShowAt = computeNextRecurrentDate(recCard)?.toISOString();
        }

        // For random cards, compute next show time
        if (newCard.type === 'random') {
          const randCard = newCard as RandomCard;
          randCard.nextShowAt = computeNextRandomTime(randCard)?.toISOString();
        }

        set((state) => ({ cards: [...state.cards, newCard] }));
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? { ...card, ...updates, updatedAt: new Date().toISOString() } as PipelineCard
              : card
          ),
        }));
      },

      deleteCard: (id) => {
        set((state) => ({ cards: state.cards.filter((c) => c.id !== id) }));
      },

      checkLimitCard: (id) => {
        const { cards } = get();
        const card = cards.find((c) => c.id === id) as LimitCard | undefined;
        if (!card || card.type !== 'limit') return;

        const now = new Date().toISOString();
        const newCount = card.currentCount + 1;
        const isDone = newCount >= card.limit;

        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id
              ? {
                  ...c,
                  currentCount: newCount,
                  checkHistory: [...(c as LimitCard).checkHistory, now],
                  status: isDone ? 'done' : 'active',
                  updatedAt: now,
                } as PipelineCard
              : c
          ),
        }));
      },

      markDone: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, status: 'done', updatedAt: now } as PipelineCard : c
          ),
        }));
      },

      sendToBottom: (id) => {
        const { cards } = get();
        const activeCards = cards.filter((c) => c.status === 'active');
        const maxOrder = activeCards.length > 0
          ? Math.max(...activeCards.map((c) => c.stackOrder))
          : 0;

        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id
              ? { ...c, stackOrder: maxOrder + STACK_ORDER_STEP, updatedAt: new Date().toISOString() } as PipelineCard
              : c
          ),
        }));
      },

      popToTop: (id) => {
        const { cards } = get();
        const activeCards = cards.filter((c) => c.status === 'active');
        const minOrder = activeCards.length > 0
          ? Math.min(...activeCards.map((c) => c.stackOrder))
          : 0;

        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id
              ? { ...c, stackOrder: minOrder - STACK_ORDER_STEP, updatedAt: new Date().toISOString() } as PipelineCard
              : c
          ),
        }));
      },

      archiveCard: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, status: 'archived', updatedAt: now } as PipelineCard : c
          ),
        }));
      },

      restoreCard: (id) => {
        const { cards } = get();
        const activeCards = cards.filter((c) => c.status === 'active');
        const maxOrder = activeCards.length > 0
          ? Math.max(...activeCards.map((c) => c.stackOrder))
          : 0;
        const now = new Date().toISOString();

        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id
              ? { ...c, status: 'active', stackOrder: maxOrder + STACK_ORDER_STEP, updatedAt: now } as PipelineCard
              : c
          ),
        }));
      },

      processScheduledCards: () => {
        const { cards, popToTop } = get();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        cards.forEach((card) => {
          if (card.status !== 'active') return;

          if (card.type === 'recurrent') {
            const recCard = card as RecurrentCard;
            if (recCard.nextShowAt && new Date(recCard.nextShowAt) <= now) {
              popToTop(card.id);
              const updated = { ...recCard, lastShownAt: now.toISOString() };
              const nextDate = computeNextRecurrentDate(updated);
              get().updateCard(card.id, {
                lastShownAt: now.toISOString(),
                nextShowAt: nextDate?.toISOString(),
              } as Partial<RecurrentCard>);
            }
          }

          if (card.type === 'random') {
            const randCard = card as RandomCard;
            const lastDate = randCard.lastShownDate;
            const shownToday = lastDate === todayStr ? randCard.timesShownToday : 0;

            if (shownToday < randCard.timesPerDay) {
              if (randCard.nextShowAt && new Date(randCard.nextShowAt) <= now) {
                popToTop(card.id);
                const newShownToday = shownToday + 1;
                const updated = {
                  ...randCard,
                  timesShownToday: newShownToday,
                  lastShownDate: todayStr,
                };
                const nextTime = newShownToday < randCard.timesPerDay
                  ? computeNextRandomTime(updated)
                  : null;

                get().updateCard(card.id, {
                  timesShownToday: newShownToday,
                  lastShownDate: todayStr,
                  nextShowAt: nextTime?.toISOString(),
                } as Partial<RandomCard>);
              }
            } else if (!isToday(lastDate)) {
              // Reset for new day
              const updated = { ...randCard, timesShownToday: 0, lastShownDate: todayStr };
              const nextTime = computeNextRandomTime(updated);
              get().updateCard(card.id, {
                timesShownToday: 0,
                lastShownDate: todayStr,
                nextShowAt: nextTime?.toISOString(),
              } as Partial<RandomCard>);
            }
          }
        });
      },
    }),
    {
      name: 'pipeline-cards-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Selector: active cards sorted by stack order */
export const useActiveCards = () =>
  useCardStore((state) =>
    state.cards
      .filter((c) => c.status === 'active')
      .sort((a, b) => a.stackOrder - b.stackOrder)
  );

/** Selector: done + archived cards */
export const useArchivedCards = () =>
  useCardStore((state) =>
    state.cards
      .filter((c) => c.status === 'done' || c.status === 'archived')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  );
