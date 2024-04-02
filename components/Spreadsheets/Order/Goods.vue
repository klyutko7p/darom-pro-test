import type updateDelivery from "~/server/api/ransom/update-delivery"; import type {
userInfo } from "os";
<script setup lang="ts">
import type { PropType } from "vue";
import { useToast } from "vue-toastification";
import { read, utils, writeFile } from "xlsx";

const toast = useToast();

const storeUsers = useUsersStore();

const props = defineProps({
  rows: {
    type: Array as PropType<IOurRansom[] | IClientRansom[]>,
    required: true,
  },
  user: { type: Object as PropType<Client> },
});
</script>

<template>
  <div class="flex items-center gap-3 justify-around mt-10 flex-col" v-if="rows">
    <div
      v-for="row in rows.filter((row) => row.productName)"
      class="border-2 border-black bg-gray-100 shadow-xl border-dashed py-16 px-5 w-full mb-5"
    >
      <div v-if="row.amountFromClient1">
        <h1 class="text-3xl mb-3 font-bold">{{ row.productName }}</h1>
        <h1 class="text-lg">Сумма с клиента: {{ Math.ceil(row.amountFromClient1 / 10) * 10 }} ₽</h1>
        <h1 class="text-lg">
          <a
            :href="row.productLink"
            target="_blank"
            class="text-secondary-color underline font-bold cursor-pointer duration-200 hover:opacity-50"
            >Ссылка на товар</a
          >
        </h1>
        <h1 v-if="row.issued" class="text-lg font-bold text-green-500">Дата выдачи: {{ storeUsers.getNormalizedDate(row.issued) }}</h1>
      </div>
      <div v-else-if="row.amountFromClient2">
        <h1 class="text-3xl mb-3 font-bold">Количество товаров: {{ row.productName }}</h1>
        <h1 class="text-xl">{{ row.productLink }} </h1>
        <h1 class="text-lg">Сумма с клиента: {{ row.amountFromClient2 }} ₽</h1>
        <h1 v-if="row.issued" class="text-lg font-bold text-green-500">Дата выдачи: {{ storeUsers.getNormalizedDate(row.issued) }}</h1>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
