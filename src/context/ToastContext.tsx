import { Ionicons } from '@expo/vector-icons'
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Animated, Pressable, StyleSheet, Text } from 'react-native'

import { colors } from '../utils/colorScheme'

export type ToastKind = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  kind: ToastKind
}

type ToastContextValue = {
  show: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const DURATION_MS = 2500

/**
 * Non-blocking feedback for non-destructive actions ("Posted", "Saved",
 * "Reported", "Could not save"). For confirm-or-cancel destructive
 * actions (block, delete), keep using Alert.alert — the user should
 * have to make a decision, not just glance at a toast.
 */
export const ToastProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [toast, setToast] = useState<Toast | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = useRef(0)

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    idRef.current += 1
    setToast({ id: idRef.current, message, kind })
    timerRef.current = setTimeout(() => setToast(null), DURATION_MS)
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  const value = useMemo<ToastContextValue>(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} onDismiss={() => setToast(null)} /> : null}
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider')
  return ctx
}

// ─── Toast view ───────────────────────────────────────────────────────

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const iconForKind: Record<ToastKind, IoniconsName> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle'
}

const colorForKind: Record<ToastKind, string> = {
  success: colors.primary,
  error: colors.accent,
  info: colors.textSecondary
}

const ToastView = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }): ReactElement => {
  const [translateY] = useState(() => new Animated.Value(80))
  const [opacity] = useState(() => new Animated.Value(0))

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true })
    ]).start()
  }, [opacity, translateY])

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}
    >
      <Pressable onPress={onDismiss} style={styles.pill}>
        <Ionicons name={iconForKind[toast.kind]} size={20} color={colorForKind[toast.kind]} />
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Stay clear of the bottom tab bar on mobile + give breathing room on desktop
    bottom: 88,
    alignItems: 'center',
    paddingHorizontal: 24
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 480,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  message: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  }
})
