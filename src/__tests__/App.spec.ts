import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the component demos', () => {
    const wrapper = mount(App, {
      global: { stubs: { transition: false, 'transition-group': false } },
    })
    expect(wrapper.find('h1').text()).toBe('daisy-custom')
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.text()).toContain('Success')
  })
})
