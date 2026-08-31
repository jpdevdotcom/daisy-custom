<script setup lang="ts">
import Icon from './Icon.vue'

export type RowStatus = 'Done' | 'In Process' | 'Not Started'

defineProps<{ status: RowStatus }>()
</script>

<template>
  <span
    class="badge rounded-full badge-outline gap-1 whitespace-nowrap border-base-content/15 px-1.5 text-base-content/80 text-xs"
  >
    <Icon v-if="status === 'Done'" name="check" class="size-3.5 text-green-500" />
    <Icon
      v-else
      name="loader"
      class="size-3.5"
      :class="status === 'In Process' ? 'text-base-content/60' : 'text-base-content/30'"
    />
    {{ status }}
  </span>
</template>
