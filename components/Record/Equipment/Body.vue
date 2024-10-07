<script setup lang="ts">
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const storeUsers = useUsersStore();
const props = defineProps({
  row: { type: Object as PropType<IEquipmentRow>, required: true },
  link: { type: String },
  value: { type: String },
});

let user = ref({} as User);
onMounted(async () => {
  user.value = await storeUsers.getUser();

  if (
    user.value.username === "Волошина" ||
    user.value.username === "Шарафаненко" ||
    user.value.username === "Кулешов" ||
    user.value.username === "Алиса" ||
    user.value.username === "Миллер" ||
    user.value.username === "Шведова" ||
    user.value.username === "Директор" ||
    user.value.username === "Горцуева"
  ) {
    toast.success("Доступ разрешен");
  } else {
    toast.error("Доступ запрещён");
    router.push("/user/main");
  }
});

function printPage() {
  window.print();
}
</script>

<template>
  <h1 class="text-4xl">
    Запись: <span class="text-secondary-color">{{ row.id }} </span>
  </h1>
  <div class="mt-5 text-lg grid grid-cols-2 max-lg:flex max-lg:flex-col gap-5">
    <div
      v-if="row.nameOfEquipment"
      class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-2"
    >
      <h1>Название:</h1>
      <h1>{{ row.nameOfEquipment }}</h1>
    </div>
    <div
      v-if="row.state"
      class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-2"
    >
      <h1>Состояние:</h1>
      <h1>{{ row.state }}</h1>
    </div>
    <div
      v-if="row.updatedUser"
      class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-2"
    >
      <h1>Изменил:</h1>
      <h1>{{ row.updatedUser.username }}</h1>
    </div>
    <div
      v-if="row.updated_at"
      class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-2"
    >
      <h1>Дата изменения:</h1>
      <h1>{{ storeUsers.getNormalizedDate(row.updated_at) }}</h1>
    </div>
  </div>

  <div>
    <div class="flex items-center gap-5 mt-10">
      <h1 class="text-2xl">Распечатка Штрих кода</h1>
      <UIMainButton @click="printPage">РАСПЕЧАТАТЬ ЭТИКЕТКУ</UIMainButton>
    </div>
    <div class="flex flex-col print-content">
      <div class="gap-0 flex flex-col absolute mr-10">
        <CodeQR :value="value" class="mt-10" />
        <h1 class="text-base">{{ row.id }}</h1>
        <h1
          class="text-[140px] leading-[100px] max-w-[500px] text-center relative mb-3"
          v-if="row.id"
        >
          {{ row.id }}
        </h1>
        <h1
          v-if="row.pvz"
          class="text-6xl mt-2 text-center max-w-[500px] relative"
        >
          {{ row.pvz.name }}
        </h1>
      </div>
    </div>
  </div>
</template>

<style>
/* Стили для печати */
@media print {
  body * {
    visibility: hidden;
  }

  .print-content,
  .print-content * {
    visibility: visible;
  }

  .print-content {
    position: absolute;
    left: 15%;
    top: 10%;
  }
}
</style>
