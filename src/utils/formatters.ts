import { Timestamp } from 'firebase/firestore'

export const formatRelativeTime = (ts: Timestamp | null | undefined): string => {
  if (!ts) return 'just now'

  const date = ts.toDate()
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const truncate = (text: string, max: number): string => {
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + '…'
}

export const pluralize = (count: number, singular: string, plural?: string): string => {
  const word = count === 1 ? singular : (plural ?? `${singular}s`)
  return `${count} ${word}`
}
