export const colors = {
  paper: '#F1EBDD',
  paperDeep: '#E8E0CD',
  surface: '#FAF6EC',
  ink: '#211D17',
  inkSoft: '#4A4239',
  muted: '#978E7E',
  hairline: '#D9D0BC',
  accent: '#B85C3C',
  accentSoft: '#D78A6A',
  done: '#6B8E5A',
} as const;

export type ColorToken = keyof typeof colors;
