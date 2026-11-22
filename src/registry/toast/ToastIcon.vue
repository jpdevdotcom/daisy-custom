<script setup lang="ts">
import { computed } from 'vue'
import RenderValue from './RenderValue'
import type { Toast } from './types'

const props = defineProps<{ toast: Toast }>()

// Same defaults as react-hot-toast: `iconTheme` overrides both the spinner
// (primary = arc, secondary = track) and the status circle (primary = fill,
// secondary = glyph).
const theme = computed(() => {
  const { type, iconTheme: it } = props.toast
  return {
    '--rht-loader-primary': it?.primary ?? '#616161',
    '--rht-loader-secondary': it?.secondary ?? '#e0e0e0',
    '--rht-primary': it?.primary ?? (type === 'error' ? '#ff4b4b' : '#61d345'),
    '--rht-secondary': it?.secondary ?? '#fff',
  }
})
</script>

<template>
  <template v-if="toast.icon !== undefined">
    <div v-if="typeof toast.icon === 'string'" class="rht-animated-icon">{{ toast.icon }}</div>
    <RenderValue v-else :value="toast.icon" />
  </template>
  <div v-else-if="toast.type !== 'blank'" class="rht-indicator" :style="theme">
    <!-- The spinner stays underneath so loading -> success/error swaps in place. -->
    <div class="rht-loader" />
    <div v-if="toast.type !== 'loading'" class="rht-status">
      <div v-if="toast.type === 'error'" class="rht-error" />
      <div v-else class="rht-checkmark" />
    </div>
  </div>
</template>

<style scoped>
.rht-indicator {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
}

.rht-status {
  position: absolute;
}

.rht-loader {
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: var(--rht-loader-secondary);
  border-right-color: var(--rht-loader-primary);
  animation: rht-rotate 1s linear infinite;
}

.rht-animated-icon {
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: rht-icon-enter 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.rht-checkmark,
.rht-error {
  width: 20px;
  height: 20px;
  opacity: 0;
  border-radius: 10px;
  background: var(--rht-primary);
  position: relative;
  transform: rotate(45deg);
  animation: rht-circle 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: 100ms;
}

.rht-checkmark::after {
  content: '';
  box-sizing: border-box;
  animation: rht-check 0.2s ease-out forwards;
  opacity: 0;
  animation-delay: 200ms;
  position: absolute;
  border-right: 2px solid;
  border-bottom: 2px solid;
  border-color: var(--rht-secondary);
  bottom: 6px;
  left: 6px;
  height: 10px;
  width: 6px;
}

.rht-error::after,
.rht-error::before {
  content: '';
  animation: rht-line-1 0.15s ease-out forwards;
  animation-delay: 150ms;
  position: absolute;
  border-radius: 3px;
  opacity: 0;
  background: var(--rht-secondary);
  bottom: 9px;
  left: 4px;
  height: 2px;
  width: 12px;
}

.rht-error::before {
  animation: rht-line-2 0.15s ease-out forwards;
  animation-delay: 180ms;
  transform: rotate(90deg);
}

@keyframes rht-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rht-icon-enter {
  from {
    transform: scale(0.6);
    opacity: 0.4;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes rht-circle {
  from {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
}

@keyframes rht-check {
  0% {
    height: 0;
    width: 0;
    opacity: 0;
  }
  40% {
    height: 0;
    width: 6px;
    opacity: 1;
  }
  100% {
    opacity: 1;
    height: 10px;
  }
}

@keyframes rht-line-1 {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes rht-line-2 {
  from {
    transform: scale(0) rotate(90deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(90deg);
    opacity: 1;
  }
}
</style>
