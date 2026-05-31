import { useMemo } from 'react'
import { useWindowDimensions, ViewStyle } from 'react-native'

/**
 * Responsive layout primitives. See DESIGN.md ("Layout & Responsiveness").
 */

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 600,
  desktop: 1024
} as const

export const CONTENT_MAX_WIDTH = 640

export type Breakpoint = {
  width: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  /** True when on tablet or larger — when the centred-column treatment kicks in */
  isWide: boolean
}

export const useBreakpoint = (): Breakpoint => {
  const { width } = useWindowDimensions()
  return {
    width,
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    isWide: width >= BREAKPOINTS.tablet
  }
}

/**
 * Style object to apply to the OUTER content container of each screen so
 * tablet+ users get a centred 640px column instead of a stretched view.
 *
 * Returns null on mobile (no constraint needed).
 *
 *   const contentStyle = useContentStyle()
 *   <FlatList contentContainerStyle={[styles.list, contentStyle]} ... />
 */
export const useContentStyle = (): ViewStyle | null => {
  const { isWide } = useBreakpoint()
  return useMemo<ViewStyle | null>(
    () =>
      isWide
        ? {
            maxWidth: CONTENT_MAX_WIDTH,
            width: '100%',
            alignSelf: 'center'
          }
        : null,
    [isWide]
  )
}
