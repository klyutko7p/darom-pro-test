<script lang="ts" setup>
const props = defineProps({
  commentary: { type: String },
});
</script>

<template>
  <div>
    <h1 class="font-bold text-base">{{ commentary }}</h1>
  </div>
</template>
