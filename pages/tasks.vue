<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const storeUsers = useUsersStore();
const storeTasks = useTasksStore();
const router = useRouter();

const toast = useToast();
let user = ref({} as User);
let rows = ref<Array<Task>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeTasks.getTasks();
  isLoading.value = false;
});

definePageMeta({
  layout: false,
  name: "Задачи",
});

let rowData = ref({} as Task);
let isOpen = ref(false);

function openModal(row: Task) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.done = rowData.value.done
      ? storeUsers.getISODateTime(rowData.value.done)
      : null;
    rowData.value.checked = rowData.value.checked
      ? storeUsers.getISODateTime(rowData.value.checked)
      : null;
  } else {
    rowData.value = {} as Task;
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as Task;
}

async function createRow() {
  isLoading.value = true;
  await storeTasks.createTask(rowData.value);
  rows.value = await storeTasks.getTasks();
  closeModal();
  isLoading.value = false;
}

async function updateStatus(obj: any) {
  isLoading.value = true;
  await storeTasks.updateStatus(obj.row, obj.flag);
  rows.value = await storeTasks.getTasks();
  closeModal();
  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  await storeTasks.updateTask(rowData.value);
  rows.value = await storeTasks.getTasks();
  closeModal();
  isLoading.value = false;
}
</script>

<template>
  <Head>
    <Title>Задачи</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading" class="py-10">
        <UIMainButton @click="openModal">Создать задачу</UIMainButton>

        <TaskTable
          :user="user"
          :rows="rows"
          @open-modal="openModal"
          @update-status="updateStatus"
        />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="material-symbols:task-alt" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Создание новой задачи</div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="description" class="max-sm:text-sm">Задача</label>
                <textarea
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  v-model="rowData.description"
                  type="text"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="notation" class="max-sm:text-sm">Комментарий</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  v-model="rowData.notation"
                  type="text"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="done" class="max-sm:text-sm">Выполнено</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  v-model="rowData.done"
                  type="datetime-local"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="checked" class="max-sm:text-sm">Проверено</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  v-model="rowData.checked"
                  type="datetime-local"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex items-center justify-center gap-3" v-if="rowData.id">
              <UISaveModalButton @click="updateRow">Сохранить </UISaveModalButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3" v-else>
              <UISaveModalButton @click="createRow">Создать </UISaveModalButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </template>
        </UINewModalEdit>
      </div>

      <div v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-else-if="user.role === 'USER'">
    <NuxtLayout name="user">
      <h1>
        У вас недостаточно прав на просмотр этой информации. Обратитесь к администратору
      </h1>
    </NuxtLayout>
  </div>
</template>
