export default {
  name: 'customdaisy',
  version: '0.2.0',
  repo: 'jpdevdotcom/daisy-custom',
  ref: 'main',
  // Registry root in THIS repo. Each item's `dir` is relative to it.
  dir: 'src/registry',
  // Where components land in a consumer's project.
  defaultPath: './src/components/ui',

  items: {
    icon: { dir: 'daisy-table', files: ['Icon.vue'], hidden: true },
    pagination: {
      dir: 'daisy-table',
      description: 'Page controls and rows-per-page select.',
      files: ['Pagination.vue'],
    },
    table: {
      dir: 'daisy-table',
      description: 'Paginated, selectable, drag-reorderable table with slot-driven columns.',
      files: ['Table.vue', 'types.ts'],
      examples: ['DaisyTable.vue', 'data.ts'],
      // Used as CSS classes only, so no import exists to detect. Declare by hand.
      devDependencies: { daisyui: '^5.7.22', tailwindcss: '^4.3.3' },
    },
    'status-badge': {
      dir: 'daisy-table',
      description: 'Badge with a per-status icon. Example of a cell-slot component.',
      files: ['StatusBadge.vue'],
    },
    'row-actions': {
      dir: 'daisy-table',
      description: 'Row overflow menu. Emits edit, duplicate, favorite, delete.',
      files: ['RowActions.vue'],
    },
  },
}
