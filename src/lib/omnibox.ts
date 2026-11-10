// Decides whether address-bar input is a URL or a search, like desktop Lumen.

export const SEARCH_URL = 'https://duckduckgo.com/?q=';
export const HOME = 'lumen://home';

const ALLOWED_SCHEMES = /^(https?|about|data):/i;

export function resolveInput(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  const search = SEARCH_URL + encodeURIComponent(text);
  const hasSpace = /\s/.test(text);
  const hostWithPort = /^[a-z0-9.-]+:\d+(\/|$)/i.test(text); // "localhost:3000" is not a scheme

  if (!hostWithPort && !hasSpace && /^[a-z][a-z0-9+.-]*:/i.test(text)) {
    return ALLOWED_SCHEMES.test(text) ? text : search;
  }
  const looksLikeHost =
    !hasSpace &&
    (/^localhost(:\d+)?(\/|$)/i.test(text) ||
      /^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/|$)/.test(text) ||
      /^[^/]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(text));
  if (looksLikeHost) {
    const local = /^(localhost|127\.|10\.|192\.168\.|\d{1,3}(\.\d{1,3}){3})/i.test(text);
    return (local ? 'http://' : 'https://') + text;
  }
  return search;
}

/** Short form shown in the address bar while it isn't being edited. */
export function displayHost(url: string): string {
  if (!url || url === HOME) return '';
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('duckduckgo.com') && u.searchParams.get('q')) {
      return u.searchParams.get('q') as string;
    }
    return u.hostname.replace(/^www\./, '') || url;
  } catch {
    return url;
  }
}

export function isSecure(url: string): boolean {
  return url.startsWith('https://');
}

/** Links with these schemes should open in another app (phone, mail, maps, stores). */
export function isExternalScheme(url: string): boolean {
  return !/^(https?|about|data|blob|javascript):/i.test(url) && /^[a-z][a-z0-9+.-]*:/i.test(url);
}
