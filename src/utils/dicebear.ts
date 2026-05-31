/**
 * DiceBear avatar URL builder. See https://github.com/dicebear/dicebear.
 *
 * Style is `lorelei` — line-drawn portraits that match Line's editorial
 * aesthetic. Avatars are seeded by the user's uid so each user is
 * deterministic + unique without any state.
 *
 * The `backgroundColor` list is our 10 brand avatar colours; DiceBear
 * picks one based on the seed, so each user gets a stable colour halo
 * around their portrait.
 *
 * We hit the PNG endpoint (not SVG) because React Native's `<Image>`
 * doesn't render SVG natively. Output is cached aggressively because
 * the URL is deterministic.
 */

export const DICEBEAR_STYLE = 'lorelei' as const

// Hex colour list (NO leading '#'), comma-separated for DiceBear's API
const BACKGROUND_PALETTE = [
  '00d9ff',
  'ffd700',
  'ff6b9d',
  '7b61ff',
  '3ddc97',
  'ff9f1c',
  'e63946',
  '06d6a0',
  'f4a261',
  'a8dadc'
].join(',')

export const dicebearUrl = (seed: string, sizePx: number): string => {
  // Request 2x the pixel size for retina sharpness
  const renderSize = Math.round(sizePx * 2)
  return (
    `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/png` +
    `?seed=${encodeURIComponent(seed)}` +
    `&size=${renderSize}` +
    `&backgroundColor=${BACKGROUND_PALETTE}`
  )
}
