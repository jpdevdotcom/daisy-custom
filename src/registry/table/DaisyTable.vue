<script setup lang="ts">
import { ref } from 'vue'
import RowActions from './RowActions.vue'
import StatusBadge from './StatusBadge.vue'
import Table from './Table.vue'
import { REVIEWERS, tableData, type TableRow } from './data'
import type { TableColumn } from './types'

const rows = ref<TableRow[]>(tableData.map((row) => ({ ...row })))

const columns: TableColumn[] = [
  { key: 'header', label: 'Header' },
  { key: 'type', label: 'Section Type' },
  { key: 'status', label: 'Status' },
  { key: 'target', label: 'Target', align: 'right', class: 'tabular-nums' },
  { key: 'limit', label: 'Limit', align: 'right', class: 'tabular-nums' },
  { key: 'reviewer', label: 'Reviewer' },
]

function assignReviewer(row: TableRow, name: string) {
  row.reviewer = name
  // daisyUI dropdowns are focus-driven, so blurring is what closes the menu.
  ;(document.activeElement as HTMLElement | null)?.blur()
}

function deleteRow(row: TableRow) {
  rows.value = rows.value.filter((r) => r.id !== row.id)
}

function duplicateRow(row: TableRow) {
  const index = rows.value.findIndex((r) => r.id === row.id)
  const copy = { ...row, id: Math.max(...rows.value.map((r) => r.id)) + 1 }
  rows.value = [...rows.value.slice(0, index + 1), copy, ...rows.value.slice(index + 1)]
}
</script>

<template>
  <Table :data="rows" :columns="columns" :row-label="(row) => row.header">
    <template #cell-header="{ value }">
      <button class="link link-hover whitespace-nowrap text-left font-medium">{{ value }}</button>
    </template>

    <template #cell-type="{ value }">
      <span
        class="badge badge-outline whitespace-nowrap rounded-full border-base-content/15 px-1.5 text-base-content/80 text-xs"
      >
        {{ value }}
      </span>
    </template>

    <template #cell-status="{ value }">
      <StatusBadge :status="value" />
    </template>

    <template #cell-reviewer="{ row }">
      <template v-if="row.reviewer">{{ row.reviewer }}</template>

      <div v-else class="dropdown dropdown-start">
        <div
          tabindex="0"
          role="button"
          class="btn btn-sm btn-outline rounded-lg border-base-content/15 text-base-content/80"
          :aria-label="`Assign reviewer for ${row.header}`"
        >
          Assign reviewer
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li v-for="name in REVIEWERS" :key="name">
            <a @click="assignReviewer(row, name)">{{ name }}</a>
          </li>
        </ul>
      </div>
    </template>

    <template #actions="{ row }">
      <RowActions @duplicate="duplicateRow(row)" @delete="deleteRow(row)" />
    </template>
  </Table>
</template>
