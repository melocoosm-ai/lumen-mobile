import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { WebView } from 'react-native-webview';
import { AddressBar } from '../components/AddressBar';
import { BottomBar } from '../components/BottomBar';
import { BrowserView } from '../components/BrowserView';
import { HomePage } from '../components/HomePage';
import { TabSwitcher } from '../components/TabSwitcher';
import { HOME, resolveInput } from '../lib/omnibox';
import {
  type Bookmark, loadBookmarks, loadSession, saveBookmarks, saveSession, toggleBookmark,
} from '../lib/storage';
import { initialTabs, type Tab, tabsReducer } from '../lib/tabs';
import { useTheme } from '../lib/theme';

export default function Browser() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [state, dispatch] = useReducer(tabsReducer, undefined, initialTabs);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [switcher, setSwitcher] = useState(false);
  const [restored, setRestored] = useState(false);
  const webviews = useRef(new Map<string, WebView | null>());

  const active = state.tabs.find((t) => t.id === state.activeId) ?? state.tabs[0];
  const activeWeb = () => webviews.current.get(active.id);
  const onHome = active.currentUrl === HOME;

  // ---- persistence: restore once, then save on change ----
  useEffect(() => {
    (async () => {
      const [b, s] = await Promise.all([loadBookmarks(), loadSession()]);
      setBookmarks(b);
      if (s) dispatch({ type: 'restore', urls: s.urls, activeIndex: s.activeIndex });
      setRestored(true);
    })();
  }, []);
  useEffect(() => {
    if (!restored) return;
    const id = setTimeout(() => {
      saveSession({
        urls: state.tabs.map((t) => t.currentUrl),
        activeIndex: state.tabs.findIndex((t) => t.id === state.activeId),
      });
    }, 500);
    return () => clearTimeout(id);
  }, [state, restored]);
  useEffect(() => { if (restored) saveBookmarks(bookmarks); }, [bookmarks, restored]);

  // ---- actions ----
  const update = useCallback((id: string, patch: Partial<Tab>) => dispatch({ type: 'update', id, patch }), []);
  const open = (url: string) => {
    const web = activeWeb();
    // The WebView only reloads when its source changes; re-entering the same address navigates in place
    // so the tab keeps its back history.
    if (web && url !== HOME && url === active.url) {
      web.injectJavaScript(`window.location.assign(${JSON.stringify(url)}); true;`);
      return;
    }
    dispatch({ type: 'load', id: active.id, url });
  };
  const go = (text: string) => {
    const url = resolveInput(text);
    if (url) open(url);
  };
  const back = () => {
    if (active.canGoBack) activeWeb()?.goBack();
    else if (!onHome) open(HOME); // the first page's "back" is the new-tab page
  };

  // Android hardware back button: switcher → page history → new-tab page → leave app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (switcher) { setSwitcher(false); return true; }
      if (active.canGoBack) { activeWeb()?.goBack(); return true; }
      if (!onHome) { open(HOME); return true; }
      return false;
    });
    return () => sub.remove();
  });

  const bookmarked = bookmarks.some((b) => b.url === active.currentUrl);

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: c.bar, paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AddressBar
        url={active.currentUrl}
        loading={active.loading}
        onSubmit={go}
        onReload={() => activeWeb()?.reload()}
        onStop={() => { activeWeb()?.stopLoading(); update(active.id, { loading: false }); }}
      />
      <View style={[styles.content, { backgroundColor: c.bg }]}>
        {state.tabs.map((t) =>
          t.url === HOME ? null : (
            <BrowserView
              key={t.id}
              ref={(w) => { webviews.current.set(t.id, w); }}
              tab={t}
              active={t.id === active.id && t.currentUrl !== HOME}
              onUpdate={(patch) => update(t.id, patch)}
              onOpenInNewTab={(url) => dispatch({ type: 'new', url, afterId: t.id })}
            />
          )
        )}
        {onHome && (
          <View style={StyleSheet.absoluteFill}>
            <HomePage
              bookmarks={bookmarks}
              onOpen={open}
              onRemoveBookmark={(url) => setBookmarks((b) => b.filter((x) => x.url !== url))}
            />
          </View>
        )}
        {active.loading && !onHome && (
          <View
            style={[styles.progress, { backgroundColor: c.accent, width: `${Math.max(active.progress, 0.08) * 100}%` }]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(active.progress * 100) }}
          />
        )}
      </View>

      <BottomBar
        canGoBack={active.canGoBack || !onHome}
        canGoForward={active.canGoForward}
        canShare={!onHome}
        bookmarked={bookmarked}
        tabCount={state.tabs.length}
        bottomInset={insets.bottom}
        onBack={back}
        onForward={() => activeWeb()?.goForward()}
        onShare={() => Share.share(Platform.OS === 'ios' ? { url: active.currentUrl } : { message: active.currentUrl, title: active.title })}
        onBookmark={() => setBookmarks((b) => toggleBookmark(b, { url: active.currentUrl, title: active.title }))}
        onTabs={() => setSwitcher(true)}
      />

      <TabSwitcher
        visible={switcher}
        tabs={state.tabs}
        activeId={active.id}
        onSelect={(id) => { dispatch({ type: 'activate', id }); setSwitcher(false); }}
        onClose={(id) => { webviews.current.delete(id); dispatch({ type: 'close', id }); }}
        onNew={() => { dispatch({ type: 'new' }); setSwitcher(false); }}
        onCloseAll={() => {
          webviews.current.clear();
          dispatch({ type: 'restore', urls: [HOME], activeIndex: 0 });
          setSwitcher(false);
        }}
        onDismiss={() => setSwitcher(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  progress: { height: 2, position: 'absolute', top: 0, left: 0, zIndex: 10 },
});
