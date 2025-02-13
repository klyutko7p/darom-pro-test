<script setup lang="ts">
import { vAutoAnimate } from "@formkit/auto-animate";
import type { PropType } from "vue";

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
});

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
  try {
    settings.value = await storeUsers.getSettings();
  } catch (error) {
    console.error("Ошибка:", error);
  }
});
</script>
<template>
  <div
    @click="editMenu"
    class="hover:bg-orange-100 z-[200] absolute top-2 right-4 cursor-pointer duration-200 hover:text-secondary-color pt-2 px-1.5 rounded-xl"
  >
    <Icon name="material-symbols:close-small-outline-rounded" size="60" />
  </div>
  <div v-auto-animate class="h-full overflow-y-auto">
    <div class="px-3 justify-between mb-10 pb-2">
      <h5
        v-if="settings[0]"
        class="text-6xl max-[400px]:text-5xl text-center text-secondary-color font-bold uppercase dark:text-gray-400"
      >
        {{ settings[0].title }}
      </h5>
    </div>

    <SidebarAsideBody
      :user="user"
      @sign-out="signOut"
      @edit-menu="editMenu"
      v-auto-animate
    />
  </div>
</template>
