export const BUTTON_COLOR_OPTIONS = [
  { id: 'neutral', label: 'Default', dotClass: 'bg-neutral-600' },
  { id: 'emerald', label: 'Emerald', dotClass: 'bg-emerald-500' },
  { id: 'sky', label: 'Sky', dotClass: 'bg-sky-500' },
  { id: 'blue', label: 'Blue', dotClass: 'bg-blue-500' },
  { id: 'red', label: 'Red', dotClass: 'bg-red-500' },
  { id: 'violet', label: 'Violet', dotClass: 'bg-violet-500' },
];

export const BUTTON_COLOR_STYLES = {
  neutral: {
    card: 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80',
    pill: 'bg-neutral-800/70',
    iconBg: 'bg-neutral-800',
  },
  emerald: {
    card: 'border-emerald-900/60 bg-emerald-950/60 hover:bg-emerald-900/70',
    pill: 'bg-emerald-900/70',
    iconBg: 'bg-emerald-900',
  },
  sky: {
    card: 'border-sky-800/60 bg-sky-950/60 hover:bg-sky-900/70',
    pill: 'bg-sky-900/70',
    iconBg: 'bg-sky-900',
  },
  blue: {
    card: 'border-blue-800/60 bg-blue-950/60 hover:bg-blue-900/70',
    pill: 'bg-blue-900/70',
    iconBg: 'bg-blue-900',
  },
  red: {
    card: 'border-red-800/60 bg-red-950/60 hover:bg-red-900/70',
    pill: 'bg-red-900/70',
    iconBg: 'bg-red-900',
  },
  violet: {
    card: 'border-violet-800/60 bg-violet-950/60 hover:bg-violet-900/70',
    pill: 'bg-violet-900/70',
    iconBg: 'bg-violet-900',
  },
  // Fallback
  default: {
    card: 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80',
    pill: 'bg-neutral-800/70',
    iconBg: 'bg-neutral-800',
  }
};

export function getButtonColorStyles(colorId) {
  return BUTTON_COLOR_STYLES[colorId] || BUTTON_COLOR_STYLES.neutral;
}
