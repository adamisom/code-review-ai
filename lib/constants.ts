// Application constants

export const THREAD_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
} as const;

export const THEME = {
  DARK: 'vs-dark',
  LIGHT: 'vs-light',
} as const;

export const DEFAULT_EDITOR_LANGUAGE = 'typescript';
export const DEFAULT_EDITOR_THEME = THEME.DARK;

export const KEYBOARD_SHORTCUTS = {
  CREATE_THREAD: { mac: '⌘K', windows: 'Ctrl+K' },
  ANALYZE_CODE: { mac: '⌘A+I', windows: 'Ctrl+A+I' },
} as const;

