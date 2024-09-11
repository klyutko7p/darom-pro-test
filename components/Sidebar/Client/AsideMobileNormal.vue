<script setup lang="ts">
const emits = defineEmits(["editMenu", "signOut"]);

function editMenu() {
  emits("editMenu");
}

function signOut() {
  emits("signOut");
}
</script>
<template>
  <div>
    <div
      @click="editMenu"
      class="hover:bg-orange-100 absolute top-2 right-4 cursor-pointer duration-200 hover:text-secondary-color pt-2 px-1.5 rounded-xl"
    >
      <Icon name="material-symbols:close-small-outline-rounded" size="60" />
    </div>
    <div v-auto-animate class="h-full overflow-y-auto">
      <div class="px-3 justify-between mb-10 pb-2">
        <h5
          class="text-6xl max-[400px]:text-5xl text-center text-secondary-color font-bold uppercase dark:text-gray-400"
        >
          DAROM.PRO
        </h5>
      </div>

      <SidebarClientAsideBody
        @sign-out="signOut"
        @edit-menu="editMenu"
        v-auto-animate
      />
    </div>
  </div>
</template>
