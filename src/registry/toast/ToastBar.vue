<script setup lang="ts">
import { computed, h, type VNode } from 'vue'
import RenderValue from './RenderValue'
import ToastIcon from './ToastIcon.vue'
import { resolveValue, type Toast, type ToastPosition } from './types'

const props = defineProps<{
  toast: Toast
  position?: ToastPosition
}>()
// A `style` passed to <ToastBar> falls through to the root and merges here.

defineSlots<{
  /** Rearrange the bar's parts: `<component :is="icon" /> <component :is="message" />`. */
  default?: (p: { icon: VNode; message: VNode }) => unknown
}>()

const side = computed(() =>
  (props.toast.position || props.position || 'top-center').includes('top') ? 'top' : 'bottom',
)

// Until the Toaster has measured the toast it stays invisible, so the enter
// animation starts from its real stacked position.
const animation = computed(() =>
  !props.toast.height
    ? 'rht-unmeasured'
    : `rht-${props.toast.visible ? 'enter' : 'exit'}-${side.value}`,
)

const icon = () => h(ToastIcon, { toast: props.toast })
const message = () =>
  h('div', { class: 'rht-message', ...props.toast.ariaProps }, [
    h(RenderValue, { value: resolveValue(props.toast.message, props.toast) }),
  ])
</script>

<template>
  <div class="rht-bar" :class="[animation, toast.className]" :style="toast.style">
    <slot :icon="icon()" :message="message()">
      <component :is="icon" />
      <component :is="message" />
    </slot>
  </div>
</template>

<style scoped>
.rht-bar {
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.1),
    0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
}

:deep(.rht-message) {
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
}

.rht-unmeasured {
  opacity: 0;
}
.rht-enter-top {
  animation: rht-enter-top 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
}
.rht-enter-bottom {
  animation: rht-enter-bottom 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
}
.rht-exit-top {
  animation: rht-exit-top 0.4s forwards cubic-bezier(0.06, 0.71, 0.55, 1);
}
.rht-exit-bottom {
  animation: rht-exit-bottom 0.4s forwards cubic-bezier(0.06, 0.71, 0.55, 1);
}

@media (prefers-reduced-motion: reduce) {
  .rht-enter-top,
  .rht-enter-bottom {
    animation-name: rht-fade-in;
  }
  .rht-exit-top,
  .rht-exit-bottom {
    animation-name: rht-fade-out;
  }
}

@keyframes rht-enter-top {
  0% {
    transform: translate3d(0, -200%, 0) scale(0.6);
    opacity: 0.5;
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
}
@keyframes rht-enter-bottom {
  0% {
    transform: translate3d(0, 200%, 0) scale(0.6);
    opacity: 0.5;
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
}
@keyframes rht-exit-top {
  0% {
    transform: translate3d(0, 0, -1px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, -150%, -1px) scale(0.6);
    opacity: 0;
  }
}
@keyframes rht-exit-bottom {
  0% {
    transform: translate3d(0, 0, -1px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, 150%, -1px) scale(0.6);
    opacity: 0;
  }
}
@keyframes rht-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes rht-fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
