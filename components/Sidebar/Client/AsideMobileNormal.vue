<script setup lang="ts">
const emits = defineEmits(["editMenu", "signOut"]);

function editMenu() {
  emits("editMenu");
}

function signOut() {
  emits("signOut");
}
const storeUsers = useUsersStore();
const settings = ref<Array<any>>([]);
onMounted(async () => {
  settings.value = await storeUsers.getSettings();
});

const router = useRouter();
</script>
<template>
  <div class="flex items-center">
    <div
      @click="editMenu"
      class="hover:bg-orange-100 z-[200] absolute top-5 left-2 cursor-pointer duration-200 hover:text-secondary-color pt-2 px-1.5 rounded-xl"
    >
      <Icon
        @click="router.push('/?home=true')"
        size="32"
        name="material-symbols:home-and-garden-rounded"
        class="hover:opacity-50 duration-200 cursor-pointer"
      />
    </div>
    <div
      @click="editMenu"
      class="hover:bg-orange-100 z-[200] absolute top-2 right-2 cursor-pointer duration-200 hover:text-secondary-color pt-2 px-1.5 rounded-xl"
    >
      <Icon name="material-symbols:close-small-outline-rounded" size="60" />
    </div>
  </div>

  <div v-auto-animate class="h-full overflow-y-auto">
    <div class="px-3 justify-between mb-10 pb-2">
      <h5
        v-if="settings[0]"
        @click="router.push('/client/main?notification=false'), editMenu()"
        class="text-6xl cursor-pointer max-[400px]:text-5xl text-center text-secondary-color font-bold uppercase dark:text-gray-400"
      >
        {{ settings[0].title }}
      </h5>
    </div>

    <SidebarClientAsideBody
      @sign-out="signOut"
      @edit-menu="editMenu"
      v-auto-animate
    />
  </div>
</template>
