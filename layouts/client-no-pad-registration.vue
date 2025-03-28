<script lang="ts" setup>
import PullToRefresh from "pulltorefreshjs";

onMounted(() => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isIOS) {
    PullToRefresh.init({
      instructionsRefreshing: "Обновляем",
      instructionsPullToRefresh: "Потяните вниз, чтобы обновить",
      instructionsReleaseToRefresh: "Отпустите, чтобы обновить",
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
  <div
    class="fixed text-lg bottom-2 left-1/2 transform -translate-x-1/2 text-muted-color font-bold opacity-30 text-center max-sm:text-sm z-[100]"
  >
    Работает на основе Trackbiz
  </div>
  <CookieBanner />
</template>

<script setup lang="ts"></script>
