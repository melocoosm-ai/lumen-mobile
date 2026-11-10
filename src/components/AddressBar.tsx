import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { displayHost, HOME, isSecure } from '../lib/omnibox';
import { useTheme } from '../lib/theme';

type Props = {
  url: string;
  loading: boolean;
  onSubmit: (text: string) => void;
  onReload: () => void;
  onStop: () => void;
};

export function AddressBar({ url, loading, onSubmit, onReload, onStop }: Props) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState('');
  const home = url === HOME;

  // Editing starts from the page's full URL; while not editing, the short host is shown instead.
  const startEditing = () => {
    setText(home ? '' : url);
    setFocused(true);
  };

  return (
    <View style={[styles.row, { backgroundColor: c.bar, borderBottomColor: c.line }]}>
      <View style={[styles.field, { backgroundColor: c.field, borderColor: focused ? c.accent : 'transparent' }]}>
        {!focused && !home && (
          <Ionicons
            name={isSecure(url) ? 'lock-closed' : 'globe-outline'}
            size={13}
            color={isSecure(url) ? c.secure : c.muted}
            accessibilityLabel={isSecure(url) ? 'Secure connection' : 'Not secure'}
          />
        )}
        {focused ? (
          <TextInput
            style={[styles.input, { color: c.text }]}
            value={text}
            onChangeText={setText}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => { setFocused(false); onSubmit(text); }}
            selectTextOnFocus
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="web-search"
            returnKeyType="go"
            clearButtonMode="while-editing"
            placeholder="Search or enter address"
            placeholderTextColor={c.muted}
            accessibilityLabel="Address and search bar"
            testID="address-input"
          />
        ) : (
          <Pressable
            style={styles.display}
            onPress={startEditing}
            accessibilityRole="search"
            accessibilityLabel="Address and search bar"
            accessibilityHint="Double-tap to search or enter an address"
            testID="address-display"
          >
            <Text numberOfLines={1} style={{ color: home ? c.muted : c.text, fontSize: 15 }}>
              {home ? 'Search or enter address' : displayHost(url)}
            </Text>
          </Pressable>
        )}
        {!focused && !home && (
          <Pressable
            hitSlop={10}
            onPress={loading ? onStop : onReload}
            accessibilityRole="button"
            accessibilityLabel={loading ? 'Stop loading' : 'Reload'}
          >
            <Ionicons name={loading ? 'close' : 'reload'} size={17} color={c.muted} />
          </Pressable>
        )}
      </View>
      {focused && (
        <Pressable onPress={() => setFocused(false)} hitSlop={8} accessibilityRole="button">
          <Text style={{ color: c.accent, fontSize: 15 }}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  field: {
    flex: 1, height: 40, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  display: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
});
