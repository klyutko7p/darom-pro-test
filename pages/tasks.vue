<script setup lang="ts">
import ru from "date-fns/locale/ru";
import { format } from "date-fns";

import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeTasks = useTasksStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<Task>>();
const filteredRows = ref<Array<Task>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  await deleteIssuedRows();
  rows.value = await storeTasks.getTasks();
  isLoading.value = false;

  if (user.value.username) {
    selectedUser.value = user.value.username;
  }
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
    rowData.value.created_at = rowData.value.created_at
      ? storeUsers.getISODate(rowData.value.created_at)
      : null;
    rowData.value.deadline = rowData.value.deadline
      ? storeUsers.getISODate(rowData.value.deadline)
      : null;
    rowData.value.done = rowData.value.done
      ? storeUsers.getISODate(rowData.value.done)
      : null;
    rowData.value.checked = rowData.value.checked
      ? storeUsers.getISODate(rowData.value.checked)
      : null;
  } else {
    rowData.value = {} as Task;
    rowData.value.created_at = new Date();
    rowData.value.deadline = new Date();
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as Task;
}

async function createRow() {
  isLoading.value = true;
  rowData.value.createdUser = user.value.username;
  await storeTasks.createTask(rowData.value);
  await storeUsers.sendMessageToEmployee(
    "Новая задача",
    "Вам поступила новая задача в DAROM.PRO!",
    rowData.value.responsible
  );
  rows.value = await storeTasks.getTasks();
  closeModal();
  isLoading.value = false;
}

async function updateStatus(obj: any) {
  isLoading.value = true;
  await storeTasks.updateStatus(obj.row, obj.flag, obj.username);
  if (obj.flag === "done") {
    await storeUsers.sendMessageToEmployee(
      "Статус задачи",
      "Одна из задач успешно выполнена!",
      rowData.value.createdUser
    );
  } else if (obj.flag === "refinement") {
    await storeUsers.sendMessageToEmployee(
      "Статус задачи",
      "Одна из задач требует доработки!",
      rowData.value.responsible
    );
  }
  rows.value = await storeTasks.getTasks();
  isLoading.value = false;
}

async function updateRowForImg(obj: any) {
  isLoading.value = true;
  await storeTasks.updateTask(obj.row);
  rows.value = await storeTasks.getTasks();
  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  await storeTasks.updateTask(rowData.value);
  rows.value = await storeTasks.getTasks();
  closeModal();
  isLoading.value = false;
}

let showBalanceEmployees = ref(false);
let selectedUser = ref("");

function closeAdvanceReportEmployee() {
  showBalanceEmployees.value = !showBalanceEmployees.value;
  selectedUser.value = "Директор";
}

let usersOfIssued = ref([
  "Директор",
  "Власенкова",
  "Алиса",
  "Василенко",
  "Волошина",
  "Горцуева",
  "Косой",
  "Кулешов",
  "Мешков",
  "Шарафаненко",
  "Шведова",
]);

async function deleteRow(id: number) {
  let answer = confirm("Вы точно хотите удалить строку?");
  if (answer) {
    isLoading.value = true;
    await storeTasks.deleteTask(id);
    rows.value = await storeTasks.getTasks();
    isLoading.value = false;
  }
}

async function deleteIssuedRows() {
  isLoading.value = true;
  await storeTasks.deleteIssuedRows();
  rows.value = await storeTasks.getTasks();
  isLoading.value = false;
}

const isSaveDisabled = computed(() => {
  return !rowData.value.description || !rowData.value.responsible;
});
</script>

<template>
  <Head>
    <Title>Задачи</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="table-admin-no-pad">
      <div
        v-if="!isLoading"
        class="bg-gray-50 px-5 pt-10 max-sm:px-3 pb-5 w-screen"
      >
        <UIMainButton @click="openModal" class="mb-5"
          >Создать задачу</UIMainButton
        >

        <div v-if="user.role === 'ADMIN'">
          <div class="flex items-center gap-3 mb-5">
            <h1 class="font-bold text-xl">Проверить сотрудника</h1>
            <Icon
              @click="closeAdvanceReportEmployee"
              name="clarity:employee-line"
              size="24"
              class="text-secondary-color hover:opacity-50 cursor-pointer duration-200"
            />
          </div>
          <div
            v-if="showBalanceEmployees"
            class="text-xl border-2 bg-white p-5 border-dashed border-black"
          >
            <select
              v-model="selectedUser"
              class="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 inline-flex items-center text-left cursor-default rounded-md text-sm gap-x-1.5 px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
            >
              <option :value="user" v-for="user in usersOfIssued">
                {{ user }}
              </option>
            </select>
          </div>
        </div>

        <TaskTable
          v-if="
            selectedUser === 'Директор' ||
            selectedUser === 'Власенкова' ||
            selectedUser === 'Горцуева'
          "
          :user="user"
          :rows="rows"
          @open-modal="openModal"
          @update-status="updateStatus"
          @delete-row="deleteRow"
          @update-row-for-img="updateRowForImg"
        />

        <TaskTable
          v-if="
            selectedUser !== 'Директор' &&
            selectedUser !== 'Власенкова' &&
            selectedUser !== 'Горцуева'
          "
          :user="user"
          :rows="rows?.filter((row) => row.responsible === selectedUser)"
          @open-modal="openModal"
          @update-status="updateStatus"
          @delete-row="deleteRow"
          @update-row-for-img="updateRowForImg"
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
                <label for="description" class="max-sm:text-sm"
                  >Дата создания</label
                >
                <UPopover
                  class="w-full"
                  :disabled="true"
                  v-if="rowData.created_at"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    :overlay="true"
                    type="button"
                    icon="i-heroicons-calendar-days-20-solid"
                    color="white"
                    :disabled="true"
                    class="w-full"
                  >
                    {{
                      format(rowData.created_at, "dd MMM yyy", { locale: ru })
                    }}
                  </UButton>

                  <template #panel="{ close }">
                    <DatePickerNotRange
                      v-model="rowData.created_at"
                      is-required
                      @close="close"
                    />
                  </template>
                </UPopover>
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="description" class="max-sm:text-sm">Задача</label>
                <UTextarea class="w-full" v-model="rowData.description" />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="description" class="max-sm:text-sm"
                  >Ответственный</label
                >
                <USelectMenu
                  class="w-full"
                  v-model="rowData.responsible"
                  :options="usersOfIssued"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="description" class="max-sm:text-sm"
                  >Выполнить до</label
                >
                <input
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="rowData.deadline"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="notation" class="max-sm:text-sm">Комментарий</label>
                <UInput
                  color="white"
                  variant="outline"
                  v-model="rowData.notation"
                  class="w-full"
                />
              </div>

              <div
                v-if="rowData.id && rowData.done"
                class="flex flex-col items-start text-left gap-2 mb-5"
              >
                <label for="done" class="max-sm:text-sm">Выполнено</label>
                <input
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="rowData.done"
                />
              </div>

              <div
                v-if="rowData.id && rowData.checked"
                class="flex flex-col items-start text-left gap-2 mb-5"
              >
                <label for="checked" class="max-sm:text-sm">Проверено</label>
                <input
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="rowData.checked"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div
              class="flex items-center justify-center gap-3"
              v-if="rowData.id"
            >
              <UISaveModalButton :disabled="isSaveDisabled" @click="updateRow"
                >Сохранить
              </UISaveModalButton>
              <UIExitModalButton @click="closeModal"
                >Отменить
              </UIExitModalButton>
            </div>
            <div class="flex items-center justify-center gap-3" v-else>
              <UISaveModalButton :disabled="isSaveDisabled" @click="createRow"
                >Создать
              </UISaveModalButton>
              <UIExitModalButton @click="closeModal"
                >Отменить
              </UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-if="token && user.role !== 'ADMIN'">
    <NuxtLayout name="table-user-no-pad">
      <div
        v-if="!isLoading"
        class="bg-gray-50 px-5 pt-10 max-sm:px-3 pb-5 w-screen"
      >
        <TaskTable
          :user="user"
          :rows="rows?.filter((row) => row.responsible === user.username)"
          @open-modal="openModal"
          @update-status="updateStatus"
          @update-row-for-img="updateRowForImg"
        />
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>
</template>
