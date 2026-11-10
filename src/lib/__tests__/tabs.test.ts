import { HOME } from '../omnibox';
import { toggleBookmark } from '../storage';
import { initialTabs, MAX_TABS, tabsReducer, type TabsState } from '../tabs';

const ids = (s: TabsState) => s.tabs.map((t) => t.id);

describe('tabsReducer', () => {
  it('starts with one new-tab page', () => {
    const s = initialTabs();
    expect(s.tabs).toHaveLength(1);
    expect(s.tabs[0].url).toBe(HOME);
    expect(s.activeId).toBe(s.tabs[0].id);
  });

  it('opens new tabs at the end, or right after their opener', () => {
    let s = initialTabs();
    const first = s.activeId;
    s = tabsReducer(s, { type: 'new' });
    const second = s.activeId;
    s = tabsReducer(s, { type: 'new', url: 'https://x.y', afterId: first });
    expect(ids(s)).toEqual([first, s.activeId, second]);
    expect(s.tabs[1].url).toBe('https://x.y');
  });

  it('activates the neighbour when closing the active tab', () => {
    let s = initialTabs();
    s = tabsReducer(s, { type: 'new' });
    s = tabsReducer(s, { type: 'new' });
    const [a, b, c] = ids(s);
    s = tabsReducer(s, { type: 'activate', id: b });
    s = tabsReducer(s, { type: 'close', id: b });
    expect(ids(s)).toEqual([a, c]);
    expect(s.activeId).toBe(c);
    s = tabsReducer(s, { type: 'close', id: c });
    expect(s.activeId).toBe(a);
  });

  it('closing the last tab leaves a fresh new tab', () => {
    const s0 = initialTabs();
    const s = tabsReducer(s0, { type: 'close', id: s0.activeId });
    expect(s.tabs).toHaveLength(1);
    expect(s.tabs[0].url).toBe(HOME);
    expect(s.activeId).not.toBe(s0.activeId);
  });

  it('load updates url, resets forward history and bumps loadKey', () => {
    let s = initialTabs();
    const id = s.activeId;
    s = tabsReducer(s, { type: 'update', id, patch: { canGoForward: true } });
    s = tabsReducer(s, { type: 'load', id, url: 'https://a.b' });
    expect(s.tabs[0]).toMatchObject({ url: 'https://a.b', currentUrl: 'https://a.b', loading: true, canGoForward: false, loadKey: 1 });
  });

  it('caps the number of tabs', () => {
    let s = initialTabs();
    for (let i = 0; i < MAX_TABS + 5; i++) s = tabsReducer(s, { type: 'new' });
    expect(s.tabs).toHaveLength(MAX_TABS);
  });

  it('restores a saved session and ignores junk', () => {
    const s = tabsReducer(initialTabs(), { type: 'restore', urls: ['https://a', '', 'https://b'], activeIndex: 9 });
    expect(s.tabs.map((t) => t.url)).toEqual(['https://a', 'https://b']);
    expect(s.activeId).toBe(s.tabs[1].id);
    const same = initialTabs();
    expect(tabsReducer(same, { type: 'restore', urls: [], activeIndex: 0 })).toBe(same);
  });

  it('ignores unknown tab ids', () => {
    const s = initialTabs();
    expect(tabsReducer(s, { type: 'activate', id: 'nope' })).toBe(s);
    expect(tabsReducer(s, { type: 'close', id: 'nope' })).toBe(s);
  });
});

describe('toggleBookmark', () => {
  it('adds to the front and removes on second toggle', () => {
    const a = { url: 'https://a', title: 'A' };
    const b = { url: 'https://b', title: 'B' };
    let list = toggleBookmark([], a);
    list = toggleBookmark(list, b);
    expect(list.map((x) => x.url)).toEqual(['https://b', 'https://a']);
    expect(toggleBookmark(list, a).map((x) => x.url)).toEqual(['https://b']);
  });
});
