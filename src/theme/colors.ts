export const colors = {
  background: '#f4f4f5',
  surface: '#fff',
  border: '#e4e4e7',
  text: '#111',
  textPrimary: '#18181b',
  textSecondary: '#3f3f46',
  textMuted: '#52525b',
  textLabel: '#71717a',
  button: '#3f3f46',
  buttonPrimary: '#18181b',
  buttonScan: '#14532d',
  buttonSecondary: '#e4e4e7',
  buttonText: '#fff',
  overlayHint: '#d4d4d8',
  cameraBackground: '#000',
  frameBorder: 'rgba(255,255,255,0.85)',
  buttonSecondaryLight: 'rgba(255,255,255,0.2)',
} as const;

export type Colors = typeof colors;
