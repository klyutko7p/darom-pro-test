<template>
  <NuxtPwaManifest />
  <NuxtLoadingIndicator />
    <div class="flex">
      <SidebarClient />
      <div class="mx-auto container px-3 mt-10">
        <slot />
      </div>
    </div>
  </template>
  
  <script setup lang="ts"></script>
  