# Line

> A poetry-focused social media platform where poets share what they feel.

[![React Native](https://img.shields.io/badge/React%20Native-0.76+-5C2D91?style=flat&logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-latest-000020?style=flat&logo=expo)](https://expo.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Overview

**Line** is a mobile-first social platform built with React Native and Expo, designed exclusively for poets and creative writers. Share your verses, connect with other poets, and discover beautiful poems from around the world.

The app features a **dark-mode editorial aesthetic** with smooth animations, real-time interactions, and a clean, minimalist interface optimized for reading and sharing poetry.

---

## 🎯 Features

### 🔐 Authentication

- Email/Password signup & login with Firebase Auth
- Google Sign-In integration
- Persistent user sessions with AsyncStorage
- Profile creation with display name, username, and bio

### 📝 Post Management

- Create and publish poems with title & content fields
- Rich text editor with character counter
- Draft poems with auto-save to Firestore
- Publish/unpublish toggle for full control
- Post metadata: timestamps, author info, interaction counts

### 💬 Social Interactions

- **Like poems** with animated heart interactions (scale + bounce)
- **Comment on posts** with real-time updates
- **Like/unlike comments** with micro-animations
- View likes list with smooth modal transitions
- Like tracking with user IDs for consistency

### 👤 User Profiles

- Edit profile info (display name, bio, avatar)
- View user's published poems in grid or list layout
- Follow/unfollow system with live counter updates
- User statistics: followers, following, post count
- "My Likes" collection for personalized discovery
- Initials-based avatars (DR for Darshan Regmi) with consistent coloring

### 🔍 Discovery

- Home feed showing poems from followed users + recommendations
- Explore/Trending section sorted by likes
- Search users & poems with debounced real-time results
- Follow recommendations based on activity
- Pull-to-refresh feed with animated spinner

### ⚡ Performance & UX

- Paginated Firestore queries (pageSize: 10)
- Lazy loading images with caching
- Optimistic UI updates for instant feedback
- Smooth skeleton loaders on data fetch
- Loading states & error boundaries
- Gesture feedback with haptic responses

---

## 🎨 Design System

### Dark Mode Aesthetic

```
Background:      #0F0F0F (Deep Charcoal)
Surface:         #1A1A1A (Card Backgrounds)
Primary:         #00D9FF (Teal - Buttons, Links)
Secondary:       #FFD700 (Soft Gold - Highlights)
Accent:          #FF6B9D (Rose Pink - Likes)
Text Primary:    #FFFFFF (White)
Text Secondary:  #A0A0A0 (Muted Gray)
```

### Typography

- **Headings**: Inter Bold 24-32px
- **Body**: Inter Regular 14-16px
- **Captions**: Inter Regular 12px
- **Poem Content**: Inter Light 16-18px (lyrical feel)

### Components

- **Navigation**: Bottom Tab Navigation (Home, Explore, Create, Profile)
- **Inputs**: Clean bordered fields with teal focus states
- **Buttons**: Rounded 12-16px, minimum touch target 48px
- **Modals**: Smooth slide-up with backdrop blur

---

## 🗄️ Database Schema (Firestore)

### Users Collection

```typescript
users/{userId}
├── uid: string
├── username: string
├── email: string
├── displayName: string
├── bio: string
├── avatarType: "initials" | "icon"
├── avatarIndex: number
├── followersCount: number
├── followingCount: number
├── createdAt: timestamp
└── updatedAt: timestamp

users/{userId}/following/{followingUserId}: true
users/{userId}/followers/{followerUserId}: true
```

### Posts Collection

```typescript
posts/{postId}
├── postId: string
├── userId: string (author)
├── content: string (poem text)
├── title: string
├── likes: string[] (userId references)
├── likesCount: number
├── commentsCount: number
├── isPublished: boolean
├── createdAt: timestamp
└── updatedAt: timestamp

posts/{postId}/comments/{commentId}
├── commentId: string
├── userId: string (commenter)
├── content: string
├── likes: string[] (userId references)
├── likesCount: number
└── createdAt: timestamp
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Firebase project (create at [console.firebase.google.com](https://console.firebase.google.com))
- For Google sign-in: a Google Cloud OAuth client (iOS, Android, Web) linked to the same project
- Optional: `firebase-tools` for deploying rules/indexes from the CLI

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/darshan-regmi/line.git
   cd line
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable **Authentication** (Email/Password + Google) and **Firestore**
   - Copy your web app config

4. **Configure environment variables**

   Copy `.env.example` → `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   All required keys are documented in `.env.example` (Firebase config + Google OAuth client IDs for iOS/Android/Web).

5. **Deploy Firestore rules and indexes**

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore
   ```

   This publishes `firestore.rules` and the composite indexes in `firestore.indexes.json`.

6. **Start the dev server**

   ```bash
   npm start            # Metro bundler
   npx expo start --go  # forces Expo Go mode for QR-code testing on a phone
   ```

   > **Note:** Google sign-in does **not** work in Expo Go (Google's OAuth policy rejects `exp://` URIs). To test Google sign-in on a device, build a development build with `eas build --profile development`.

---

## 📁 Project Structure

```
src/
├── config/
│   └── firebase.ts                  # Firebase init (web + native persistence)
├── types/
│   └── index.ts                     # Post, Comment, UserProfile types
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx          # Login/Signup with flip animation
│   ├── home/
│   │   └── HomeScreen.tsx           # Paginated feed + pull-to-refresh
│   ├── explore/
│   │   └── ExploreScreen.tsx        # Trending & search (stub — Phase 2)
│   ├── create/
│   │   └── CreatePostScreen.tsx     # Compose poem
│   ├── post/
│   │   └── PostDetailScreen.tsx    # Full post + comments + composer
│   └── profile/
│       ├── ProfileScreen.tsx        # Profile header + user's posts
│       └── EditProfileScreen.tsx    # Edit display name / bio (modal)
├── components/
│   ├── Avatar.tsx                   # Initials avatar
│   ├── PostCard.tsx                 # Post tile with optimistic like
│   ├── CommentItem.tsx              # Comment row
│   └── AnimatedButton.tsx           # Pressable with feedback
├── services/
│   ├── postService.ts               # CRUD + paginated feed queries
│   ├── userService.ts               # User doc + follow/unfollow
│   └── commentService.ts            # Comment CRUD
├── hooks/
│   ├── useAuthListener.ts           # Auth state + ensureUserDoc
│   ├── useFeed.ts                   # Paginated feed state machine
│   ├── usePost.ts                   # Single post fetch
│   └── useUser.ts                   # User lookup with in-memory cache
├── context/
│   └── AuthContext.tsx              # Auth provider + signOut
├── utils/
│   ├── formatters.ts                # Date + text formatting
│   ├── colorScheme.ts               # Color tokens (dark palette)
│   └── avatarHelpers.ts             # Initials + color generation
├── navigation/
│   ├── AppNavigator.tsx             # Auth vs Main switch
│   ├── AuthStack.tsx                # Login screen
│   ├── MainTabs.tsx                 # Home / Explore / Create / Profile
│   └── MainStack.tsx                # Wraps tabs + modal routes
└── App.tsx                          # Root: Gesture/Safe/Auth/Navigator

assets/
├── icon.png                         # 1024² app icon (iOS)
├── adaptive-icon.png                # 1024² Android foreground
├── splash-icon.png                  # 1024² splash artwork
├── favicon.png                      # 48² web favicon
└── sources/                         # SVG sources for the above

# Backend infra (project root)
firestore.rules                      # Security rules (deployed)
firestore.indexes.json               # Composite indexes (deployed)
firebase.json                        # Firebase CLI config
.firebaserc                          # Project alias
.env.example                         # Template for .env.local
```

---

## 🛠️ Tech Stack

| Layer                | Technology                                      |
| -------------------- | ----------------------------------------------- |
| **Frontend**         | React Native 0.85, Expo SDK 56, TypeScript 6    |
| **Backend**          | Firebase (Auth, Firestore, Storage)             |
| **Auth persistence** | `@react-native-async-storage/async-storage`     |
| **Google sign-in**   | `expo-auth-session` (requires dev build)        |
| **State management** | React Context API                               |
| **Navigation**       | React Navigation v7 (native-stack + bottom-tab) |
| **Animations**       | React Native Animated API + Reanimated 4        |
| **UI components**    | Custom-built (no heavy UI libraries)            |
| **Styling**          | React Native `StyleSheet`                       |

---

## 🔒 Security

### Firestore Rules

The deployed rules live in [`firestore.rules`](firestore.rules). They allow:

- **Users:** any signed-in user can read profiles; only self can write profile fields; any signed-in user can bump another user's `followersCount` by ±1 (for the follow flow).
- **Posts:** publicly readable; only the author can edit or delete; any signed-in user can toggle their own like (`isOwnLikeToggle()` enforces that only the requester's uid moves in/out of the `likes` array); any signed-in user can bump `commentsCount` by exactly +1 when creating a comment.
- **Comments:** publicly readable; only the comment author can edit or delete.

The narrow carve-outs for likes and comment-count bumps are what make the social interactions possible without exposing other post fields to non-authors.

### Composite Indexes

The deployed indexes live in [`firestore.indexes.json`](firestore.indexes.json):

- `posts` collection — `isPublished` ASC + `createdAt` DESC (Home feed)
- `posts` collection — `userId` ASC + `createdAt` DESC (a user's posts)

### Deploy

```bash
firebase deploy --only firestore           # both rules and indexes
firebase deploy --only firestore:rules     # rules only
firebase deploy --only firestore:indexes   # indexes only
```

### Storage Rules

Not deployed yet — Storage uploads aren't used in Phase 1 (avatars are initials-based). A starter rule for when avatars come in Phase 2:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

---

## 📈 Implementation Roadmap

### Phase 1: MVP ✅ Complete

- [x] Firebase Auth (Email/Password, Google)
- [x] User signup + profile auto-creation on any sign-in path
- [x] Post creation & publishing
- [x] Home feed with pagination (10 per page, pull-to-refresh, infinite scroll)
- [x] Like + comment system (optimistic UI on PostCard and PostDetail)
- [x] User profiles (header, stats, posts list, edit modal)
- [x] Firestore security rules and composite indexes deployed
- [x] Dark-mode brand icon set

### Phase 2: Polish & Engagement — In-app pieces complete, push delivery pending

**Social graph** ✅

- [x] Other-user profile screen (read-only profile view)
- [x] Follow / unfollow button + optimistic counter updates
- [x] Trending Explore tab (`posts` sorted by `likesCount` DESC)

**Real-time UX** ✅

- [x] `onSnapshot` listeners on home + explore feed (first page only)
- [x] `onSnapshot` listeners on comments in PostDetail
- [x] Animated heart bounce on like (spring scale 1.0 → 1.4 → 1.0)
- [x] "View likes" modal listing users who liked a post
- [x] Comment like / unlike (with own rule carve-out)

**Sharing & search** ✅

- [x] Native share sheet for posts (React Native built-in `Share`, not `expo-sharing` — text content, not files)
- [x] Basic prefix search on `usernameLower` / `titleLower` fields
- [x] Debounced search input (300ms) with empty + loading states
- [ ] **Limitation:** Firestore only supports prefix matching, not fuzzy / substring search. A backfill script (`npm run backfill-search`) is required for docs created before the lowercase fields were added. Real fuzzy search needs Algolia or Typesense → Phase 3 decision.

**Discovery** ✅

- [x] Personalized home feed: posts from people you follow, with fallback to global latest when not following anyone
- [x] "Suggested for you" section on Explore: top accounts by followers excluding self + already-followed
- [x] Real-time follows list (`useFollowingUids` via `onSnapshot`) so suggestions and feed refresh on follow/unfollow

**Notifications** — in-app complete; push delivery pending

- [x] Real-time notification doc writes on like / comment / follow (best-effort, client-driven, no Cloud Function needed)
- [x] Notification center UI: bell button + unread badge + screen with mark-all-read on focus
- [x] Firestore rule carve-out so any signed-in user can write to a recipient's inbox without reading it
- [ ] Firebase Cloud Messaging integration (push tokens, lock-screen banners)
- **Push blockers:** requires Firebase Blaze plan (paid) for Cloud Functions, an APNs cert from Apple Developer, and a development build (no Expo Go).

### Phase 3: Scale & Community

- [ ] Poetry collections & anthologies
- [ ] User messaging
- [ ] Community groups & reading circles
- [ ] Poem analytics (views, engagement)
- [ ] Content moderation tools

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:

- Code follows TypeScript best practices
- Components are memoized where appropriate
- Animations use Reanimated for performance
- Dark mode is always the primary theme
- Accessibility is considered (minHeight 48px, proper contrast)

---

## 📝 Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow Expo conventions
- Keep components under 300 lines
- Memoize expensive computations

### Performance

- Use `useMemo` for heavy computations
- Paginate Firestore queries (max 10-20 items)
- Lazy load images with caching
- Avoid re-renders with `useCallback`

### Quality checks

```bash
# TypeScript + ESLint
npm run lint

# TypeScript only
npm run check-typescript

# ESLint only
npm run check-eslint

# Format with Prettier
npm run prettier

# Tests (when configured)
npm test
```

Pre-commit hooks (Husky + lint-staged) run ESLint + Prettier on changed `*.{ts,tsx}` files automatically.

---

## 🐛 Known Issues & Limitations

- **Google sign-in in Expo Go:** Google's OAuth 2.0 policy rejects custom URI schemes like `exp://`, so the Google button only works in a **development build** (not Expo Go). Build one with `eas build --profile development` to test it on a phone.
- **Avatars:** initials-only for Phase 1; image uploads to Firebase Storage come in Phase 2.
- **Real-time:** the feed currently fetches on focus/refresh rather than using `onSnapshot` listeners. Real-time is planned for Phase 2 (and has cost implications at scale).
- **Push notifications:** not integrated; planned for Phase 2 (FCM).
- **Username uniqueness:** Firestore rules can't enforce cross-document uniqueness. Phase 2 will add a separate `usernames/{username}` lookup collection if needed.

---

## 📞 Support & Contact

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Email**: [darshanregmi.official@gmail.com](mailto:darshanregmi.official@gmail.com)
- **Twitter/X**: [@darshanregmi_np](https://twitter.com/darshanregmi_np)
- **Portfolio**: [darshanregmi.com.np](https://darshanregmi.com.np)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Expo team** for the amazing React Native framework
- **Firebase** for backend infrastructure
- **React Navigation** for seamless navigation
- **Reanimated** for smooth, performant animations
- Poetry community for inspiration ✨

---

## 💭 Philosophy

> "A place where poets can share what they feel — where code becomes poetry, and poetry becomes code."

Line is built with the belief that **poetry deserves a beautiful platform**. Every animation, color, and interaction is intentional. The app feels alive because the poems it hosts deserve to be celebrated.

---

**Made with 💚 by Darshan Regmi**

_Last updated: May 2026 — Phase 1 complete; Phase 2 in-app features all shipped (social, real-time, sharing, search, recommendations, in-app notifications). Only FCM push delivery pending (paid infra)._
