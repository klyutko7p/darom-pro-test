<script lang="ts" setup>
import PullToRefresh from "pulltorefreshjs";

onMounted(() => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isIOS) {
    PullToRefresh.init({
      instructionsRefreshing: 'Обновляем',
      instructionsPullToRefresh: 'Потяните вниз, чтобы обновить',
      instructionsReleaseToRefresh: 'Отпустите, чтобы обновить',
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
      <SidebarClientAuth />
      <div class="mt-10">
        <slot />
      </div>
    </div>
  </template>
  
  <script setup lang="ts"></script>
  