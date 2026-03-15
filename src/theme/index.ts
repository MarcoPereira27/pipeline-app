export const Colors = {
  // Backgrounds
  bg: '#080B14',
  bgCard: '#0D1120',
  bgElevated: '#111827',
  bgInput: '#1A2035',

  // Borders
  border: '#1E2D45',
  borderLight: '#243352',

  // Text
  textPrimary: '#F0F4FF',
  textSecondary: '#8899BB',
  textMuted: '#4A5A7A',

  // Card type accents
  task: '#4F8EF7',      // Electric blue
  taskGlow: '#4F8EF720',
  link: '#F97316',      // Warm orange
  linkGlow: '#F9731620',
  idea: '#FBBF24',      // Amber
  ideaGlow: '#FBBF2420',
  note: '#22D3EE',      // Cyan
  noteGlow: '#22D3EE20',
  limit: '#A855F7',     // Violet
  limitGlow: '#A855F720',
  recurrent: '#39D98A', // Emerald
  recurrentGlow: '#39D98A20',
  random: '#F43F5E',    // Rose
  randomGlow: '#F43F5E20',

  // Status
  done: '#39D98A',
  archived: '#4A5A7A',

  // Priority
  priorityLow: '#4A5A7A',
  priorityMedium: '#F97316',
  priorityHigh: '#F43F5E',

  // UI
  surface: '#0F1729',
  overlay: 'rgba(8, 11, 20, 0.85)',
  white: '#FFFFFF',
  black: '#000000',

  // Tab bar
  tabActive: '#4F8EF7',
  tabInactive: '#4A5A7A',
};

export const CardColors: Record<string, { accent: string; glow: string; gradient: [string, string] }> = {
  task: {
    accent: Colors.task,
    glow: Colors.taskGlow,
    gradient: ['#1A2D5A', '#0D1935'],
  },
  link: {
    accent: Colors.link,
    glow: Colors.linkGlow,
    gradient: ['#3D2010', '#1C1008'],
  },
  idea: {
    accent: Colors.idea,
    glow: Colors.ideaGlow,
    gradient: ['#3D3010', '#1C1608'],
  },
  note: {
    accent: Colors.note,
    glow: Colors.noteGlow,
    gradient: ['#0D2D35', '#071519'],
  },
  limit: {
    accent: Colors.limit,
    glow: Colors.limitGlow,
    gradient: ['#2D1050', '#150828'],
  },
  recurrent: {
    accent: Colors.recurrent,
    glow: Colors.recurrentGlow,
    gradient: ['#0D3525', '#061A12'],
  },
  random: {
    accent: Colors.random,
    glow: Colors.randomGlow,
    gradient: ['#3D0F18', '#1C080C'],
  },
};

export const CardIcons: Record<string, string> = {
  task: '✦',
  link: '⬡',
  idea: '◈',
  note: '▣',
  limit: '◎',
  recurrent: '↻',
  random: '⁂',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Typography = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
};
