<script setup lang="ts">
const emit = defineEmits(["createData"]);

let name = ref("");

defineProps({
  title: { type: String, required: true },
});

function createData() {
  emit("createData", name.value);
}
</script>

<template>
  <div class="mt-10 px-3">
    <h1 class="text-lg mb-2">
      Добавить {{ title }}
      <Icon class="text-yellow-400" name="material-symbols:add" size="24" />
    </h1>
    <div class="flex items-center gap-3">
      <div class="flex flex-col gap-1">
        <label for="username">Название</label>
        <UInput
          v-model="name"
          name="name"
          placeholder="Введите название"
          icon="material-symbols-light:add-circle-rounded"
          autocomplete="off"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <UButton
              v-show="name !== ''"
              color="gray"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              :padded="false"
              @click="name = ''"
            />
          </template>
        </UInput>
      </div>
    </div>
    <UIMainButton class="mt-3" @click="createData">Добавить</UIMainButton>
  </div>
</template>
