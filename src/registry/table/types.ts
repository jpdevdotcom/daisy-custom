export type RowId = string | number

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  class?: string
}
