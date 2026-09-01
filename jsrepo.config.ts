import { defineConfig } from 'jsrepo'
import { DEFAULT_LANGS, vue } from 'jsrepo/langs'
import { repository } from 'jsrepo/outputs'

const dir = './src/features/daisy-table'

export default defineConfig({
  languages: [...DEFAULT_LANGS, vue()],

  registry: {
    name: '@jpdevdotcom/daisy-table',
    version: '0.1.0',
    description: 'A daisyUI + Tailwind data table for Vue, with slot-driven columns.',
    repository: 'https://github.com/jpdevdotcom/daisy-custom',
    access: 'public',
    outputs: [repository()],
    defaultPaths: { ui: './src/components/ui' },

    items: [
      {
        name: 'icon',
        type: 'ui',
        add: 'when-needed',
        files: [{ path: `${dir}/Icon.vue` }],
      },
      {
        name: 'pagination',
        title: 'Pagination',
        type: 'ui',
        description: 'Page controls and rows-per-page select.',
        files: [{ path: `${dir}/Pagination.vue` }],
      },
      {
        name: 'table',
        title: 'Table',
        type: 'ui',
        description:
          'Paginated, selectable, drag-reorderable table. Columns come from a `columns` prop and render through per-column `cell-<key>` slots.',
        files: [
          { path: `${dir}/Table.vue` },
          { path: `${dir}/types.ts` },
          { path: `${dir}/DaisyTable.vue`, role: 'example' },
          { path: `${dir}/data.ts`, role: 'example' },
        ],
        devDependencies: ['daisyui', 'tailwindcss'],
      },
      {
        name: 'status-badge',
        title: 'Status Badge',
        type: 'ui',
        description: 'Badge with a per-status icon. Example of a cell-slot component.',
        files: [{ path: `${dir}/StatusBadge.vue` }],
      },
      {
        name: 'row-actions',
        title: 'Row Actions',
        type: 'ui',
        description: 'Row overflow menu. Emits edit, duplicate, favorite, delete.',
        files: [{ path: `${dir}/RowActions.vue` }],
      },
    ],
  },
})
