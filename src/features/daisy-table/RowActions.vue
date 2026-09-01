<script setup lang="ts">
import Icon from './Icon.vue'

defineEmits<{
  (e: 'edit'): void
  (e: 'duplicate'): void
  (e: 'favorite'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="dropdown dropdown-end">
    <div
      tabindex="0"
      role="button"
      class="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
      aria-label="Open row menu"
    >
      <Icon name="dots" />
    </div>
    <ul
      tabindex="0"
      class="menu dropdown-content z-10 w-36 rounded-box border border-base-content/10 bg-base-100 p-1 shadow-lg"
    >
      <li><a @click="$emit('edit')">Edit</a></li>
      <li><a @click="$emit('duplicate')">Make a copy</a></li>
      <li><a @click="$emit('favorite')">Favorite</a></li>
      <li class="menu-title mx-1 my-1 h-px bg-base-content/10 p-0"></li>
      <li><a class="text-error" @click="$emit('delete')">Delete</a></li>
    </ul>
  </div>
</template>
