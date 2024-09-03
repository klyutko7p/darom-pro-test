<template>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <div class="flex">
      <SidebarUser  />
      <div class="px-10 mt-10">
        <slot />
      </div>
    </div>
  </template>
  