import type { Component, CSSProperties, VNode } from 'vue'

export type ToastType = 'success' | 'error' | 'loading' | 'blank' | 'custom'

export type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

/**
 * Anything a toast can display: text, a VNode (from `h()`), or a component
 * object. Functional components are excluded so `(toast) => ...` callbacks
 * stay unambiguous; wrap one as `() => h(MyFn)`.
 */
export type Renderable =
  string | number | VNode | Exclude<Component, (...args: any[]) => any> | null | undefined

export type ValueOrFunction<T, A> = T | ((arg: A) => T)

export interface IconTheme {
  primary: string
  secondary: string
}

export interface Toast {
  id: string
  type: ToastType
  /** A Renderable, or `(toast) => Renderable` to read the toast's own state. */
  message: ValueOrFunction<Renderable, Toast>
  icon?: Renderable
  /** ms before auto-dismiss. `Infinity` keeps the toast until dismissed. */
  duration?: number
  pauseDuration: number
  position?: ToastPosition
  /** ms between dismiss (exit animation starts) and removal from the store. */
  removeDelay?: number
  ariaProps: {
    role: 'status' | 'alert'
    'aria-live': 'assertive' | 'off' | 'polite'
  }
  style?: CSSProperties
  className?: string
  iconTheme?: IconTheme
  createdAt: number
  visible: boolean
  dismissed: boolean
  height?: number
}

export type ToastOptions = Partial<
  Pick<
    Toast,
    | 'id'
    | 'icon'
    | 'duration'
    | 'ariaProps'
    | 'className'
    | 'style'
    | 'position'
    | 'iconTheme'
    | 'removeDelay'
  >
>

export type DefaultToastOptions = ToastOptions & { [key in ToastType]?: ToastOptions }

export const resolveValue = <T, A>(value: ValueOrFunction<T, A>, arg: A): T =>
  typeof value === 'function' ? (value as (arg: A) => T)(arg) : value
