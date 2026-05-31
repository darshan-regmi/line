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
