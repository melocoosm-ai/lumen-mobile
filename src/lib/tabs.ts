// Tab state as a pure reducer, so it can be unit-tested without a device.
import { HOME } from './omnibox';

export type Tab = {
  id: string;
  url: string; // what the WebView was asked to load (HOME = new-tab page)
  currentUrl: string; // where the page actually is now, after link clicks and redirects
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  loading: boolean;
  progress: number; // 0..1
  /** Bumped whenever the user asks this tab to load `url`, so the WebView reloads even for the same URL. */
  loadKey: number;
};

export type TabsState = { tabs: Tab[]; activeId: string };

export type TabsAction =
  | { type: 'new'; url?: string; afterId?: string }
  | { type: 'close'; id: string }
  | { type: 'activate'; id: string }
  | { type: 'load'; id: string; url: string }
  | { type: 'update'; id: string; patch: Partial<Omit<Tab, 'id' | 'loadKey'>> }
  | { type: 'restore'; urls: string[]; activeIndex: number };

export const MAX_TABS = 50;
let counter = 0;
const makeId = () => `t${Date.now().toString(36)}${(counter++).toString(36)}`;

export function newTab(url: string = HOME): Tab {
  return {
    id: makeId(),
    url,
    currentUrl: url,
    title: url === HOME ? 'New Tab' : url,
    canGoBack: false,
    canGoForward: false,
    loading: url !== HOME,
    progress: 0,
    loadKey: 0,
  };
}

export function initialTabs(): TabsState {
  const t = newTab();
  return { tabs: [t], activeId: t.id };
}

export function tabsReducer(state: TabsState, action: TabsAction): TabsState {
  switch (action.type) {
    case 'new': {
      if (state.tabs.length >= MAX_TABS) return state;
      const t = newTab(action.url);
      const tabs = [...state.tabs];
      const at = action.afterId ? tabs.findIndex((x) => x.id === action.afterId) + 1 : tabs.length;
      tabs.splice(at > 0 ? at : tabs.length, 0, t);
      return { tabs, activeId: t.id };
    }
    case 'close': {
      const idx = state.tabs.findIndex((t) => t.id === action.id);
      if (idx < 0) return state;
      const tabs = state.tabs.filter((t) => t.id !== action.id);
      if (tabs.length === 0) return initialTabs(); // closing the last tab leaves a fresh one
      const activeId =
        state.activeId === action.id ? tabs[Math.min(idx, tabs.length - 1)].id : state.activeId;
      return { tabs, activeId };
    }
    case 'activate':
      return state.tabs.some((t) => t.id === action.id) ? { ...state, activeId: action.id } : state;
    case 'load':
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id
            ? { ...t, url: action.url, currentUrl: action.url, canGoForward: false, loading: action.url !== HOME, progress: 0, loadKey: t.loadKey + 1,
                title: action.url === HOME ? 'New Tab' : t.title }
            : t
        ),
      };
    case 'update':
      return {
        ...state,
        tabs: state.tabs.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };
    case 'restore': {
      const urls = action.urls.filter((u) => typeof u === 'string' && u).slice(0, MAX_TABS);
      if (urls.length === 0) return state;
      const tabs = urls.map((u) => newTab(u));
      const i = Math.min(Math.max(action.activeIndex, 0), tabs.length - 1);
      return { tabs, activeId: tabs[i].id };
    }
  }
}
