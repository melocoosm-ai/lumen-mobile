import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme';

type Props = {
  canGoBack: boolean;
  canGoForward: boolean;
  canShare: boolean;
  bookmarked: boolean;
  tabCount: number;
  bottomInset: number;
  onBack: () => void;
  onForward: () => void;
  onShare: () => void;
  onBookmark: () => void;
  onTabs: () => void;
};

type IconName = keyof typeof Ionicons.glyphMap;

function IconButton({ icon, label, onPress, disabled, color, disabledColor }: {
  icon: IconName; label: string; onPress: () => void; disabled?: boolean; color: string; disabledColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={styles.btn}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      testID={`btn-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Ionicons name={icon} size={24} color={disabled ? disabledColor : color} />
    </Pressable>
  );
}

export function BottomBar(p: Props) {
  const c = useTheme();
  const colors = { color: c.text, disabledColor: c.line };
  return (
    <View style={[styles.bar, { backgroundColor: c.bar, borderTopColor: c.line, paddingBottom: Math.max(p.bottomInset, 6) }]}>
      <IconButton icon="arrow-back" label="Back" onPress={p.onBack} disabled={!p.canGoBack} {...colors} />
      <IconButton icon="arrow-forward" label="Forward" onPress={p.onForward} disabled={!p.canGoForward} {...colors} />
      <IconButton icon="share-outline" label="Share" onPress={p.onShare} disabled={!p.canShare} {...colors} />
      <IconButton
        icon={p.bookmarked ? 'star' : 'star-outline'}
        label={p.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        onPress={p.onBookmark}
        disabled={!p.canShare}
        {...colors}
        color={p.bookmarked ? c.accent : c.text}
      />
      <Pressable
        onPress={p.onTabs}
        style={styles.btn}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Tabs, ${p.tabCount} open`}
        testID="btn-tabs"
      >
        <View style={[styles.count, { borderColor: c.text }]}>
          <Text style={{ color: c.text, fontSize: 12, fontWeight: '700' }}>
            {p.tabCount > 99 ? '99+' : p.tabCount}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth,
  },
  btn: { minWidth: 48, height: 44, alignItems: 'center', justifyContent: 'center' },
  count: { minWidth: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
});
