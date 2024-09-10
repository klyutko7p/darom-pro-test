<template>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <div class="flex">
      <SidebarUser  />
      <div class="mt-10">
        <slot />
      </div>
    </div>
  </template>
  