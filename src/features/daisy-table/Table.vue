<script setup lang="ts" generic="T extends { id: RowId }">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch, type Ref } from 'vue'
import Icon from './Icon.vue'
import Pagination from './Pagination.vue'
import type { RowId, TableColumn } from './types'

const props = withDefaults(
  defineProps<{
    data: T[]
    columns: TableColumn[]
    selectable?: boolean
    reorderable?: boolean
    pageSize?: number
    pageSizeOptions?: number[]
    /** Selected row ids. Supports `v-model:selected`. */
    selected?: RowId[]
    rowLabel?: (row: T) => string
  }>(),
  {
    selectable: true,
    reorderable: true,
    pageSize: 10,
    selected: undefined,
    pageSizeOptions: () => [10, 20, 30, 40, 50],
    rowLabel: (row: { id: RowId }) => `row ${row.id}`,
  },
)

const emit = defineEmits<{
  (e: 'update:selected', ids: RowId[]): void
  (e: 'update:pageSize', value: number): void
  (e: 'reorder', rows: T[]): void
}>()

defineSlots<
  {
    actions?: (props: { row: T }) => unknown
    empty?: () => unknown
  } & { [K in `cell-${string}`]?: (props: { row: T; value: any; index: number }) => unknown } & {
    [K in `header-${string}`]?: (props: { column: TableColumn }) => unknown
  }
>()

const slots = useSlots()

const alignClass: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

function cellValue(row: T, key: string): any {
  return (row as unknown as Record<string, unknown>)[key]
}

const columnCount = computed(
  () =>
    props.columns.length +
    (props.reorderable ? 1 : 0) +
    (props.selectable ? 1 : 0) +
    (slots.actions ? 1 : 0),
)

const rows = ref<T[]>([]) as Ref<T[]>
const selected = ref<Set<RowId>>(new Set(props.selected))
const page = ref(1)
const pageSize = ref(props.pageSize)

function sameIds(ids: readonly RowId[], set: Set<RowId>) {
  return ids.length === set.size && ids.every((id) => set.has(id))
}

// Both of these are two-way bindable. The inbound watches bail when the value
// already matches, so a v-model round trip settles instead of looping.
watch(
  () => props.selected,
  (ids) => {
    if (ids && !sameIds(ids, selected.value)) selected.value = new Set(ids)
  },
)
watch(selected, (value) => emit('update:selected', [...value]))

watch(
  () => props.pageSize,
  (value) => {
    if (value !== pageSize.value) pageSize.value = value
  },
)
watch(pageSize, (value) => emit('update:pageSize', value))

watch(
  () => props.data,
  (data) => {
    rows.value = [...data]
    const ids = new Set(data.map((row) => row.id))
    selected.value = new Set([...selected.value].filter((id) => ids.has(id)))
  },
  { immediate: true },
)

const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize.value)))
const pageRows = computed(() =>
  rows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value),
)

watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

const allOnPageSelected = computed(
  () => pageRows.value.length > 0 && pageRows.value.every((row) => selected.value.has(row.id)),
)
const someOnPageSelected = computed(
  () => !allOnPageSelected.value && pageRows.value.some((row) => selected.value.has(row.id)),
)

function toggleRow(id: RowId) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function togglePage() {
  const next = new Set(selected.value)
  if (allOnPageSelected.value) pageRows.value.forEach((row) => next.delete(row.id))
  else pageRows.value.forEach((row) => next.add(row.id))
  selected.value = next
}

const armedId = ref<RowId | null>(null)
const draggingId = ref<RowId | null>(null)

function onDragStart(id: RowId, event: DragEvent) {
  if (armedId.value !== id) return event.preventDefault()
  draggingId.value = id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(id))
  }
}

function onDragEnter(targetId: RowId) {
  if (draggingId.value === null || draggingId.value === targetId) return

  const from = rows.value.findIndex((row) => row.id === draggingId.value)
  const to = rows.value.findIndex((row) => row.id === targetId)
  if (from === -1 || to === -1) return

  const next = [...rows.value]
  const moved = next.splice(from, 1)
  next.splice(to, 0, ...moved)
  rows.value = next
}

function onDragEnd() {
  if (draggingId.value !== null) emit('reorder', [...rows.value])
  armedId.value = null
  draggingId.value = null
}

function disarm() {
  if (draggingId.value === null) armedId.value = null
}
onMounted(() => window.addEventListener('pointerup', disarm))
onBeforeUnmount(() => window.removeEventListener('pointerup', disarm))
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table">
        <thead class="bg-base-200 text-base-content/70">
          <tr class="border-base-content/10">
            <th v-if="reorderable" class="w-8"></th>

            <th v-if="selectable" class="w-10">
              <input
                type="checkbox"
                class="checkbox checkbox-sm rounded-sm border-base-content/25"
                aria-label="Select all rows on this page"
                :checked="allOnPageSelected"
                :indeterminate="someOnPageSelected"
                @change="togglePage"
              />
            </th>

            <th
              v-for="col in columns"
              :key="col.key"
              class="font-medium"
              :class="[alignClass[col.align ?? 'left'], col.class]"
            >
              <slot :name="`header-${col.key}`" :column="col">{{ col.label }}</slot>
            </th>

            <th v-if="$slots.actions" class="w-12"></th>
          </tr>
        </thead>

        <TransitionGroup tag="tbody" name="row">
          <tr v-if="pageRows.length === 0" key="__empty__" class="border-base-content/10">
            <td :colspan="columnCount" class="py-10 text-center text-base-content/50">
              <slot name="empty">No rows to display.</slot>
            </td>
          </tr>

          <tr
            v-for="(row, index) in pageRows"
            :key="row.id"
            :draggable="reorderable && armedId === row.id"
            class="border-base-content/10 hover:bg-base-200/40"
            :class="{
              'bg-base-200': selected.has(row.id),
              'is-dragging': draggingId === row.id,
            }"
            @dragstart="onDragStart(row.id, $event)"
            @dragenter.prevent="onDragEnter(row.id)"
            @dragover.prevent
            @drop.prevent
            @dragend="onDragEnd"
          >
            <td v-if="reorderable">
              <button
                class="btn btn-ghost btn-xs btn-square cursor-grab text-base-content/40 active:cursor-grabbing"
                :aria-label="`Reorder ${rowLabel(row)}`"
                @pointerdown="armedId = row.id"
              >
                <Icon name="grip" />
              </button>
            </td>

            <td v-if="selectable">
              <input
                type="checkbox"
                class="checkbox checkbox-sm rounded-sm"
                :aria-label="`Select ${rowLabel(row)}`"
                :checked="selected.has(row.id)"
                @change="toggleRow(row.id)"
              />
            </td>

            <td
              v-for="col in columns"
              :key="col.key"
              :class="[alignClass[col.align ?? 'left'], col.class]"
            >
              <slot
                :name="`cell-${col.key}`"
                :row="row"
                :value="cellValue(row, col.key)"
                :index="index"
              >
                {{ cellValue(row, col.key) }}
              </slot>
            </td>

            <td v-if="$slots.actions"><slot name="actions" :row="row" /></td>
          </tr>
        </TransitionGroup>
      </table>
    </div>

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="rows.length"
      :selected-count="selected.size"
      :show-selection="selectable"
      :page-size-options="pageSizeOptions"
    />
  </div>
</template>

<style scoped>
/* FLIP transition applied by TransitionGroup as rows swap places. */
.row-move {
  transition: transform 250ms cubic-bezier(0.25, 1, 0.5, 1);
}

.is-dragging {
  opacity: 1;
  background-color: var(--color-base-100, #fff);
}

/* Rows are only ever reordered, never added or removed mid-drag, so the
   enter/leave hooks that paging triggers should not animate. */
.row-enter-active,
.row-leave-active {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .row-move {
    transition: none;
  }
}
</style>
