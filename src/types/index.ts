import { Timestamp } from 'firebase/firestore'

export type UserProfile = {
  uid: string
  username: string
  email: string
  displayName: string
  bio: string
  avatarType: 'initials' | 'icon'
  avatarIndex: number
  followersCount: number
  followingCount: number
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type Post = {
  postId: string
  userId: string
  title: string
  content: string
  likes: string[]
  likesCount: number
  commentsCount: number
  viewCount: number
  isPublished: boolean
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type Comment = {
  commentId: string
  userId: string
  content: string
  likes: string[]
  likesCount: number
  createdAt: Timestamp | null
}

export type Collection = {
  collectionId: string
  ownerId: string
  title: string
  description: string
  isPublic: boolean
  postCount: number
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type Thread = {
  threadId: string
  participantIds: string[]
  lastMessage: string | null
  lastMessageAt: Timestamp | null
  lastMessageSenderId: string | null
  /** Per-participant unread count. Server increments on send, client resets on read. */
  unreadCounts: Record<string, number>
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type Message = {
  messageId: string
  senderId: string
  content: string
  createdAt: Timestamp | null
}

export type ReportTargetType = 'post' | 'comment' | 'user'

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate'
  | 'sexual'
  | 'self_harm'
  | 'misinformation'
  | 'other'

export type NotificationType = 'like' | 'comment' | 'follow'

export type Notification = {
  notificationId: string
  type: NotificationType
  actorUid: string
  recipientUid: string
  postId?: string
  commentId?: string
  read: boolean
  createdAt: Timestamp | null
}
