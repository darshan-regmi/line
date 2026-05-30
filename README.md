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

- Node.js 16+ & npm
- Expo CLI: `pnpm install -g eas-cli`
- Firebase project (create at [console.firebase.google.com](https://console.firebase.google.com))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/darshan-regmi/line.git
cd line
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable: Authentication (Email/Password), Firestore
   - Download your Firebase config

4. **Configure environment variables**

```bash
# Create .env.local
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. **Start the dev server**

```bash
pnpm start
```

6. **Run on device or emulator**

```bash
# iOS
pnpm run ios

# Android
pnpm run android

# Web
pnpm run web
```

---

## 📁 Project Structure

```
src/
├── config/
│   └── firebase.ts                 # Firebase initialization
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx         # Login/Signup with flip animation
│   ├── home/
│   │   └── HomeScreen.tsx          # Feed & recommendations
│   ├── profile/
│   │   ├── ProfileScreen.tsx       # User profile view
│   │   └── EditProfileScreen.tsx   # Edit profile modal
│   ├── explore/
│   │   ├── ExploreScreen.tsx       # Trending & search
│   │   └── UserSearchScreen.tsx
│   └── create/
│       └── CreatePostScreen.tsx    # Compose poem
├── components/
│   ├── Avatar.tsx                  # Initials avatar
│   ├── PostCard.tsx                # Post display
│   ├── CommentItem.tsx             # Comment with interactions
│   ├── UserCard.tsx                # User profile card
│   └── AnimatedButton.tsx          # Pressable with feedback
├── services/
│   ├── authService.ts              # Auth functions
│   ├── postService.ts              # CRUD for posts
│   ├── userService.ts              # User data operations
│   └── firestoreService.ts         # Generic Firestore helpers
├── hooks/
│   ├── useAuthListener.ts          # Auth state management
│   ├── usePost.ts                  # Post real-time listener
│   └── useUser.ts                  # User data hook
├── context/
│   ├── AuthContext.tsx             # Auth provider
│   └── PostContext.tsx             # Post state management
├── utils/
│   ├── formatters.ts               # Date, text formatting
│   ├── validators.ts               # Input validation
│   ├── colorScheme.ts              # Color constants
│   └── avatarHelpers.ts            # Avatar generation
├── animations/
│   └── transitions.ts              # Reanimated 2 configs
├── navigation/
│   ├── AppNavigator.tsx            # Root navigator
│   ├── AuthStack.tsx               # Auth screens
│   └── MainTabs.tsx                # Bottom tabs
├── assets/
│   ├── icons/                      # SVG icons
│   ├── fonts/                      # Inter font files
│   └── animations/                 # Lottie files
├── App.tsx                         # Root component
└── index.ts                        # Entry point

```

---

## 🛠️ Tech Stack

| Layer                | Technology                          |
| -------------------- | ----------------------------------- |
| **Frontend**         | React Native, Expo, TypeScript      |
| **Backend**          | Firebase (Auth, Firestore, Storage) |
| **State Management** | React Context API                   |
| **Navigation**       | React Navigation v6                 |
| **Animations**       | React Native Reanimated 2           |
| **UI Components**    | Custom-built (no heavy libraries)   |
| **Styling**          | React Native StyleSheet             |

---

## 🔒 Security

### Firebase Security Rules

#### Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all users, write only their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Posts are public to read, write only by author
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;

      // Comments subcollection
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth.uid == resource.data.userId;
      }
    }
  }
}
```

#### Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

---

## 📈 Implementation Roadmap

### Phase 1: MVP (Current)

- [x] Firebase Auth (Email/Password, Google)
- [ ] User signup & profile creation
- [ ] Post creation & publishing
- [ ] Home feed with pagination
- [ ] Like & comment system
- [ ] User profiles

### Phase 2: Polish & Engagement

- [ ] Real-time notifications (likes/comments)
- [ ] Firebase Cloud Messaging integration
- [ ] Post sharing & social features
- [ ] Advanced search & filters
- [ ] User recommendations engine

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

### Testing

```bash
# Run tests
pnpm test

# Run linter
pnpm run lint

# Build for production
pnpm run build
```

---

## 🐛 Known Issues & Limitations

- **Google Sign-In**: Requires Firebase project configuration in Google Cloud Console
- **Avatar Storage**: Currently uses initials only; pre-made icons coming in Phase 2
- **Real-time**: Firestore listeners may incur costs at scale; consider caching strategies
- **Push Notifications**: Not yet integrated; planned for Phase 2

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

_Last updated: December 2025_
