<script setup lang="ts">
import { vAutoAnimate } from "@formkit/auto-animate";

const emits = defineEmits(["editMenu", "signOut"]);

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
});

function editMenu() {
  emits("editMenu");
}

function signOut() {
  emits("signOut");
}

const storeUsers = useUsersStore();
const settings = ref<Array<any>>([]);
onMounted(async () => {
  try {
    settings.value = await storeUsers.getSettings();
  } catch (error) {
    console.error("Ошибка:", error);
  }
});
</script>
<template>
  <div v-auto-animate class="h-full overflow-y-auto">
    <div class="flex items-center relative px-3 justify-between mb-3 pb-2">
      <h5 v-if="settings[0]"
        class="text-4xl text-secondary-color font-bold uppercase dark:text-gray-400"
      >
        {{ settings[0].title }}
      </h5>
      <div
        @click="editMenu"
        class="hover:bg-orange-100 z-[200] absolute left-60 cursor-pointer duration-200 hover:text-secondary-color pt-2 px-1.5 rounded-xl"
      >
        <Icon name="material-symbols:close-small-outline-rounded" size="24" />
      </div>
    </div>

    <SidebarAsideBody
      :user="user"
      @sign-out="signOut"
      @edit-menu="editMenu"
      v-auto-animate
    />
  </div>
</template>
