<template>
  <NuxtPwaManifest />
  <div class="flex">
    <SidebarUser />
    <div class="mx-auto container px-3 mt-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>
