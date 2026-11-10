import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { displayHost } from '../lib/omnibox';
import type { Bookmark } from '../lib/storage';
import { useTheme } from '../lib/theme';

const SUGGESTED: Bookmark[] = [
  { title: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com' },
  { title: 'MDN', url: 'https://developer.mozilla.org' },
  { title: 'OpenStreetMap', url: 'https://www.openstreetmap.org' },
];

type Props = {
  bookmarks: Bookmark[];
  onOpen: (url: string) => void;
  onRemoveBookmark: (url: string) => void;
};

function Tile({ b, onOpen, onLongPress }: { b: Bookmark; onOpen: (url: string) => void; onLongPress?: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.tile, { backgroundColor: c.card, borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}
      onPress={() => onOpen(b.url)}
      onLongPress={onLongPress}
      accessibilityRole="link"
      accessibilityLabel={b.title}
      accessibilityHint={onLongPress ? 'Long-press to remove' : undefined}
    >
      <View style={[styles.badge, { backgroundColor: c.accent }]}>
        <Text style={styles.badgeText}>{(b.title || displayHost(b.url) || '?').charAt(0).toUpperCase()}</Text>
      </View>
      <Text numberOfLines={1} style={[styles.tileText, { color: c.text }]}>{b.title || displayHost(b.url)}</Text>
    </Pressable>
  );
}

export function HomePage({ bookmarks, onOpen, onRemoveBookmark }: Props) {
  const c = useTheme();
  const confirmRemove = (b: Bookmark) =>
    Alert.alert('Remove bookmark?', b.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onRemoveBookmark(b.url) },
    ]);

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <View style={styles.mark}>
        <View style={[styles.dot, { backgroundColor: c.accent }]}>
          <View style={styles.dotGlow} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>Lumen</Text>
      </View>
      <Text style={[styles.sub, { color: c.muted }]}>Private by default. No accounts, no tracking.</Text>

      {bookmarks.length > 0 && (
        <>
          <Text style={[styles.heading, { color: c.muted }]}>BOOKMARKS</Text>
          <View style={styles.grid}>
            {bookmarks.map((b) => <Tile key={b.url} b={b} onOpen={onOpen} onLongPress={() => confirmRemove(b)} />)}
          </View>
        </>
      )}
      <Text style={[styles.heading, { color: c.muted }]}>SUGGESTED</Text>
      <View style={styles.grid}>
        {SUGGESTED.map((b) => <Tile key={b.url} b={b} onOpen={onOpen} />)}
      </View>
      {bookmarks.length === 0 && (
        <View style={styles.hint}>
          <Ionicons name="star-outline" size={14} color={c.muted} />
          <Text style={{ color: c.muted, fontSize: 13 }}>Tap the star on any page to bookmark it.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 48, alignItems: 'center' },
  mark: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },
  dotGlow: { position: 'absolute', left: 4, top: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#ffd76a', opacity: 0.85 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  sub: { marginTop: 8, marginBottom: 28, fontSize: 14, textAlign: 'center' },
  heading: { alignSelf: 'stretch', maxWidth: 520, marginBottom: 10, marginTop: 6, fontSize: 12, fontWeight: '600', letterSpacing: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start', maxWidth: 520, alignSelf: 'center', marginBottom: 18 },
  tile: { width: 74, height: 84, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 6 },
  badge: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  tileText: { fontSize: 12 },
  hint: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
});
