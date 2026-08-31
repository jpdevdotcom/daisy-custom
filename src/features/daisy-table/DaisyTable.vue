<script setup lang="ts">
import Table from './components/Table.vue'
import { tableData } from './data'
</script>

<template>
  <Table :data="tableData" />
</template>
