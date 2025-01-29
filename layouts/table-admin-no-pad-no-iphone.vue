<template>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <div class="flex">
      <Sidebar  />
      <div class="mt-10">
        <slot />
      </div>
    </div>
  </template>
  