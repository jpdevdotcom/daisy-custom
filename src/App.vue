<script setup lang="ts">
import DaisyTable from './registry/table/DaisyTable.vue'
import ToastDemo from './registry/toast/ToastDemo.vue'
import './styles.css'
</script>

<template>
  <main class="mx-auto flex max-w-6xl flex-col gap-10 p-6">
    <h1 class="text-2xl font-semibold">daisy-custom</h1>

    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-medium">Toast</h2>
      <ToastDemo />
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-medium">Table</h2>
      <DaisyTable />
    </section>
  </main>
</template>
