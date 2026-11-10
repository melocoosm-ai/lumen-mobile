# Store listing kit

Copy-paste material for App Store Connect and Google Play Console.

## Shared

| Field | Value |
| --- | --- |
| App name | Lumen |
| Subtitle (iOS, ≤30) | Fast, private web browser |
| Short description (Play, ≤80) | A fast, private web browser with tabs and bookmarks. No accounts, no tracking. |
| Category | iOS: Utilities · Play: Communication (browsers are listed there) |
| Price | Free |
| Privacy policy URL | `https://github.com/melocoosm-ai/lumen-mobile/blob/main/PRIVACY.md` |
| Support URL | `https://github.com/melocoosm-ai/lumen-mobile/issues` |
| Bundle ID / package | `io.github.melocoosmai.lumen` |
| Age rating | 17+ on iOS / "Unrestricted internet access: Yes" on Play (required for any browser) |

### Full description

Lumen is a clean, fast web browser that keeps your browsing yours.

• Tabs — open as many as you need and switch with a tap
• Smart address bar — type a website or just search
• Bookmarks — star any page; your favourites appear on the new-tab page
• Share any page to other apps
• Opens phone numbers, email and map links in the right app
• Light and dark themes that follow your device

Private by default:
• No accounts, no ads, no analytics, no tracking
• Third-party cookies are blocked
• Searches go to DuckDuckGo
• Your tabs and bookmarks are stored only on your device

### Keywords (iOS, ≤100 chars)

`browser,private,web,tabs,bookmarks,search,fast,internet,safe,simple`

## Apple App Store — App Privacy answers

- **Do you or your third-party partners collect data from this app?** → **No, we do not collect data from this app.**
- Tracking → No
- Export compliance → already declared in `app.json` (`usesNonExemptEncryption: false`; the app only uses
  standard HTTPS from the OS).

## Google Play — Data safety answers

- Does your app collect or share any of the required user data types? → **No**
- Is all user data encrypted in transit? → Yes (websites over HTTPS; the app itself sends nothing)
- Do you provide a way for users to request that their data is deleted? → Not applicable (no data collected);
  on-device data is removed by uninstalling.
- Ads → **No ads**
- Target audience → 18+ (or 13+; a general-purpose browser should not target children)
- Content rating questionnaire → declare **unrestricted internet access**

## Screenshots you still need

Both stores require screenshots from a real device or simulator:

- **iOS:** 6.9" iPhone (1320×2868) — at least 3. iPad 13" (2064×2752) because `supportsTablet` is on.
- **Android:** phone screenshots (min 1080 px on the short side) — at least 2.
- **Play feature graphic:** `assets/store-feature-graphic.png` (1024×500) ✓
- **Play icon:** `assets/store-icon-512.png` (512×512) ✓

Suggested shots: new-tab page with bookmarks · a website loaded · the tab switcher · dark mode.
