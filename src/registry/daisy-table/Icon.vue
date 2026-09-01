<script setup lang="ts">
export type IconName = 'grip' | 'loader' | 'check' | 'dots' | 'first' | 'prev' | 'next' | 'last'

defineProps<{ name: IconName }>()
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="size-4 shrink-0"
  >
    <template v-if="name === 'grip'">
      <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" />
    </template>

    <!-- dashed ring: the "in process" spinner -->
    <template v-else-if="name === 'loader'">
      <path d="M12 3a9 9 0 1 0 9 9" stroke-dasharray="2 3" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke-dasharray="2 3" />
    </template>

    <template v-else-if="name === 'check'">
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" stroke="var(--color-base-100, #fff)" />
    </template>

    <template v-else-if="name === 'dots'">
      <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'first'">
      <path d="m11 17-5-5 5-5" />
      <path d="m18 17-5-5 5-5" />
    </template>

    <template v-else-if="name === 'prev'">
      <path d="m15 18-6-6 6-6" />
    </template>

    <template v-else-if="name === 'next'">
      <path d="m9 18 6-6-6-6" />
    </template>

    <template v-else-if="name === 'last'">
      <path d="m13 17 5-5-5-5" />
      <path d="m6 17 5-5-5-5" />
    </template>
  </svg>
</template>
