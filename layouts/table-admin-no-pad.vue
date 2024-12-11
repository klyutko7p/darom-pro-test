<script lang="ts" setup>
import PullToRefresh from "pulltorefreshjs";

onMounted(() => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isIOS) {
    PullToRefresh.init({
      onRefresh() {
        window.location.reload();
      },
    });
  }
});
</script>

<template>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <div class="flex">
      <Sidebar  />
      <div class="mt-10">
        <slot />
      </div>
    </div>
  </template>
  