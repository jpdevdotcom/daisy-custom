import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { toast, Toaster, TOAST_LIMIT } from '../registry/toast'
import { toastState } from '../registry/toast/store'

let w: VueWrapper | undefined
const mountToaster = (props = {}) => (w = mount(Toaster, { props, attachTo: document.body }))
const ids = () => toastState.toasts.map((t) => t.id)
const visible = () => toastState.toasts.filter((t) => t.visible).map((t) => t.id)

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  w?.unmount()
  w = undefined
  toast.remove()
  vi.useRealTimers()
})

describe('toast store', () => {
  it('prepends toasts and caps the list', () => {
    const first = toast('a')
    const second = toast.success('b')
    expect(ids()).toEqual([second, first])
    for (let i = 0; i < TOAST_LIMIT + 5; i++) toast(`n${i}`)
    expect(toastState.toasts).toHaveLength(TOAST_LIMIT)
  })

  it('upserts by id, which is how loading -> success works', () => {
    const id = toast.loading('Saving...')
    toast.success('Saved', { id })
    expect(toastState.toasts).toHaveLength(1)
    expect(toastState.toasts[0]).toMatchObject({ id, type: 'success', message: 'Saved' })
  })

  it('resolves toast.promise into success or error', async () => {
    const ok = toast.promise(Promise.resolve(42), { loading: 'L', success: (v) => `got ${v}` })
    await ok
    await nextTick()
    expect(toastState.toasts[0]).toMatchObject({ type: 'success', message: 'got 42' })

    const bad = toast.promise(Promise.reject(new Error('x')), {
      loading: 'L',
      error: (e) => e.message,
    })
    await bad.catch(() => {})
    await nextTick()
    expect(toastState.toasts[0]).toMatchObject({ type: 'error', message: 'x' })
  })
})

describe('Toaster', () => {
  it('renders the message with status aria props', async () => {
    mountToaster()
    toast('Hello toast')
    await nextTick()
    const msg = w!.find('[role="status"]')
    expect(msg.text()).toBe('Hello toast')
    expect(msg.attributes('aria-live')).toBe('polite')
  })

  it('auto-dismisses per type, then removes after the exit delay', async () => {
    mountToaster()
    const s = toast.success('ok') // 2000ms
    const e = toast.error('bad') // 4000ms
    const l = toast.loading('wait') // never
    await nextTick()

    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(visible()).toEqual([l, e])
    expect(ids()).toContain(s) // still animating out

    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(ids()).not.toContain(s)

    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(visible()).toEqual([l])
  })

  it('pauses every timer while hovered and credits the paused time back', async () => {
    mountToaster()
    const id = toast('hover me') // 4000ms
    await nextTick()

    vi.advanceTimersByTime(3000)
    await w!.trigger('mouseenter')
    vi.advanceTimersByTime(10_000)
    await nextTick()
    expect(visible()).toEqual([id])

    await w!.trigger('mouseleave')
    vi.advanceTimersByTime(999)
    await nextTick()
    expect(visible()).toEqual([id])
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(visible()).toEqual([])
  })

  it('applies toastOptions per type', async () => {
    mountToaster({ toastOptions: { duration: 1000, success: { duration: 500 } } })
    toast('a')
    toast.success('b')
    await nextTick()
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(toastState.toasts.find((t) => t.type === 'success')?.visible).toBe(false)
    expect(toastState.toasts.find((t) => t.type === 'blank')?.visible).toBe(true)
  })

  it('renders custom toasts without the default bar', async () => {
    mountToaster()
    toast.custom(() => h('div', { class: 'mine' }, 'custom!'))
    await nextTick()
    expect(w!.find('.mine').text()).toBe('custom!')
    expect(w!.find('.rht-bar').exists()).toBe(false)
  })
})
