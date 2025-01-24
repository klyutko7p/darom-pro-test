<template>
  <NuxtPwaManifest />
  <NuxtLoadingIndicator />
    <div class="flex">
      <SidebarClient />
      <div class="mt-10">
        <slot />
      </div>
    </div>
  </template>
  
  <script setup lang="ts"></script>
  