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
    // Shared building block; pulled in by whatever imports it.
    icon: { dir: 'icon', files: ['Icon.vue'], hidden: true },

    table: {
      dir: 'table',
      description: 'Paginated, selectable, drag-reorderable table with slot-driven columns.',
      files: ['Table.vue', 'types.ts'],
      examples: ['DaisyTable.vue', 'data.ts'],
      // Used as CSS classes only, so no import exists to detect. Declare by hand.
      devDependencies: { daisyui: '^5.7.22', tailwindcss: '^4.3.3' },
    },
    pagination: {
      dir: 'table',
      description: 'Page controls and rows-per-page select.',
      files: ['Pagination.vue'],
    },
    'status-badge': {
      dir: 'table',
      description: 'Badge with a per-status icon. Example of a cell-slot component.',
      files: ['StatusBadge.vue'],
    },
    'row-actions': {
      dir: 'table',
      description: 'Row overflow menu. Emits edit, duplicate, favorite, delete.',
      files: ['RowActions.vue'],
    },

  },
}
