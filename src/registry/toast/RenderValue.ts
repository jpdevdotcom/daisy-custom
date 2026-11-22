import { defineComponent, h, isVNode, type Component, type PropType } from 'vue'
import type { Renderable } from './types'

/** Renders a Renderable: text, a VNode, or a component. */
export default defineComponent({
  name: 'RenderValue',
  props: { value: { type: null as unknown as PropType<Renderable>, default: undefined } },
  setup(props) {
    return () => {
      const v = props.value
      if (v == null || (v as unknown) === false) return null
      if (typeof v === 'string' || typeof v === 'number') return String(v)
      if (isVNode(v)) return v
      return h(v as Component)
    }
  },
})
