<script setup lang="ts">
import { read, utils, writeFile } from "xlsx";

const isLoading = ref(false);
const storeWorklog = useWorklogStore();
const storeTasksEmployer = useTasksEmployerStore();
const storeUsers = useUsersStore();
const storeUsersFourssan = useUsersFourssanStore();
const router = useRouter();

const user = ref({} as User);
const users = ref<UserFourssan[]>([]);
const worklogs = ref<WorkLog[]>([]);
const worklogData = ref({} as WorkLog);

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  if (user.value.error === "Unauthorized") {
    return router.push("/");
  }

  users.value = await storeUsersFourssan.getUsers();
  worklogs.value = await storeWorklog.getWorklogs();
  updateCurrentPageData();
  isLoading.value = false;
});

async function deleteWorklog(id: number) {
  isLoading.value = true;

  let answer = confirm("Вы уверены, что хотите удалить эту строчку?");
  if (answer) {
    await storeWorklog.deleteWorklog(id);
    worklogs.value = await storeWorklog.getWorklogs();
    updateCurrentPageData();
    closeModal();
  }

  isLoading.value = false;
}

const totalHours = (data: Record<string, number>) =>
  Object.values(data).reduce((a, b) => a + (b || 0), 0);
const workedDays = (data: Record<string, number>) =>
  Object.values(data).filter((h) => h > 0).length;

const updateWorklog = async (obj: any) => {
  const validatedHours = Number(obj.hours);
  if (
    !isNaN(validatedHours) &&
    validatedHours >= 0 &&
    Number.isInteger(validatedHours)
  ) {
    await storeWorklog.updateWorklog(obj.id, obj.day, validatedHours);
    let worklog = worklogs.value.find((emp) => emp.id === obj.id);
    if (worklog) {
      await storeWorklog.updatePayroll(
        worklog.user.name,
        selectedYear.value,
        selectedMonth.value,
        totalHours(worklog.data),
        worklog.pvz,
        worklog.company
      );
    }
  } else {
    let worklog = worklogs.value.find((emp) => emp.id === obj.id);
    if (worklog) {
      worklog.data[obj.day] = 0;
    }
  }
};

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(2025);
const monthNames = ref({
  1: "Январь",
  2: "Февраль",
  3: "Март",
  4: "Апрель",
  5: "Май",
  6: "Июнь",
  7: "Июль",
  8: "Август",
  9: "Сентябрь",
  10: "Октябрь",
  11: "Ноябрь",
  12: "Декабрь",
});

function nextMonth() {
  selectedMonth.value += 1;
}
function prevMonth() {
  selectedMonth.value -= 1;
}
function watchSelectedMonth() {
  if (selectedMonth.value <= 0) {
    selectedMonth.value = 12;
    selectedYear.value -= 1;
  } else if (selectedMonth.value > 12) {
    selectedMonth.value = 1;
    selectedYear.value += 1;
  }
  updateCurrentPageData();
}
watch(() => selectedMonth.value, watchSelectedMonth);

const daysInMonth = computed(() => {
  const days = new Date(selectedYear.value, selectedMonth.value, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
});

const returnRows = ref<WorkLog[]>([]);
function updateCurrentPageData() {
  returnRows.value = worklogs.value.filter((row: WorkLog) => {
    let rowDate = new Date(row.month);
    return (
      rowDate.getMonth() + 1 === selectedMonth.value &&
      rowDate.getFullYear() === selectedYear.value &&
      user.value.PVZ.includes(row.pvz)
    );
  });
}

const isVisibleInputs = ref(true);
async function exportToExcel() {
  isVisibleInputs.value = false;
  await nextTick();
  let table = document.querySelector("#theTable");
  let wb = utils.table_to_book(table);
  await writeFile(wb, `табель_${selectedMonth.value}.xlsx`);
  isVisibleInputs.value = true;
}

const dropdownStates = ref({} as Record<number, boolean>);
const toggleDropdown = (rowId: number) => {
  dropdownStates.value = {}; // сбросить все
  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};

const isOpenModal = ref(false);
function openModal(worklog?: WorkLog) {
  isOpenModal.value = true;
  if (worklog && worklog.id) {
    worklogData.value = JSON.parse(JSON.stringify(worklog));
    worklogData.value.month = storeUsers.getISODate(
      new Date(worklogData.value.month)
    );
  } else {
    worklogData.value = {} as WorkLog;
    let currentDate = new Date();
    currentDate.setDate(1);
    currentDate.setMonth(selectedMonth.value - 1);
    worklogData.value.month = storeUsers.getISODate(currentDate);
  }
}
function closeModal() {
  isOpenModal.value = false;
  worklogData.value = {} as WorkLog;
}

const isShowTasks = ref(false);
const userTasks = ref<TaskEmployer[]>([]);
function openShowTasks() {
  isShowTasks.value = true;
}
function closeShowTasks() {
  isShowTasks.value = false;
}
function checkTasks(obj: any) {
  openShowTasks();
  if (obj.worklog.user.Task?.length) {
    userTasks.value = obj.worklog.user.Task.filter(
      (task: TaskEmployer) => {
        const taskDate = new Date(task.createdAt);
        return (
          taskDate.getDate() === obj.day &&
          taskDate.getMonth() + 1 === selectedMonth.value &&
          taskDate.getFullYear() === selectedYear.value
        );
      }
    );
  }
}

const toggleTaskCompletion = async (taskId: number, isCompleted: boolean) => {
  await storeTasksEmployer.updateTaskStatus(taskId, isCompleted);
  const task = userTasks.value.find((t) => t.id === taskId);
  if (task) {
    task.isCompleted = isCompleted;
  }
};

async function createWorklogs() {
  isLoading.value = true;
  await storeWorklog.createWorklogs(
    worklogData.value.usersId,
    worklogData.value
  );
  worklogs.value = await storeWorklog.getWorklogs();
  updateCurrentPageData();
  closeModal();
  isLoading.value = false;
}

async function createWorklogsByMonth() {
  if (confirm("Вы уверены, что хотите создать табель за этот месяц?")) {
    isLoading.value = true;
    let usersId = users.value
      .filter((user) => user.role === "pvzEmployer")
      .map((user) => user.id);
    let currentDate = new Date();
    currentDate.setDate(1);
    currentDate.setMonth(selectedMonth.value - 1);
    worklogData.value.month = storeUsers.getISODate(currentDate);
    await storeWorklog.createWorklogs(usersId, worklogData.value);
    worklogs.value = await storeWorklog.getWorklogs();
    updateCurrentPageData();
    closeModal();
    isLoading.value = false;
  }
}

definePageMeta({
  layout: false,
  name: "Табель",
});
</script>

<template>
  <Head>
    <Title>Табель</Title>
  </Head>

  <div v-if="user.role === 'ADMIN'">
    <NuxtLayout name="table-admin-no-pad-fs">
      <div v-if="!isLoading">
        <!-- Заголовок страницы с кнопками, навигацией и экспортом -->
        <WorklogHeader
          :user="user"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :monthNames="monthNames"
          @prevMonth="prevMonth"
          @nextMonth="nextMonth"
          @exportExcel="exportToExcel"
          @createRecord="openModal"
          @createWorklogMonth="createWorklogsByMonth"
        />

        <!-- Таблица с записями табеля -->
        <WorklogTable
          v-if="returnRows"
          :worklogs="returnRows"
          :daysInMonth="daysInMonth"
          :user="user"
          :isVisibleInputs="isVisibleInputs"
          :dropdownStates="dropdownStates"
          :totalHours="totalHours"
          :workedDays="workedDays"
          @updateWorklog="updateWorklog"
          @deleteWorklog="deleteWorklog"
          @toggleDropdown="toggleDropdown"
          @checkTasks="checkTasks"
        />

        <!-- Если записей нет -->
        <div
          v-else
          class="text-2xl text-center font-semibold my-10 py-24 rounded-md bg-gray-100"
        >
          Записей на этот месяц не найдено.
        </div>

        <UModal
          :ui="{ container: 'flex items-center justify-center text-center' }"
          v-model="isOpenModal"
          prevent-close
        >
          <!-- Содержимое модального окна можно оставить здесь или вынести в отдельный компонент – главное, UModal остаётся неизменным -->
          <UCard
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Запись
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpenModal = false"
                />
              </div>
            </template>
            <div>
              <!-- Здесь оставляем ту же разметку для создания/редактирования записи табеля -->
              <div
                v-if="!worklogData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор доступных сотрудников</h1>
                <USelectMenu
                  v-if="users"
                  v-model="worklogData.usersId"
                  searchable
                  searchable-placeholder="Поиск по имени..."
                  value-attribute="id"
                  option-attribute="name"
                  :options="users.filter((user) => user.role !== 'admin')"
                  multiple
                  placeholder="Выберите сотрудников"
                  class="w-full"
                />
              </div>
              <div
                v-if="worklogData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор сотрудника</h1>
                <USelectMenu
                  v-if="users"
                  v-model="worklogData.userId"
                  searchable
                  searchable-placeholder="Поиск по имени..."
                  value-attribute="id"
                  option-attribute="name"
                  :options="users.filter((user) => user.role === 'pvzEmployer')"
                  placeholder="Выберите сотрудника"
                  class="w-full"
                />
              </div>
              <div class="flex items-start flex-col gap-3 mb-3">
                <h1>Выберите месяц</h1>
                <select
                  v-model="worklogData.month"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
                >
                  <option :value="`${selectedYear}-01-01`">Январь</option>
                  <option :value="`${selectedYear}-02-01`">Февраль</option>
                  <option :value="`${selectedYear}-03-01`">Март</option>
                  <option :value="`${selectedYear}-04-01`">Апрель</option>
                  <option :value="`${selectedYear}-05-01`">Май</option>
                  <option :value="`${selectedYear}-06-01`">Июнь</option>
                  <option :value="`${selectedYear}-07-01`">Июль</option>
                  <option :value="`${selectedYear}-08-01`">Август</option>
                  <option :value="`${selectedYear}-09-01`">Сентябрь</option>
                  <option :value="`${selectedYear}-10-01`">Октябрь</option>
                  <option :value="`${selectedYear}-11-01`">Ноябрь</option>
                  <option :value="`${selectedYear}-12-01`">Декабрь</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 mt-3">
              <UButton
                v-if="!worklogData.id"
                color="green"
                icon="material-symbols:add-task"
                @click="createWorklogs"
                class="font-semibold duration-200"
              >
                Создать
              </UButton>
              <UButton
                @click="closeModal"
                class="font-semibold duration-200"
                color="red"
                icon="akar-icons:cross"
              >
                Отменить
              </UButton>
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{ container: 'flex items-center justify-center text-center' }"
          v-model="isShowTasks"
          prevent-close
        >
          <UCard
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Задачи
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="closeShowTasks"
                />
              </div>
            </template>
            <div v-if="userTasks.length" class="flex flex-col gap-3">
              <h1 class="font-semibold">
                {{
                  new Date(userTasks[0].createdAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                }}
              </h1>
              <div
                v-for="(task, index) in userTasks"
                :key="index"
                class="bg-white border-[1px] duration-200 rounded flex p-4 max-sm:p-4 items-center"
                :class="{
                  'border-green-600': task.isCompleted,
                  'border-red-600 text-red-600':
                    !task.isCompleted && new Date() > new Date(task.createdAt),
                }"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-3">
                    <div class="inline-flex items-center">
                      <label class="flex items-center cursor-pointer relative">
                        <input
                          @change="
                            toggleTaskCompletion(task.id, task.isCompleted)
                          "
                          type="checkbox"
                          v-model="task.isCompleted"
                          class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border bg-slate-200 border-slate-500 checked:bg-green-600 checked:border-green-600"
                          id="check4"
                        />
                        <span
                          class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            stroke="currentColor"
                            stroke-width="1"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                        </span>
                      </label>
                    </div>
                    <div>
                      <span :class="{ strike: task.isCompleted }">{{
                        task.title
                      }}</span>
                      <br />
                      <span
                        v-if="task.description"
                        class="italic text-sm"
                        :class="{ strike: task.isCompleted }"
                      >
                        {{ task.description }}
                      </span>
                    </div>
                  </div>
                  <div
                    class="italic mt-2"
                    v-if="task.isCompleted && task.doneDate"
                  >
                    {{ storeUsers.getNormalizedDate(task.doneDate) }}
                  </div>
                </div>
              </div>
              <div class="pt-5 flex items-center flex-col gap-3">
                <UButton class="font-semibold" @click="closeShowTasks"
                  >Закрыть</UButton
                >
              </div>
            </div>
            <div v-else class="py-5 flex items-center flex-col gap-3">
              <h1 class="text-center">Задач на эту дату не найдено.</h1>
              <UButton class="font-semibold" @click="closeShowTasks"
                >Закрыть</UButton
              >
            </div>
          </UCard>
        </UModal>
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-if="user.role !== 'ADMIN'">
    <NuxtLayout name="table-user-no-pad-fs">
      <div v-if="!isLoading">
        <!-- Заголовок страницы с кнопками, навигацией и экспортом -->
        <WorklogHeader
          :user="user"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :monthNames="monthNames"
          @prevMonth="prevMonth"
          @nextMonth="nextMonth"
          @exportExcel="exportToExcel"
          @createRecord="openModal"
          @createWorklogMonth="createWorklogsByMonth"
        />

        <!-- Таблица с записями табеля -->
        <WorklogTable
          v-if="returnRows"
          :worklogs="returnRows"
          :daysInMonth="daysInMonth"
          :user="user"
          :isVisibleInputs="isVisibleInputs"
          :dropdownStates="dropdownStates"
          :totalHours="totalHours"
          :workedDays="workedDays"
          @updateWorklog="updateWorklog"
          @deleteWorklog="deleteWorklog"
          @toggleDropdown="toggleDropdown"
          @checkTasks="checkTasks"
        />

        <!-- Если записей нет -->
        <div
          v-else
          class="text-2xl text-center font-semibold my-10 py-24 rounded-md bg-gray-100"
        >
          Записей на этот месяц не найдено.
        </div>

        <UModal
          :ui="{ container: 'flex items-center justify-center text-center' }"
          v-model="isOpenModal"
          prevent-close
        >
          <!-- Содержимое модального окна можно оставить здесь или вынести в отдельный компонент – главное, UModal остаётся неизменным -->
          <UCard
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Запись
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpenModal = false"
                />
              </div>
            </template>
            <div>
              <!-- Здесь оставляем ту же разметку для создания/редактирования записи табеля -->
              <div
                v-if="!worklogData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор доступных сотрудников</h1>
                <USelectMenu
                  v-if="users"
                  v-model="worklogData.usersId"
                  searchable
                  searchable-placeholder="Поиск по имени..."
                  value-attribute="id"
                  option-attribute="name"
                  :options="users.filter((user) => user.role !== 'admin')"
                  multiple
                  placeholder="Выберите сотрудников"
                  class="w-full"
                />
              </div>
              <div
                v-if="worklogData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор сотрудника</h1>
                <USelectMenu
                  v-if="users"
                  v-model="worklogData.userId"
                  searchable
                  searchable-placeholder="Поиск по имени..."
                  value-attribute="id"
                  option-attribute="name"
                  :options="users.filter((user) => user.role === 'pvzEmployer')"
                  placeholder="Выберите сотрудника"
                  class="w-full"
                />
              </div>
              <div class="flex items-start flex-col gap-3 mb-3">
                <h1>Выберите месяц</h1>
                <select
                  v-model="worklogData.month"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
                >
                  <option :value="`${selectedYear}-01-01`">Январь</option>
                  <option :value="`${selectedYear}-02-01`">Февраль</option>
                  <option :value="`${selectedYear}-03-01`">Март</option>
                  <option :value="`${selectedYear}-04-01`">Апрель</option>
                  <option :value="`${selectedYear}-05-01`">Май</option>
                  <option :value="`${selectedYear}-06-01`">Июнь</option>
                  <option :value="`${selectedYear}-07-01`">Июль</option>
                  <option :value="`${selectedYear}-08-01`">Август</option>
                  <option :value="`${selectedYear}-09-01`">Сентябрь</option>
                  <option :value="`${selectedYear}-10-01`">Октябрь</option>
                  <option :value="`${selectedYear}-11-01`">Ноябрь</option>
                  <option :value="`${selectedYear}-12-01`">Декабрь</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 mt-3">
              <UButton
                v-if="!worklogData.id"
                color="green"
                icon="material-symbols:add-task"
                @click="createWorklogs"
                class="font-semibold duration-200"
              >
                Создать
              </UButton>
              <UButton
                @click="closeModal"
                class="font-semibold duration-200"
                color="red"
                icon="akar-icons:cross"
              >
                Отменить
              </UButton>
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{ container: 'flex items-center justify-center text-center' }"
          v-model="isShowTasks"
          prevent-close
        >
          <UCard
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Задачи
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="closeShowTasks"
                />
              </div>
            </template>
            <div v-if="userTasks.length" class="flex flex-col gap-3">
              <h1 class="font-semibold">
                {{
                  new Date(userTasks[0].createdAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                }}
              </h1>
              <div
                v-for="(task, index) in userTasks"
                :key="index"
                class="bg-white border-[1px] duration-200 rounded flex p-4 max-sm:p-4 items-center"
                :class="{
                  'border-green-600': task.isCompleted,
                  'border-red-600 text-red-600':
                    !task.isCompleted && new Date() > new Date(task.createdAt),
                }"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-3">
                    <div class="inline-flex items-center">
                      <label class="flex items-center cursor-pointer relative">
                        <input
                          @change="
                            toggleTaskCompletion(task.id, task.isCompleted)
                          "
                          type="checkbox"
                          v-model="task.isCompleted"
                          class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border bg-slate-200 border-slate-500 checked:bg-green-600 checked:border-green-600"
                          id="check4"
                        />
                        <span
                          class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            stroke="currentColor"
                            stroke-width="1"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                        </span>
                      </label>
                    </div>
                    <div>
                      <span :class="{ strike: task.isCompleted }">{{
                        task.title
                      }}</span>
                      <br />
                      <span
                        v-if="task.description"
                        class="italic text-sm"
                        :class="{ strike: task.isCompleted }"
                      >
                        {{ task.description }}
                      </span>
                    </div>
                  </div>
                  <div
                    class="italic mt-2"
                    v-if="task.isCompleted && task.doneDate"
                  >
                    {{ storeUsers.getNormalizedDate(task.doneDate) }}
                  </div>
                </div>
              </div>
              <div class="pt-5 flex items-center flex-col gap-3">
                <UButton class="font-semibold" @click="closeShowTasks"
                  >Закрыть</UButton
                >
              </div>
            </div>
            <div v-else class="py-5 flex items-center flex-col gap-3">
              <h1 class="text-center">Задач на эту дату не найдено.</h1>
              <UButton class="font-semibold" @click="closeShowTasks"
                >Закрыть</UButton
              >
            </div>
          </UCard>
        </UModal>
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>
</template>
