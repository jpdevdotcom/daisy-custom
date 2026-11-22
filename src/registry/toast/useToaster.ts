import { computed, onScopeDispose, toValue, watch, watchEffect, type MaybeRefOrGetter } from 'vue'
import {
  DEFAULT_DURATIONS,
  DEFAULT_REMOVE_DELAY,
  endPause,
  startPause,
  toast,
  toastState,
  updateHeight,
} from './store'
import type { DefaultToastOptions, Toast, ToastPosition, ToastType } from './types'

const TYPES: ToastType[] = ['blank', 'success', 'error', 'loading', 'custom']

// setTimeout overflows past 2^31-1 ms and fires immediately.
const MAX_TIMEOUT = 2_147_483_647

export interface OffsetOptions {
  reverseOrder?: boolean
  gutter?: number
  defaultPosition?: ToastPosition
}

/**
 * Headless toaster state. `<Toaster>` is built on this; use it directly to
 * render toasts with your own markup.
 */
export function useToaster(toastOptions: MaybeRefOrGetter<DefaultToastOptions | undefined> = {}) {
  const toasts = computed<Toast[]>(() => {
    const opts = toValue(toastOptions) ?? {}
    const base = Object.fromEntries(
      Object.entries(opts).filter(([k]) => !TYPES.includes(k as ToastType)),
    )
    return toastState.toasts.map((t) => {
      const byType = opts[t.type]
      return {
        ...base,
        ...byType,
        ...t,
        removeDelay: t.removeDelay ?? byType?.removeDelay ?? opts.removeDelay,
        duration: t.duration || byType?.duration || opts.duration || DEFAULT_DURATIONS[t.type],
        style: { ...opts.style, ...byType?.style, ...t.style },
      }
    })
  })

  // Auto-dismiss. Re-armed whenever the list or pause state changes; while
  // paused no timers run, and endPause() credits the paused time back.
  watchEffect((onCleanup) => {
    if (toastState.pausedAt !== undefined) return
    const now = Date.now()
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const t of toasts.value) {
      if (!t.visible || t.duration === Infinity) continue
      const left = (t.duration ?? 0) + t.pauseDuration - (now - t.createdAt)
      if (left < 0) {
        toast.dismiss(t.id)
        continue
      }
      timers.push(setTimeout(() => toast.dismiss(t.id), Math.min(left, MAX_TIMEOUT)))
    }
    onCleanup(() => timers.forEach(clearTimeout))
  })

  // Removal after the exit animation. A toast revived by an upsert to its id
  // cancels its pending removal.
  const removals = new Map<string, ReturnType<typeof setTimeout>>()
  watch(
    toasts,
    (list) => {
      for (const t of list) {
        const pending = removals.get(t.id)
        if (t.dismissed && !pending) {
          const timer = setTimeout(() => {
            removals.delete(t.id)
            toast.remove(t.id)
          }, t.removeDelay ?? DEFAULT_REMOVE_DELAY)
          removals.set(t.id, timer)
        } else if (!t.dismissed && pending) {
          clearTimeout(pending)
          removals.delete(t.id)
        }
      }
    },
    { immediate: true },
  )
  onScopeDispose(() => {
    removals.forEach(clearTimeout)
    removals.clear()
  })

  /** Pixel distance of `t` from its position's edge, given the toasts stacked before it. */
  function calculateOffset(
    t: Toast,
    { reverseOrder = false, gutter = 8, defaultPosition }: OffsetOptions = {},
  ) {
    const pos = t.position || defaultPosition
    const relevant = toasts.value.filter((x) => (x.position || defaultPosition) === pos && x.height)
    const index = relevant.findIndex((x) => x.id === t.id)
    const before = relevant.filter((x, i) => i < index && x.visible).length
    return relevant
      .filter((x) => x.visible)
      .slice(...(reverseOrder ? [before + 1] : [0, before]))
      .reduce((acc, x) => acc + (x.height || 0) + gutter, 0)
  }

  return {
    toasts,
    pausedAt: computed(() => toastState.pausedAt),
    handlers: {
      startPause: () => startPause(),
      endPause: () => endPause(),
      updateHeight,
      calculateOffset,
    },
  }
}
