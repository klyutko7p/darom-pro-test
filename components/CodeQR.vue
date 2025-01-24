<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
const renderAs = ref('svg')

defineProps({
  value: { type: String },
});
</script>

<template>
  <qrcode-vue :size="500" :value="value" :render-as="renderAs" />
</template>

