---
version: 1.0
name: Line-design-system
description: Line is a poetry-first social app with an editorial dark aesthetic. The system pairs a deep charcoal canvas with white type, a single teal primary for CTAs, a rose accent for likes, and a gold for bookmarks. Iconography is Ionicons exclusively (via @expo/vector-icons), referencing Instagram's outline/filled pattern. Layout is a centered single column capped at 640px on tablet+ so web stops feeling like stretched mobile.

colors:
  background: "#0F0F0F"
  surface: "#1A1A1A"
  surfaceElevated: "#2A2A2A"
  primary: "#00D9FF"
  primaryPressed: "#00B8D4"
  secondary: "#FFD700"
  accent: "#FF6B9D"
  textPrimary: "#FFFFFF"
  textSecondary: "#A0A0A0"
  textMuted: "#666666"
  border: "#2A2A2A"
  backdrop: "rgba(0, 0, 0, 0.6)"

typography:
  heading-xl:
    fontSize: 26px
    fontWeight: 700
  heading-lg:
    fontSize: 24px
    fontWeight: 700
  heading-md:
    fontSize: 20px
    fontWeight: 700
  body-lg:
    fontSize: 17px
    fontWeight: 300
    lineHeight: 1.65
  body-md:
    fontSize: 16px
    fontWeight: 400
  body-sm:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  caption:
    fontSize: 12px
    fontWeight: 400
  section-label:
    fontSize: 13px
    fontWeight: 600
    textTransform: uppercase
    letterSpacing: 0.5px
  button-md:
    fontSize: 14px
    fontWeight: 700
  button-lg:
    fontSize: 16px
    fontWeight: 700

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  pill: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px

icons:
  library: "@expo/vector-icons / Ionicons"
  sizes:
    inline: 14
    action: 18
    detail: 22
    tab: 24
    cta: 28
  names:
    like-outline: "heart-outline"
    like-filled: "heart"
    comment: "chatbubble-outline"
    share: "paper-plane-outline"
    bookmark-outline: "bookmark-outline"
    bookmark-filled: "bookmark"
    notifications-outline: "notifications-outline"
    notifications-filled: "notifications"
    add-to-collection-outline: "albums-outline"
    add-to-collection-filled: "albums"
    overflow: "ellipsis-horizontal"
    search: "search"
    home-outline: "home-outline"
    home-filled: "home"
    explore-outline: "compass-outline"
    explore-filled: "compass"
    create-outline: "add-circle-outline"
    create-filled: "add-circle"
    profile-outline: "person-outline"
    profile-filled: "person"
    back: "chevron-back"
    forward: "chevron-forward"
    check: "checkmark"
    close: "close"

breakpoints:
  mobile: 0
  tablet: 600
  desktop: 1024

layout:
  contentMaxWidth: 640

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    minHeight: 48px
  button-primary-pressed:
    backgroundColor: "{colors.primaryPressed}"
    transform: "scale(0.98)"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
    border: "1px solid {colors.border}"
    minHeight: 44px
  button-destructive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    padding: "10px"
  card-post:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    marginBottom: "{spacing.md}"
  card-collection:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "14px"
    border: "1px solid {colors.border}"
    width: 220px
  sheet:
    backgroundColor: "{colors.surface}"
    roundedTop: "{rounded.xl}"
    paddingTop: "{spacing.sm}"
    paddingBottom: "{spacing.xl}"
    maxHeight: "75%"
  sheet-handle:
    width: 36px
    height: 4px
    rounded: 2px
    backgroundColor: "{colors.border}"
    alignSelf: center
  sheet-backdrop:
    backgroundColor: "{colors.backdrop}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
    border: "1px solid {colors.border}"
    minHeight: 44px
  input-focused:
    border: "1.5px solid {colors.primary}"
  input-error:
    border: "1px solid {colors.accent}"
  avatar:
    sizes: "32, 36, 40, 44, 72"
    rounded: "{rounded.pill}"
    fontWeight: 700
    textColor: "{colors.background}"
    portraitSource: "DiceBear lorelei via @ HTTPS PNG, seeded by uid"
    backgroundPalette: "10 brand colours; DiceBear deterministically picks one per seed"
    fallback: "Initials on coloured circle when uid is missing or image fails"
  heart-button:
    iconLibrary: Ionicons
    iconOutline: "heart-outline"
    iconFilled: "heart"
    colorInactive: "{colors.textSecondary}"
    colorActive: "{colors.accent}"
    animation: "spring scale 1.0 -> 1.4 -> 1.0 (friction 4, tension 80)"
  bookmark-button:
    iconLibrary: Ionicons
    iconOutline: "bookmark-outline"
    iconFilled: "bookmark"
    colorInactive: "{colors.textSecondary}"
    colorActive: "{colors.secondary}"
  follow-button-inactive:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    minHeight: 44px
  follow-button-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    border: "1px solid {colors.border}"
  tab-bar:
    backgroundColor: "{colors.surface}"
    borderTop: "1px solid {colors.border}"
    iconLibrary: Ionicons
    activeColor: "{colors.primary}"
    inactiveColor: "{colors.textSecondary}"
  badge-unread:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.textPrimary}"
    minWidth: 18px
    height: 18px
    rounded: 9px
    typography: "10px / 700"
---

## Overview

Line is mobile-first, dark-mode by default, editorial in its restraint. The page background is a deep charcoal that recedes; white type and a single teal CTA carry the brand. Likes light up rose; bookmarks light up gold. The system has exactly three accent colours — primary teal, secondary gold, accent rose — and they each serve one job each.

Iconography references **Instagram's outline/filled pattern** via Ionicons (`@expo/vector-icons`). Emojis are not used as UI; they render inconsistently across font versions, can't take colour, and break the editorial calm. The same outline icon turns filled to signal an active state (liked, bookmarked, current tab).

Layout collapses to a single column at any width. On tablet+ the column is capped at **640px** and centred, so the web view stops being a stretched mobile screen. The page background still spans the viewport — wide screens get a "newspaper column" effect, not a desktop dashboard.

**Key characteristics:**
- Deep charcoal canvas (`{colors.background}`) with `{colors.surface}` cards
- Single-column editorial layout, max content width 640 on tablet+
- Three meaningful accent colours, never mixed within a single feature
- Ionicons everywhere; outline ↔ filled toggles for active states (Instagram pattern)
- Rounded-rectangle buttons (`{rounded.md}`), not pills — the brand reads "editorial," not "consumer-tech-pill"
- Bottom-sheet modals with `{rounded.xl}` top corners + drag handle

## Colors

> All tokens live in [`src/utils/colorScheme.ts`](src/utils/colorScheme.ts). Never hard-code a hex elsewhere.

### Brand & Accent
- **Primary teal** (`{colors.primary}`): the single CTA fill — Sign in, Publish, Save, Follow when not following. Also focused-input border, links, and the active tab tint.
- **Primary pressed** (`{colors.primaryPressed}`): pressed state of primary buttons.
- **Secondary gold** (`{colors.secondary}`): bookmark filled state. Reserved for "you saved this" affordances.
- **Accent rose** (`{colors.accent}`): like filled state, unread badges, error text. The "this is yours / new / urgent" colour.

### Surface
- **Background** (`{colors.background}`): page canvas, splash, modal backdrop overlay (alpha 0.6 on top of this).
- **Surface** (`{colors.surface}`): cards, sheets, inputs, secondary buttons.
- **Surface elevated** (`{colors.surfaceElevated}`): reserved for raised states. Same hex as `border` today.
- **Border** (`{colors.border}`): dividers, input outlines, card outlines.

### Text
- **Text primary** (`{colors.textPrimary}`): body and headings on dark surfaces.
- **Text secondary** (`{colors.textSecondary}`): meta, timestamps, inactive tab, inactive icon.
- **Text muted** (`{colors.textMuted}`): placeholders, disabled states.

### Semantic
The system intentionally has no `success` / `warning` / `info` tokens. Error messaging uses `{colors.accent}`. Affirmative feedback uses `{colors.primary}`. If a third semantic state appears, document it here before shipping.

## Typography

React Native's system stack — San Francisco on iOS, Roboto on Android, system-ui on web. Poem content uses `fontWeight: 300` to feel lyrical against the heavier 400–700 used elsewhere.

| Token | Size | Weight | Notes |
|---|---|---|---|
| `{typography.heading-xl}` | 26 | 700 | Tab landings (Home, Explore titles) |
| `{typography.heading-lg}` | 24 | 700 | Poem title in PostDetail |
| `{typography.heading-md}` | 20 | 700 | Profile display name |
| `{typography.body-lg}` | 17 | 300 | Poem content (lyrical light weight) |
| `{typography.body-md}` | 16 | 400 | Standard body, inputs |
| `{typography.body-sm}` | 14 | 400 | Comments, post body in feed |
| `{typography.caption}` | 12 | 400 | Meta, timestamps |
| `{typography.section-label}` | 13 | 600 | UPPERCASE, tracking 0.5, `{colors.textSecondary}` |
| `{typography.button-md}` | 14 | 700 | Secondary / destructive button labels |
| `{typography.button-lg}` | 16 | 700 | Primary CTA labels |

### Principles
- Poem body uses 300 weight to introduce visual rest between the 700-weight title and the 400-weight metadata.
- Section labels (`{typography.section-label}`) are 600-weight uppercase with 0.5 tracking, in `{colors.textSecondary}`. They're navigational, not decorative — use them for "Your poems", "Saved", "Notifications".
- Inputs and primary CTAs share `body-md` (16/400) for the value text and `button-lg` (16/700) for the action — same size, weight contrast carries the affordance.

## Icons

The **single** icon library: `Ionicons` via `@expo/vector-icons` (bundled with Expo SDK 56, zero install).

| Concept | Outline | Filled |
|---|---|---|
| Like | `{icons.names.like-outline}` | `{icons.names.like-filled}` |
| Comment | `{icons.names.comment}` | — |
| Share | `{icons.names.share}` | — |
| Bookmark | `{icons.names.bookmark-outline}` | `{icons.names.bookmark-filled}` |
| Notifications | `{icons.names.notifications-outline}` | `{icons.names.notifications-filled}` |
| Add to collection | `{icons.names.add-to-collection-outline}` | `{icons.names.add-to-collection-filled}` |
| Overflow / More | `{icons.names.overflow}` | — |
| Search | `{icons.names.search}` | — |
| Home (tab) | `{icons.names.home-outline}` | `{icons.names.home-filled}` |
| Explore (tab) | `{icons.names.explore-outline}` | `{icons.names.explore-filled}` |
| Create (tab) | `{icons.names.create-outline}` | `{icons.names.create-filled}` |
| Profile (tab) | `{icons.names.profile-outline}` | `{icons.names.profile-filled}` |
| Back | `{icons.names.back}` | — |
| Check (selected) | — | `{icons.names.check}` |

### Sizes
Use one of: 14 (inline tight), 18 (action row), 22 (PostDetail action row), 24 (tab bar), 28 (major CTA). Don't invent intermediate sizes.

### Colours
Match the surrounding text colour by default — `{colors.textSecondary}` for actions, `{colors.accent}` for active heart, `{colors.secondary}` for active bookmark, `{colors.primary}` for active tab and link icons.

### Instagram reference
Line's icon pattern mirrors Instagram's home feed: heart, comment bubble, paper-plane share, bookmark. Same icons, same outline/filled toggle, same colours-on-tap.

## Layout & Responsiveness

### Breakpoints

| Name | Width | Effect |
|---|---|---|
| `mobile` | `< 600` | Full-width column, no constraint |
| `tablet` | `600 – 1023` | Centred column `maxWidth: 640` |
| `desktop` | `≥ 1024` | Centred column `maxWidth: 640`, dark margins on both sides |

### Content max width

`layout.contentMaxWidth = 640`. Picked so poem lines stay comfortably readable — Robert Bringhurst's "Elements of Typographic Style" puts the comfortable line length at 45–75 characters; 640px at body-md size lands in that range.

### How to apply

Use the `useContentStyle()` hook from `src/utils/responsive.ts` at the outer layout of each screen. It returns a style object (`{ maxWidth, alignSelf, width }`) on tablet+ and `null` on mobile.

```ts
const contentStyle = useContentStyle()
return (
  <SafeAreaView style={styles.container}>
    <View style={[styles.header, contentStyle]}>...</View>
    <FlatList contentContainerStyle={[styles.list, contentStyle]} ... />
  </SafeAreaView>
)
```

The page background stays full-width; only the inner content is constrained.

### What we explicitly don't do (yet)
- **No sidebar nav on desktop.** Bottom tab bar everywhere. Instagram-web-style sidebar is a future refactor.
- **No multi-column grids.** Single column is the editorial choice.
- **No styled hover.** Web pointer hover is unstyled — pressed state covers tap. Hover comes later.

## Components

### Buttons

| Token | Background | Text | Use |
|---|---|---|---|
| `{components.button-primary}` | `{colors.primary}` | `{colors.background}` | Sign in, Publish, Save, Follow (when not following) |
| `{components.button-secondary}` | `{colors.surface}` | `{colors.textPrimary}` | Edit profile, Saved, Following state |
| `{components.button-destructive}` | `{colors.surface}` | `{colors.accent}` | Sign out, Delete, Block |
| `{components.button-ghost}` | transparent | `{colors.primary}` | Header back/share/submit |

All interactive buttons: `{rounded.md}` corners (we are NOT a pill-button system), `minHeight: 44` (WCAG AA), pressed `opacity: 0.7` + light `scale(0.98)`.

### Cards

`{components.card-post}` and `{components.card-collection}` are the two card chromes. Both sit on `{colors.surface}` with `{rounded.lg}` corners.

### Sheets

Bottom-anchored modals slide up from off-screen with `Modal animationType="slide"`. Visual recipe:

- `{components.sheet}`: surface background, top corners only rounded `{rounded.xl}`, max height 75%
- `{components.sheet-handle}`: the 36×4 drag handle at top centre, `{colors.border}` fill
- `{components.sheet-backdrop}`: `rgba(0,0,0,0.6)` `Pressable` that closes on tap
- Header row: Cancel (left) · Title (centre) · Submit (right) — same pattern across ReportSheet, AddToCollectionSheet, EditCollection modal

### Inputs

`{components.input}` for text fields. Focus state switches the border to `{components.input-focused}`; validation error to `{components.input-error}`.

### Avatars

`<Avatar uid={...} name={...} avatarIndex={...} size={...} />`.

When `uid` is passed (every signed-in user has one), the avatar renders a **DiceBear `lorelei` portrait** — line-drawn faces seeded by the uid so each user is deterministic and unique. The PNG is fetched from `api.dicebear.com/9.x/lorelei/png?seed={uid}&size={size*2}&backgroundColor={brandPalette}`. RN's `<Image>` caches the result so the avatar loads once per user per session.

Initials on a coloured circle (`{colors.background}` text on `getAvatarColor(avatarIndex)` fill) render **behind** the image as a fallback — visible while the image loads and if the network fails. The fallback also kicks in when no uid is passed (e.g., loading states).

Sizes used in the app: 32 (comments), 36 (PostCard header), 40 (LikesModal / suggested / search rows), 44 (PostDetail header), 72 (profile header). Pass the same number you'd render at — the helper requests 2× pixels from DiceBear for sharpness.

### Tab bar

`{components.tab-bar}`. Four tabs, Ionicons. Active tab uses the `*-filled` variant in `{colors.primary}`; inactive uses `*-outline` in `{colors.textSecondary}`.

### Heart / Bookmark / Follow buttons

Highly-specific component recipes baked into the system because they appear everywhere:

- `{components.heart-button}`: outline ↔ filled, `{colors.accent}` when filled, spring scale on tap (1.0 → 1.4 → 1.0)
- `{components.bookmark-button}`: outline ↔ filled, `{colors.secondary}` when filled
- `{components.follow-button-inactive}` vs `{components.follow-button-active}`: solid primary vs outlined surface, label "Follow" / "Following"

## Animation

| Pattern | Library | Use |
|---|---|---|
| Heart bounce | `Animated.spring` sequence | `HeartButton` — scale 1.0 → 1.4 → 1.0 |
| Auth flip card | `Animated.timing` + interpolation | LoginScreen, 600ms `bezier(0.25, 0.46, 0.45, 0.94)` |
| Modal slide-up | Built-in `Modal animationType="slide"` | All bottom sheets |

Reanimated is installed but unused. New animations should use the built-in `Animated` API unless a use case demands worklet-driven performance (shared-element transitions, gesture-driven UIs).

## Platform notes

- **iOS / Android:** primary targets.
- **Web:** secondary; layouts work via the responsive column, but keyboard navigation (Tab to next input, Enter to submit) is unverified.
- **Expo Go:** Google sign-in does not work (Google OAuth blocks `exp://` URIs). Use a dev build for the full Google flow.

## Do's and Don'ts

### Do
- Use **Ionicons** through `@expo/vector-icons`. The outline/filled toggle IS the active-state language.
- Cap content at `{layout.contentMaxWidth}` on tablet+ via `useContentStyle()`. Background stays full-width; only the content centres.
- Use exactly one accent colour per feature beat — primary for CTAs, accent for likes, secondary for bookmarks. Don't double-up.
- Reuse the bottom-sheet recipe (`{components.sheet}`) for new modals — drag handle + Cancel/Title/Submit header.
- Match icon size to context: 18 in action rows, 22 in PostDetail, 24 in tab bar.

### Don't
- Don't use emoji as icons (`⋯` `🔔` `📚` `★` `♥` etc.) — they're inconsistent across font versions and can't take colour. Use Ionicons.
- Don't introduce a second icon library. Stay on Ionicons.
- Don't reach for `{rounded.pill}` for action buttons — Line uses `{rounded.md}` rectangles. Pills are reserved for badges only.
- Don't render full-width content on web. If a new screen renders edge-to-edge on a 1500px viewport, it's missing `useContentStyle()`.
- Don't introduce additional accent colours. The three-colour budget is intentional.
- Don't deepen modal corners below `{rounded.xl}`. Bottom sheets use that radius to read as overlays, not as cards.

## Responsive behavior

### Breakpoints + collapsing

| Breakpoint | Layout |
|---|---|
| Mobile (< 600) | Full-width single column; bottom tab bar; sheets slide from bottom |
| Tablet (600 – 1023) | Single column centred at 640; dark margins outside; bottom tabs span full width |
| Desktop (≥ 1024) | Same as tablet; wider dark margins |

The collapse from desktop down to mobile is **trivial** because the layout is the same column at every size — only the surrounding margin disappears.

### Touch targets
- Primary buttons render at 48px height. Above WCAG AAA (44px).
- Secondary buttons at 44px (WCAG AA).
- Icon-only action buttons get `hitSlop` of 8 to extend the touch area beyond the visual.
- Form inputs render at 44px to align with secondary buttons.

## Iteration guide

1. Reach for an existing token (`{colors.primary}`, `{spacing.lg}`, `{rounded.md}`). If you genuinely need a new value, add it to the YAML frontmatter above and use it from there.
2. New iconography? It's an Ionicons name. If Ionicons doesn't have it, propose a refactor of this doc before reaching for another library.
3. New screen? Run `useContentStyle()` at the outer container. Test the screen at 375px, 768px, and 1280px viewport widths.
4. New modal? Use the `{components.sheet}` recipe, not a Modal-from-scratch.
5. When in doubt about colour intensity, ask: is this affirmative (primary), is this a like-style highlight (accent), or is this neutral surface (surface)?

## Known gaps

- **Hover states** aren't styled — web users see no pointer feedback. Pressed state covers tap interactions, but the visual gap on hover is real.
- **Light mode** isn't supported. The whole brand assumes charcoal canvas. A light-mode token set would need careful work on contrast for the rose / teal / gold accents.
- **Keyboard navigation** on web (Tab, Enter, Esc) is unverified. The TextInputs work; modal-dismiss-on-Esc may not.
- **`surfaceElevated` token** currently has the same hex as `border`. If a future raised state needs distinct treatment, separate them.
