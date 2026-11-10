import { useColorScheme } from 'react-native';

const light = {
  bg: '#f6f7f9',
  bar: '#ffffff',
  field: '#eef1f4',
  card: '#ffffff',
  text: '#1f2328',
  muted: '#5f6670',
  line: '#e1e4e8',
  accent: '#6b4fd8',
  secure: '#2da44e',
  danger: '#cf222e',
};
const dark: typeof light = {
  bg: '#1f2126',
  bar: '#2a2d33',
  field: '#1b1d22',
  card: '#2a2d33',
  text: '#e8eaed',
  muted: '#9aa0a8',
  line: '#3a3e45',
  accent: '#a593ff',
  secure: '#3fb950',
  danger: '#f85149',
};

export type Theme = typeof light;

export function useTheme(): Theme & { dark: boolean } {
  const scheme = useColorScheme();
  return scheme === 'dark' ? { ...dark, dark: true } : { ...light, dark: false };
}
