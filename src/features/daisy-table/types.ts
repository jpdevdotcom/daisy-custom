export type SectionType =
  | 'Cover page'
  | 'Table of contents'
  | 'Narrative'
  | 'Technical content'
  | 'Capabilities'
  | 'Focus Documents'
  | 'Legal'
  | 'Financial'

export type SectionStatus = 'Done' | 'In Process' | 'Not Started'

export interface TableRow {
  id: number
  header: string
  type: SectionType
  status: SectionStatus
  target: number
  limit: number
  reviewer: string
}

export const REVIEWERS = ['Eddie Lake', 'Jamik Tashpulatov', 'Emily Whalen'] as const
