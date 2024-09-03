<template>
  <NuxtPwaManifest />
  <NuxtLoadingIndicator />
  <div class="flex">
    <Sidebar  />
    <div class="mx-auto container px-3 mt-10">
      <slot />
    </div>
  </div>
</template>
