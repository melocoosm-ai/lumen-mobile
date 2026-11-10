import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { displayHost, HOME } from '../lib/omnibox';
import type { Tab } from '../lib/tabs';
import { useTheme } from '../lib/theme';

type Props = {
  visible: boolean;
  tabs: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
  onCloseAll: () => void;
  onDismiss: () => void;
};

export function TabSwitcher({ visible, tabs, activeId, onSelect, onClose, onNew, onCloseAll, onDismiss }: Props) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss} presentationStyle="fullScreen">
      <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.h1, { color: c.text }]}>{tabs.length} {tabs.length === 1 ? 'Tab' : 'Tabs'}</Text>
        </View>
        <FlatList
          data={tabs}
          keyExtractor={(t) => t.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => {
            const active = item.id === activeId;
            const home = item.currentUrl === HOME;
            return (
              // The close button is a sibling of the card button, not nested inside it,
              // so screen readers and touch targets treat them as two separate controls.
              <View style={[styles.card, { backgroundColor: c.card, borderColor: active ? c.accent : c.line, borderWidth: active ? 2 : StyleSheet.hairlineWidth }]}>
                <Pressable
                  onPress={() => onSelect(item.id)}
                  style={styles.cardBody}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}${active ? ', current tab' : ''}`}
                >
                  <Text numberOfLines={2} style={[styles.cardTitle, { color: c.text }]}>{item.title || 'Untitled'}</Text>
                  <View style={[styles.preview, { backgroundColor: c.field }]}>
                    <Ionicons name={home ? 'star-outline' : 'globe-outline'} size={28} color={c.muted} />
                  </View>
                  <Text numberOfLines={1} style={{ color: c.muted, fontSize: 12 }}>{home ? 'New Tab' : displayHost(item.currentUrl)}</Text>
                </Pressable>
                <Pressable
                  style={styles.close}
                  hitSlop={8}
                  onPress={() => onClose(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Close ${item.title}`}
                >
                  <Ionicons name="close" size={18} color={c.muted} />
                </Pressable>
              </View>
            );
          }}
        />
        <View style={[styles.footer, { borderTopColor: c.line, backgroundColor: c.bar, paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable onPress={onCloseAll} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close all tabs">
            <Text style={{ color: c.danger, fontSize: 16 }}>Close All</Text>
          </Pressable>
          <Pressable onPress={onNew} style={[styles.plus, { backgroundColor: c.accent }]} accessibilityRole="button" accessibilityLabel="New tab" testID="btn-new-tab">
            <Ionicons name="add" size={26} color="#fff" />
          </Pressable>
          <Pressable onPress={onDismiss} hitSlop={8} accessibilityRole="button" accessibilityLabel="Done">
            <Text style={{ color: c.accent, fontSize: 16, fontWeight: '600' }}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  h1: { fontSize: 22, fontWeight: '700' },
  card: { flex: 1, borderRadius: 14, maxWidth: '50%' },
  cardBody: { padding: 10, gap: 8 },
  cardTitle: { fontSize: 13, fontWeight: '600', minHeight: 34, paddingRight: 26 },
  close: { position: 'absolute', top: 6, right: 6, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  preview: { height: 96, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  plus: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
