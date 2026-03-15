export type CardType = 'task' | 'link' | 'idea' | 'note' | 'limit' | 'recurrent' | 'random';

export type CardStatus = 'active' | 'done' | 'archived';

export type RecurrentSchedule = 'daily' | 'weekly' | 'monthly';

export type Priority = 'low' | 'medium' | 'high';

export interface BaseCard {
  id: string;
  type: CardType;
  title: string;
  description?: string;
  url?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: CardStatus;
  tags: string[];
  priority: Priority;
  /** Position in the stack (lower = higher in stack) */
  stackOrder: number;
}

export interface TaskCard extends BaseCard {
  type: 'task';
}

export interface LinkCard extends BaseCard {
  type: 'link';
  url: string;
}

export interface IdeaCard extends BaseCard {
  type: 'idea';
}

export interface NoteCard extends BaseCard {
  type: 'note';
}

export interface LimitCard extends BaseCard {
  type: 'limit';
  /** Total number of checks needed to complete */
  limit: number;
  /** Current check count */
  currentCount: number;
  /** History of check timestamps */
  checkHistory: string[]; // ISO strings
}

export interface RecurrentCard extends BaseCard {
  type: 'recurrent';
  schedule: RecurrentSchedule;
  /** For weekly: days 0-6 (Sun=0). For monthly: day of month 1-31 */
  scheduleDays: number[];
  /** ISO string of when card was last popped to top */
  lastShownAt?: string;
  /** ISO string of next scheduled pop */
  nextShowAt?: string;
}

export interface RandomCard extends BaseCard {
  type: 'random';
  /** HH:mm format, start of window */
  windowStart: string;
  /** HH:mm format, end of window */
  windowEnd: string;
  /** How many times per day to show */
  timesPerDay: number;
  /** How many times shown today */
  timesShownToday: number;
  /** Date string (YYYY-MM-DD) of last shown day */
  lastShownDate?: string;
  /** ISO string of next random pop */
  nextShowAt?: string;
}

export type PipelineCard =
  | TaskCard
  | LinkCard
  | IdeaCard
  | NoteCard
  | LimitCard
  | RecurrentCard
  | RandomCard;

export interface CardStore {
  cards: PipelineCard[];
  addCard: (card: Omit<PipelineCard, 'id' | 'createdAt' | 'updatedAt' | 'stackOrder'>) => void;
  updateCard: (id: string, updates: Partial<PipelineCard>) => void;
  deleteCard: (id: string) => void;
  checkLimitCard: (id: string) => void;
  markDone: (id: string) => void;
  sendToBottom: (id: string) => void;
  popToTop: (id: string) => void;
  archiveCard: (id: string) => void;
  restoreCard: (id: string) => void;
  processScheduledCards: () => void;
}
