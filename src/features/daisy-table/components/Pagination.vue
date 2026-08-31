<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const isFirst = computed(() => props.page <= 1)
const isLast = computed(() => props.page >= pageCount.value)

function goTo(page: number) {
  emit('update:page', Math.min(Math.max(page, 1), pageCount.value))
}

function onPageSize(event: Event) {
  emit('update:pageSize', Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
    <p class="text-sm text-base-content/60">{{ selectedCount }} of {{ total }} row(s) selected.</p>

    <div class="flex flex-wrap items-center gap-6">
      <label class="flex items-center gap-2 text-sm font-medium">
        Rows per page
        <select
          class="select select-sm w-20 border-base-content/15 rounded-lg"
          :value="pageSize"
          @change="onPageSize"
        >
          <option v-for="size in [10, 20, 30, 40, 50]" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </label>

      <span class="text-sm font-medium">Page {{ page }} of {{ pageCount }}</span>

      <div class="flex items-center gap-2">
        <button
          class="btn btn-sm btn-square rounded-lg btn-outline border-base-content/15"
          :disabled="isFirst"
          aria-label="Go to first page"
          @click="goTo(1)"
        >
          <Icon name="first" />
        </button>
        <button
          class="btn btn-sm btn-square rounded-lg btn-outline border-base-content/15"
          :disabled="isFirst"
          aria-label="Go to previous page"
          @click="goTo(page - 1)"
        >
          <Icon name="prev" />
        </button>
        <button
          class="btn btn-sm btn-square rounded-lg btn-outline border-base-content/15"
          :disabled="isLast"
          aria-label="Go to next page"
          @click="goTo(page + 1)"
        >
          <Icon name="next" />
        </button>
        <button
          class="btn btn-sm btn-square rounded-lg btn-outline border-base-content/15"
          :disabled="isLast"
          aria-label="Go to last page"
          @click="goTo(pageCount)"
        >
          <Icon name="last" />
        </button>
      </div>
    </div>
  </div>
</template>
