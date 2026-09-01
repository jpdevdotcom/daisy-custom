import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Table from '../features/daisy-table/Table.vue'
import type { TableColumn } from '../features/daisy-table/types'

// VTU stubs TransitionGroup by default, which replaces the <tbody> tag.
const globalOpts = { stubs: { transition: false, 'transition-group': false } }

const columns: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'qty', label: 'Qty', align: 'right' },
]
const data = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `row ${i + 1}`, qty: i }))

describe('Table', () => {
  it('renders one column per definition, with default cell text', () => {
    const w = mount(Table, { props: { data, columns }, global: globalOpts })
    // 2 data columns + grip + checkbox (no actions slot)
    expect(w.findAll('thead th')).toHaveLength(4)
    expect(w.findAll('thead th').map((t) => t.text())).toEqual(['', '', 'Name', 'Qty'])
    expect(w.findAll('tbody tr')[0].findAll('td')[2].text()).toBe('row 1')
  })

  it('lets a slot override one column', () => {
    const w = mount(Table, {
      props: { data, columns },
      global: globalOpts,
      slots: { 'cell-name': '<b>overridden</b>' },
    })
    expect(w.findAll('tbody tr')[0].findAll('td')[2].html()).toContain('<b>overridden</b>')
  })

  it('emits update:selected and accepts an inbound selected prop', async () => {
    const w = mount(Table, { props: { data, columns, selected: [] }, global: globalOpts })

    await w.findAll('tbody input[type="checkbox"]')[0].setValue(true)
    expect(w.emitted('update:selected')?.at(-1)).toEqual([[1]])

    // inbound: parent pushes a new selection
    await w.setProps({ selected: [2, 3] })
    const checked = w
      .findAll('tbody tr')
      .map((tr) => (tr.find('input[type="checkbox"]').element as HTMLInputElement).checked)
    expect(checked.slice(0, 3)).toEqual([false, true, true])

    // no runaway loop: one inbound change yields at most one more emit
    const emits = w.emitted('update:selected')?.length ?? 0
    await w.vm.$nextTick()
    expect((w.emitted('update:selected')?.length ?? 0) - emits).toBeLessThanOrEqual(1)
  })

  it('reacts to a pageSize prop change and emits on internal change', async () => {
    const w = mount(Table, { props: { data, columns, pageSize: 10 }, global: globalOpts })
    expect(w.findAll('tbody tr')).toHaveLength(10)

    await w.setProps({ pageSize: 20 })
    expect(w.findAll('tbody tr')).toHaveLength(20)

    await w.find('select').setValue('30')
    expect(w.emitted('update:pageSize')?.at(-1)).toEqual([30])
  })

  it('hides structural columns when disabled and shows the empty slot', () => {
    const w = mount(Table, {
      props: { data: [], columns, selectable: false, reorderable: false },
      global: globalOpts,
    })
    expect(w.findAll('thead th')).toHaveLength(2)
    expect(w.find('tbody td').text()).toBe('No rows to display.')
    expect(w.find('tbody td').attributes('colspan')).toBe('2')
  })
})
