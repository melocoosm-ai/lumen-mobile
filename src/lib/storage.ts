// On-device persistence. Nothing leaves the device.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Bookmark = { url: string; title: string };

const KEYS = { bookmarks: 'lumen.bookmarks.v1', session: 'lumen.session.v1' };

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the app keeps working without persistence.
  }
}

export const loadBookmarks = () => readJson<Bookmark[]>(KEYS.bookmarks, []);
export const saveBookmarks = (b: Bookmark[]) => writeJson(KEYS.bookmarks, b);

export type Session = { urls: string[]; activeIndex: number };
export const loadSession = () => readJson<Session | null>(KEYS.session, null);
export const saveSession = (s: Session) => writeJson(KEYS.session, s);
export const clearSession = () => AsyncStorage.removeItem(KEYS.session).catch(() => {});

export function toggleBookmark(list: Bookmark[], b: Bookmark): Bookmark[] {
  return list.some((x) => x.url === b.url) ? list.filter((x) => x.url !== b.url) : [b, ...list];
}
