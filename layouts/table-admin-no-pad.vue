<script lang="ts" setup>
import { onMounted } from "vue";
import PullToRefresh from "pulltorefreshjs";

onMounted(() => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isIOS && !document.body.classList.contains("no-scroll")) {
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
    <Sidebar />
    <div class="mt-10">
      <slot />
    </div>
  </div>
</template>
