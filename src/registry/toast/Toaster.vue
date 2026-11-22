<script setup lang="ts">
import { onBeforeUnmount, type CSSProperties } from 'vue'
import RenderValue from './RenderValue'
import ToastBar from './ToastBar.vue'
import { resolveValue, type DefaultToastOptions, type Toast, type ToastPosition } from './types'
import { useToaster } from './useToaster'

const props = withDefaults(
  defineProps<{
    position?: ToastPosition
    reverseOrder?: boolean
    /** px between stacked toasts */
    gutter?: number
    toastOptions?: DefaultToastOptions
    containerStyle?: CSSProperties
    containerClass?: string
  }>(),
  { position: 'top-center', reverseOrder: false, gutter: 8 },
)

defineSlots<{
  /** Replace ToastBar for every non-custom toast. */
  default?: (p: { toast: Toast }) => unknown
}>()

const { toasts, handlers } = useToaster(() => props.toastOptions)

// --- height measurement -----------------------------------------------------
const observed = new Map<string, { el: Element; ro?: ResizeObserver }>()

function measure(id: string, el: Element) {
  handlers.updateHeight(id, el.getBoundingClientRect().height)
}

function track(id: string, el: unknown) {
  const prev = observed.get(id)
  if (prev?.el === el) return
  prev?.ro?.disconnect()
  observed.delete(id)
  if (!(el instanceof Element)) return

  measure(id, el)
  const ro =
    typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => measure(id, el))
  ro?.observe(el)
  observed.set(id, { el, ro })
}

onBeforeUnmount(() => observed.forEach(({ ro }) => ro?.disconnect()))

// --- layout -----------------------------------------------------------------
const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function wrapperStyle(t: Toast): CSSProperties {
  const position = t.position || props.position
  const top = position.includes('top')
  const offset = handlers.calculateOffset(t, {
    reverseOrder: props.reverseOrder,
    gutter: props.gutter,
    defaultPosition: props.position,
  })
  return {
    left: 0,
    right: 0,
    display: 'flex',
    position: 'absolute',
    transition: reducedMotion ? undefined : 'all 230ms cubic-bezier(.21,1.02,.73,1)',
    transform: `translateY(${offset * (top ? 1 : -1)}px)`,
    ...(top ? { top: 0 } : { bottom: 0 }),
    ...(position.includes('center')
      ? { justifyContent: 'center' }
      : position.includes('right')
        ? { justifyContent: 'flex-end' }
        : {}),
  }
}
</script>

<template>
  <div
    :class="containerClass"
    :style="{
      position: 'fixed',
      zIndex: 9999,
      top: '16px',
      left: '16px',
      right: '16px',
      bottom: '16px',
      pointerEvents: 'none',
      ...containerStyle,
    }"
    @mouseenter="handlers.startPause"
    @mouseleave="handlers.endPause"
  >
    <div
      v-for="t in toasts"
      :key="t.id"
      :ref="(el) => track(t.id, el)"
      :class="{ 'rht-active': t.visible }"
      :style="wrapperStyle(t)"
    >
      <RenderValue v-if="t.type === 'custom'" :value="resolveValue(t.message, t)" />
      <slot v-else :toast="t">
        <ToastBar :toast="t" :position="t.position || position" />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.rht-active {
  z-index: 9999;
}
.rht-active > :deep(*) {
  pointer-events: auto;
}
</style>
