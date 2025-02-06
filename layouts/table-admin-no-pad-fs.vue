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
  <div>
    <div class="flex">
      <Sidebar />
    </div>
    <div class="pt-10">
      <slot />
    </div>
  </div>
</template>
