const AVATAR_COLORS = [
  '#00D9FF',
  '#FFD700',
  '#FF6B9D',
  '#7B61FF',
  '#3DDC97',
  '#FF9F1C',
  '#E63946',
  '#06D6A0',
  '#F4A261',
  '#A8DADC'
] as const

export const getInitials = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return '?'

  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()

  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export const getAvatarColor = (index: number | undefined | null): string => {
  if (index == null || index < 0) return AVATAR_COLORS[0]!
  return AVATAR_COLORS[index % AVATAR_COLORS.length]!
}
