// Global toast store: a Vue port of react-hot-toast's reducer.
// Toasts are replaced immutably inside a shallowRef so a component or VNode
// passed as a message is never wrapped in a reactive proxy.
import { shallowRef } from 'vue'
import {
  resolveValue,
  type Renderable,
  type Toast,
  type ToastOptions,
  type ToastType,
  type ValueOrFunction,
} from './types'

export const TOAST_LIMIT = 20
export const DEFAULT_REMOVE_DELAY = 1000
export const DEFAULT_DURATIONS: Record<ToastType, number> = {
  blank: 4000,
  error: 4000,
  success: 2000,
  loading: Infinity,
  custom: 4000,
}

const toasts = shallowRef<Toast[]>([])
const pausedAt = shallowRef<number | undefined>()

/** Read-only, reactive view of the store. */
export const toastState = {
  get toasts(): readonly Toast[] {
    return toasts.value
  },
  get pausedAt() {
    return pausedAt.value
  },
}

let count = 0
const genId = () => (++count).toString()

function upsert(next: Toast) {
  const list = toasts.value
  toasts.value = list.some((t) => t.id === next.id)
    ? list.map((t) => (t.id === next.id ? { ...t, ...next } : t))
    : [next, ...list].slice(0, TOAST_LIMIT)
}

function patch(fn: (t: Toast) => Partial<Toast> | null, id?: string) {
  toasts.value = toasts.value.map((t) => {
    if (id !== undefined && t.id !== id) return t
    const p = fn(t)
    return p ? { ...t, ...p } : t
  })
}

export function updateHeight(id: string, height: number) {
  patch((t) => (t.height === height ? null : { height }), id)
}

export function startPause(at = Date.now()) {
  pausedAt.value = at
}

export function endPause(at = Date.now()) {
  if (pausedAt.value === undefined) return
  const diff = at - pausedAt.value
  pausedAt.value = undefined
  patch((t) => ({ pauseDuration: t.pauseDuration + diff }))
}

type Message = ValueOrFunction<Renderable, Toast>

const createToast = (message: Message, type: ToastType, opts?: ToastOptions): Toast => ({
  createdAt: Date.now(),
  visible: true,
  dismissed: false,
  type,
  ariaProps: { role: 'status', 'aria-live': 'polite' },
  message,
  pauseDuration: 0,
  ...opts,
  id: opts?.id || genId(),
})

const createHandler =
  (type: ToastType) =>
  (message: Message, opts?: ToastOptions): string => {
    const t = createToast(message, type, opts)
    upsert(t)
    return t.id
  }

export interface PromiseMessages<T> {
  loading: Renderable
  success?: ValueOrFunction<Renderable, T>
  error?: ValueOrFunction<Renderable, any>
}

export type PromiseOptions = ToastOptions & {
  loading?: ToastOptions
  success?: ToastOptions
  error?: ToastOptions
}

const blank = createHandler('blank')

export const toast = Object.assign(
  (message: Message, opts?: ToastOptions) => blank(message, opts),
  {
    success: createHandler('success'),
    error: createHandler('error'),
    loading: createHandler('loading'),
    /** Rendered without the default bar: you own the whole look. */
    custom: createHandler('custom'),

    /** Starts the exit animation. No id = every toast. */
    dismiss(id?: string) {
      patch((t) => (t.dismissed ? null : { visible: false, dismissed: true }), id)
    },
    dismissAll() {
      toast.dismiss()
    },
    /** Removes immediately, skipping the exit animation. No id = every toast. */
    remove(id?: string) {
      toasts.value = id === undefined ? [] : toasts.value.filter((t) => t.id !== id)
    },
    removeAll() {
      toast.remove()
    },

    promise<T>(
      promise: Promise<T> | (() => Promise<T>),
      msgs: PromiseMessages<T>,
      opts?: PromiseOptions,
    ): Promise<T> {
      const id = toast.loading(msgs.loading, { ...opts, ...opts?.loading })
      const p = typeof promise === 'function' ? promise() : promise

      p.then(
        (value) => {
          const m = msgs.success ? resolveValue(msgs.success, value) : undefined
          if (m) toast.success(m, { id, ...opts, ...opts?.success })
          else toast.dismiss(id)
        },
        (err) => {
          const m = msgs.error ? resolveValue(msgs.error, err) : undefined
          if (m) toast.error(m, { id, ...opts, ...opts?.error })
          else toast.dismiss(id)
        },
      )
      return p
    },
  },
)
