export default {
  name: 'customdaisy',
  version: '0.1.0',
  repo: 'jpdevdotcom/daisy-custom',
  ref: 'main',
  // Where components live in THIS repo.
  dir: 'src/features/daisy-table',
  // Where they land in a consumer's project.
  defaultPath: './src/components/ui',

  items: {
    icon: { files: ['Icon.vue'], hidden: true },
    pagination: {
      description: 'Page controls and rows-per-page select.',
      files: ['Pagination.vue'],
    },
    table: {
      description: 'Paginated, selectable, drag-reorderable table with slot-driven columns.',
      files: ['Table.vue', 'types.ts'],
      examples: ['DaisyTable.vue', 'data.ts'],
      // Used as CSS classes only, so no import exists to detect. Declare by hand.
      devDependencies: { daisyui: '^5.7.22', tailwindcss: '^4.3.3' },
    },
    'status-badge': {
      description: 'Badge with a per-status icon. Example of a cell-slot component.',
      files: ['StatusBadge.vue'],
    },
    'row-actions': {
      description: 'Row overflow menu. Emits edit, duplicate, favorite, delete.',
      files: ['RowActions.vue'],
    },
  },
}
