<script lang="ts" setup>
const props = defineProps({
  commentary: { type: String },
});
</script>

<template>
  <div class="">
    <h1 class="font-semibold text-sm overflow-y-scroll max-h-[100px] max-sm:max-h-[60px]">
      {{ commentary }}
    </h1>
  </div>
</template>
