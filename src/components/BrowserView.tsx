import { type ComponentType, forwardRef, type Ref } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  AndroidWebViewProps, IOSWebViewProps, ShouldStartLoadRequest, WebViewNavigation,
  WebViewOpenWindowEvent, WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import { displayHost, isExternalScheme } from '../lib/omnibox';
import type { Tab } from '../lib/tabs';
import { useTheme } from '../lib/theme';

// The library's combined WebViewProps (iOS & Android & Windows) intersects to `never` under
// React Native 0.88's types, so describe the props we use from the two mobile platforms.
type MobileWebViewProps = IOSWebViewProps &
  Pick<AndroidWebViewProps, 'setSupportMultipleWindows' | 'thirdPartyCookiesEnabled' | 'mixedContentMode' |
    'geolocationEnabled' | 'allowFileAccess' | 'allowFileAccessFromFileURLs' | 'allowUniversalAccessFromFileURLs' |
    'allowsFullscreenVideo'> & { ref?: Ref<WebView> };
const MobileWebView = WebView as unknown as ComponentType<MobileWebViewProps>;

type Props = {
  tab: Tab;
  active: boolean;
  onUpdate: (patch: Partial<Tab>) => void;
  onOpenInNewTab: (url: string) => void;
};

/** One tab's web content. Inactive tabs stay mounted (keeping their history) but hidden. */
export const BrowserView = forwardRef<WebView, Props>(function BrowserView({ tab, active, onUpdate, onOpenInNewTab }, ref) {
  const c = useTheme();
  return (
    <View style={[StyleSheet.absoluteFill, !active && styles.hidden]} pointerEvents={active ? 'auto' : 'none'}>
      <MobileWebView
        ref={ref}
        source={{ uri: tab.url }}
        style={{ backgroundColor: c.bg }}
        // Navigation state drives the toolbar.
        onNavigationStateChange={(s: WebViewNavigation) =>
          onUpdate({
            currentUrl: s.url,
            title: s.title && !/^https?:\/\//.test(s.title) ? s.title : displayHost(s.url),
            canGoBack: s.canGoBack,
            canGoForward: s.canGoForward,
          })
        }
        onLoadStart={() => onUpdate({ loading: true })}
        onLoadEnd={() => onUpdate({ loading: false })}
        onLoadProgress={(e: WebViewProgressEvent) => onUpdate({ progress: e.nativeEvent.progress })}
        // tel:, mailto:, maps:, store links etc. open in the right app instead of failing.
        onShouldStartLoadWithRequest={(req: ShouldStartLoadRequest) => {
          if (isExternalScheme(req.url)) {
            Linking.openURL(req.url).catch(() => {});
            return false;
          }
          return true;
        }}
        // target=_blank and window.open become a new tab.
        setSupportMultipleWindows
        onOpenWindow={(e: WebViewOpenWindowEvent) => onOpenInNewTab(e.nativeEvent.targetUrl)}
        renderError={(_domain: string | undefined, code: number, description: string) => (
          <View style={[styles.error, { backgroundColor: c.bg }]}>
            <Text style={[styles.errorTitle, { color: c.text }]}>This page can’t be reached</Text>
            <Text style={{ color: c.muted, textAlign: 'center' }}>{displayHost(tab.currentUrl)}</Text>
            <Text style={{ color: c.muted, textAlign: 'center', fontSize: 12 }}>{description} ({code})</Text>
          </View>
        )}
        // Browser niceties
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction
        decelerationRate="normal"
        // Privacy: no third-party cookies, no file access from pages.
        thirdPartyCookiesEnabled={false}
        allowFileAccess={false}
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        mixedContentMode="never"
        geolocationEnabled={false}
        testID={`webview-${tab.id}`}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hidden: { opacity: 0, zIndex: -1 },
  error: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  errorTitle: { fontSize: 20, fontWeight: '600' },
});
