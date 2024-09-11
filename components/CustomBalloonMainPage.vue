<script lang="ts" setup>
const props = defineProps({
  commentary: { type: String },
});
</script>

<template>
  <div>
    <h1 class="font-semibold text-sm">{{ commentary }}</h1>
  </div>
</template>
