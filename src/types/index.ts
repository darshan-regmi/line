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
