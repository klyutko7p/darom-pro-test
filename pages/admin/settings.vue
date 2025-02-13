<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const router = useRouter();

async function updateSettings(settings: any) {
  await storeUsers.updateSettings(settings);
}

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);
const settings = ref<Array<any>>([]);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  settings.value = await storeUsers.getSettings();
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

const columns = [
  {
    key: "title",
    label: "Название сайта",
  },
  // {
  //   key: "mainNumber",
  //   label: "Контактный телефон (формат +7XXXXXXXXXX)",
  // },
  {
    key: "address",
    label: "Адрес, куда заказывать",
  },
  // {
  //   key: "tgContact",
  //   label: "Телеграм для контакта (ссылка)",
  // },
  // {
  //   key: "whatsappContact",
  //   label: "Ватсап для контакта (ссылка)",
  // },
  // {
  //   key: "tg",
  //   label: "Телеграм (ссылка)",
  // },
  // {
  //   key: "vk",
  //   label: "Вконтакте (ссылка)",
  // },
];
</script>

<template>
  <Head>
    <Title>Настройки сайта</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading" class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5">
        <UTable
          class="w-full text-center bg-white border-[1px] rounded-md"
          :ui="{ td: { base: '' }, th: {base: 'text-center'}, default: { checkbox: { color: 'gray' as any } } }"
          :rows="settings"
          :columns="columns"
        >
          <template #title-data="{ row }">
            <input
              :disabled="user.username !== 'Директор'"
              @blur="updateSettings(row)"
              v-model="row.title"
              class="min-w-[170px] text-center w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
            />
          </template>
          <template #mainNumber-data="{ row }">
            <input
              :disabled="user.username !== 'Директор'"
              @blur="updateSettings(row)"
              v-model="row.mainNumber"
              class="min-w-[170px] text-center w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
            />
          </template>
          <template #address-data="{ row }">
            <input
              :disabled="user.username !== 'Директор'"
              @blur="updateSettings(row)"
              v-model="row.address"
              class="min-w-[170px] text-center w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
            />
          </template>
          <template #tgContact-data="{ row }">
            <input
              :disabled="user.username !== 'Директор'"
              @blur="updateSettings(row)"
              v-model="row.tgContact"
              class="min-w-[170px] text-center w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
            />
          </template>
          <template #whatsappContact-data="{ row }">
            <input
              :disabled="user.username !== 'Директор'"
              @blur="updateSettings(row)"
              v-model="row.whatsappContact"
              class="min-w-[170px] text-center w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
            />
          </template>
          <template #tg-data="{ row }">
            <input
              :disabled="user.username !== 'Директор'"
              @blur="updateSettings(row)"
              v-model="row.tg"
              class="min-w-[170px] text-center w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
            />
          </template>
          <template #vk-data="{ row }">
            <input
              :disabled="user.username !== 'Директор'"
              @blur="updateSettings(row)"
              v-model="row.vk"
              class="min-w-[170px] text-center w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
            />
          </template>
        </UTable>
      </div>

      <div v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>
</template>
