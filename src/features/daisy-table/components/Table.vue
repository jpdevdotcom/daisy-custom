<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Icon from './Icon.vue'
import Pagination from './Pagination.vue'
import RowActions from './RowActions.vue'
import StatusBadge from './StatusBadge.vue'
import { tableData } from '../data'
import { REVIEWERS, type TableRow } from '../types'

const rows = ref<TableRow[]>([...tableData])
const selected = ref<Set<number>>(new Set())
const page = ref(1)
const pageSize = ref(10)

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

function toggleRow(id: number) {
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

const armedId = ref<number | null>(null)
const draggingId = ref<number | null>(null)

function onDragStart(id: number, event: DragEvent) {
  if (armedId.value !== id) return event.preventDefault()
  draggingId.value = id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(id))
  }
}

function onDragEnter(targetId: number) {
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
  armedId.value = null
  draggingId.value = null
}

// A pointerup that lands outside the handle still has to disarm the row,
// otherwise it stays draggable from anywhere until the next drag.
function disarm() {
  if (draggingId.value === null) armedId.value = null
}
onMounted(() => window.addEventListener('pointerup', disarm))
onBeforeUnmount(() => window.removeEventListener('pointerup', disarm))

function assignReviewer(row: TableRow, event: Event) {
  row.reviewer = (event.target as HTMLSelectElement).value
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="overflow-x-auto rounded-lg border border-base-content/10">
      <table class="table">
        <thead class="bg-base-200 text-base-content/70">
          <tr class="border-base-content/10">
            <th class="w-8"></th>
            <th class="w-10">
              <input
                type="checkbox"
                class="checkbox checkbox-sm rounded-sm border-base-content/25"
                aria-label="Select all rows on this page"
                :checked="allOnPageSelected"
                :indeterminate="someOnPageSelected"
                @change="togglePage"
              />
            </th>
            <th class="font-medium">Header</th>
            <th class="font-medium">Section Type</th>
            <th class="font-medium">Status</th>
            <th class="text-right font-medium">Target</th>
            <th class="text-right font-medium">Limit</th>
            <th class="font-medium">Reviewer</th>
            <th class="w-12"></th>
          </tr>
        </thead>

        <TransitionGroup tag="tbody" name="row">
          <tr
            v-for="row in pageRows"
            :key="row.id"
            :draggable="armedId === row.id"
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
            <td>
              <button
                class="btn btn-ghost btn-xs btn-square cursor-grab text-base-content/40 active:cursor-grabbing"
                :aria-label="`Reorder ${row.header}`"
                @pointerdown="armedId = row.id"
              >
                <Icon name="grip" />
              </button>
            </td>

            <td>
              <input
                type="checkbox"
                class="checkbox checkbox-sm rounded-sm"
                :aria-label="`Select ${row.header}`"
                :checked="selected.has(row.id)"
                @change="toggleRow(row.id)"
              />
            </td>

            <td class="font-medium">
              <button class="link link-hover whitespace-nowrap text-left">{{ row.header }}</button>
            </td>

            <td>
              <span
                class="badge badge-outline whitespace-nowrap rounded-full border-base-content/15 px-1.5 text-base-content/80 text-xs"
              >
                {{ row.type }}
              </span>
            </td>

            <td><StatusBadge :status="row.status" /></td>

            <td class="text-right tabular-nums">{{ row.target }}</td>
            <td class="text-right tabular-nums">{{ row.limit }}</td>

            <td>
              <template v-if="row.reviewer">{{ row.reviewer }}</template>

              <div v-else class="dropdown dropdown-start">
                <div
                  tabindex="0"
                  role="button"
                  class="btn btn-sm btn-outline rounded-lg border-base-content/15 text-base-content/80 m-1"
                  :aria-label="`Assign reviewer for ${row.header}`"
                  @change="assignReviewer(row, $event)"
                >
                  Assign reviewer
                </div>
                <ul
                  tabindex="-1"
                  class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                >
                  <li v-for="name in REVIEWERS" :key="name" :value="name">
                    <a>{{ name }}</a>
                  </li>
                </ul>
              </div>
            </td>

            <td><RowActions /></td>
          </tr>
        </TransitionGroup>
      </table>
    </div>

    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="rows.length"
      :selected-count="selected.size"
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
  background-color: #ffffff;
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
