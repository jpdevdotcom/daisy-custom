<script setup lang="ts">
import { h, ref } from 'vue'
import { toast, Toaster, type ToastPosition } from './index'

const positions: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]
const position = ref<ToastPosition>('top-center')

const save = () =>
  new Promise<string>((resolve, reject) =>
    setTimeout(
      () => (Math.random() > 0.3 ? resolve('settings') : reject(new Error('timeout'))),
      1500,
    ),
  )

const examples: { label: string; run: () => unknown }[] = [
  { label: 'Blank', run: () => toast('Here is your toast.') },
  { label: 'Success', run: () => toast.success('Successfully created!') },
  { label: 'Error', run: () => toast.error('This is an error!') },
  { label: 'Loading', run: () => toast.loading('Waiting...') },
  {
    label: 'Promise',
    run: () =>
      toast.promise(save, {
        loading: 'Saving...',
        success: (what) => `Saved ${what}!`,
        error: (e: Error) => `Could not save: ${e.message}`,
      }),
  },
  { label: 'Emoji', run: () => toast('Good Job!', { icon: '👏' }) },
  {
    label: 'Dark',
    run: () =>
      toast('Hello Darkness!', {
        icon: '👏',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      }),
  },
  {
    label: 'Multiline',
    run: () =>
      toast(
        "This toast is super big. I don't think anyone could eat it in one bite.\n\nIt's larger than you expected. You eat it but it does not seem to get smaller.",
        { duration: 6000 },
      ),
  },
  {
    label: 'Themed',
    run: () =>
      toast.success('Look at my styles.', {
        style: { border: '1px solid #713200', padding: '16px', color: '#713200' },
        iconTheme: { primary: '#713200', secondary: '#FFFAEE' },
      }),
  },
  {
    label: 'Custom',
    run: () =>
      toast.custom((t) =>
        h(
          'div',
          {
            class: 'alert alert-info shadow-lg transition-opacity',
            style: { opacity: t.visible ? 1 : 0 },
          },
          [
            h('span', 'Fully custom toast, rendered without ToastBar.'),
            h('button', { class: 'btn btn-sm', onClick: () => toast.dismiss(t.id) }, 'Close'),
          ],
        ),
      ),
  },
  { label: 'Dismiss all', run: () => toast.dismiss() },
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <button v-for="ex in examples" :key="ex.label" class="btn btn-sm" @click="ex.run()">
        {{ ex.label }}
      </button>
    </div>
    <div class="join">
      <button
        v-for="p in positions"
        :key="p"
        class="btn btn-xs join-item"
        :class="{ 'btn-active': p === position }"
        @click="position = p"
      >
        {{ p }}
      </button>
    </div>

    <!-- In an app, mount <Toaster /> once near the root, e.g. in App.vue. -->
    <Toaster :position="position" />
  </div>
</template>
