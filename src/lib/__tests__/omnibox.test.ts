import { displayHost, HOME, isExternalScheme, isSecure, resolveInput } from '../omnibox';

describe('resolveInput', () => {
  it.each([
    ['example.com', 'https://example.com'],
    ['  example.com/path?q=1 ', 'https://example.com/path?q=1'],
    ['https://a.b/c?d', 'https://a.b/c?d'],
    ['http://insecure.test', 'http://insecure.test'],
    ['localhost:3000/x', 'http://localhost:3000/x'],
    ['192.168.1.10:8080', 'http://192.168.1.10:8080'],
    ['10.0.0.1', 'http://10.0.0.1'],
  ])('%s → %s', (input, out) => expect(resolveInput(input)).toBe(out));

  it.each(['how do browsers work', 'weather', 'javascript:alert(1)', 'file:///etc/passwd', 'intent://x'])(
    '%s → search',
    (input) => expect(resolveInput(input)).toBe('https://duckduckgo.com/?q=' + encodeURIComponent(input.trim()))
  );

  it('ignores blank input', () => expect(resolveInput('   ')).toBeNull());
});

describe('displayHost', () => {
  it('shows the host without www', () => expect(displayHost('https://www.example.com/a/b')).toBe('example.com'));
  it('shows the query for searches', () => expect(displayHost('https://duckduckgo.com/?q=hello+world')).toBe('hello world'));
  it('is empty on the new-tab page', () => expect(displayHost(HOME)).toBe(''));
});

describe('schemes', () => {
  it('flags https as secure', () => {
    expect(isSecure('https://x.y')).toBe(true);
    expect(isSecure('http://x.y')).toBe(false);
  });
  it('sends app links to other apps', () => {
    for (const u of ['tel:123', 'mailto:a@b.c', 'sms:1', 'maps:q', 'itms-apps://x', 'market://details?id=x']) {
      expect(isExternalScheme(u)).toBe(true);
    }
    for (const u of ['https://x', 'http://x', 'about:blank', 'data:text/plain,hi', 'blob:x']) {
      expect(isExternalScheme(u)).toBe(false);
    }
  });
});
