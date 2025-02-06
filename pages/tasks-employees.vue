<script setup lang="ts">
const storeTasksEmployer = useTasksEmployerStore();
const storeUsers = useUsersStore();
const storeUsersFourssan = useUsersFourssanStore();
const storePVZ = usePVZStore();
const tasks = ref<Array<TaskEmployer>>([]);
const isLoading = ref(false);
const router = useRouter();

const user = ref({} as User);
const taskData = ref({} as TaskEmployer);
const users = ref<Array<UserFourssan>>([]);
const pvz = ref<Array<any>>([]);
onMounted(async () => {
  isLoading.value = true;

  user.value = await storeUsers.getUser();

  if (user.value.role === "pvzEmployer") {
    tasks.value = await storeTasksEmployer.getTasksByUser(user.value.id);
  } else {
    tasks.value = await storeTasksEmployer.getTasks();
    users.value = await storeUsersFourssan.getUsers();
    users.value = users.value.filter((userData) =>
      user.value.PVZ.includes(userData.pvz)
    );
    users.value = users.value.sort((a, b) => a.name.localeCompare(b.name));
    pvz.value = await storePVZ.getAllPVZ();
  }

  isLoading.value = false;
  updateCurrentPageData();
});

const toggleTaskCompletion = async (taskId: number, isCompleted: boolean) => {
  await storeTasksEmployer.updateTaskStatus(taskId, isCompleted);
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    task.isCompleted = isCompleted;
  }

  temp.value = filteredRows.value.filter((row) => row.isCompleted).length;
};

async function createTask() {
  isLoading.value = true;

  taskData.value.createdAt = storeUsers.getISODateTime(
    new Date(taskData.value.createdAt)
  );

  if (taskData.value.repeatUntil) {
    taskData.value.repeatUntil = storeUsers.getISODateTime(
      new Date(taskData.value.repeatUntil)
    );
  }

  if (chooseEmployers.value === "Всем") {
    taskData.value.usersId = users.value.map((user) => user.id);
  } else if (chooseEmployers.value === "ПВЗ") {
    taskData.value.usersId = users.value
      .filter((user) => choosePVZ.value.includes(user.pvz))
      .map((user) => user.id);
  }

  if (taskData.value.usersId && taskData.value.usersId.length) {
    const userPromises = taskData.value.usersId.map(async (userId) => {
      const taskForUser = { ...taskData.value, userId };
      await storeTasksEmployer.createTask(taskForUser);
    });

    await Promise.all(userPromises);
  } else {
    await storeTasksEmployer.createTask(taskData.value);
  }

  tasks.value = await storeTasksEmployer.getTasks();

  updateCurrentPageData();
  closeModal();

  isLoading.value = false;
}

const groupedTasks = computed<Record<string, TaskEmployer[]>>(() => {
  return filteredRows.value.reduce((acc: any, task: TaskEmployer) => {
    const dateKey = new Date(task.createdAt).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});
});

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(2025);

let monthNames: any = ref({
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

const filteredRows = ref(
  tasks.value.filter((row: TaskEmployer) => {
    let rowDate: Date = new Date(row.createdAt);
    return (
      rowDate.getMonth() + 1 === selectedMonth.value &&
      rowDate.getFullYear() === selectedYear.value
    );
  })
);

let returnRows = ref<Array<TaskEmployer>>([]);
function updateCurrentPageData() {
  returnRows.value = tasks.value;
  filteredRows.value = returnRows.value?.filter((row: TaskEmployer) => {
    let rowDate: Date = new Date(row.createdAt);
    return (
      rowDate.getMonth() + 1 === selectedMonth.value &&
      rowDate.getFullYear() === selectedYear.value &&
      user.value.PVZ.includes(row.user.pvz)
    );
  });

  temp.value = filteredRows.value.filter((row) => row.isCompleted).length;
}

watch(() => selectedMonth.value, watchSelectedMonth);

const temp = ref(0);

const color = computed(() => {
  switch (true) {
    case temp.value === 0:
      return "red";
    case temp.value < filteredRows.value.length:
      return "amber";
    case temp.value === filteredRows.value.length:
      return "green";
    default:
      return "blue";
  }
});

const isOpenModal = ref(false);
const isOpenModalEdit = ref(false);
const isOpenModalDelete = ref(false);

function openModal(task: TaskEmployer) {
  isOpenModal.value = true;
  isOpenModalEdit.value = false;

  if (task.id) {
    taskData.value = JSON.parse(JSON.stringify(task));
    taskData.value.createdAt = storeUsers.getISODate(
      new Date(taskData.value.createdAt)
    );
    taskData.value.repeatUntil = storeUsers.getISODate(
      new Date(taskData.value.repeatUntil)
    );
  } else {
    taskData.value = {} as TaskEmployer;
    taskData.value.createdAt = storeUsers.getISODate(new Date());
    taskData.value.repeatType = "none";
  }
}

function closeModal() {
  isOpenModal.value = false;
  isOpenModalEdit.value = false;
  isOpenModalDelete.value = false;
  taskData.value = {} as TaskEmployer;
  chooseEmployers.value = "Одному";
  clearIds();
}

function openModalEdit() {
  isOpenModal.value = false;
  isOpenModalEdit.value = true;
}

function closeModalEdit() {
  isOpenModal.value = true;
  isOpenModalEdit.value = false;
}

function openModalDelete(task: TaskEmployer) {
  isOpenModal.value = false;
  isOpenModalDelete.value = true;
  taskData.value = task;
}

function closeModalDelete() {
  isOpenModalDelete.value = false;
}

const typeSelectedTasks = ref(1);
async function updateTask() {
  isLoading.value = true;

  taskData.value.createdAt = storeUsers.getISODateTime(
    new Date(taskData.value.createdAt)
  );

  if (taskData.value.repeatUntil) {
    taskData.value.repeatUntil = storeUsers.getISODateTime(
      new Date(taskData.value.repeatUntil)
    );
  }

  await storeTasksEmployer.updateTask(taskData.value, typeSelectedTasks.value);
  tasks.value = await storeTasksEmployer.getTasks();

  updateCurrentPageData();
  closeModal();

  isLoading.value = false;
}

async function deleteTask() {
  isLoading.value = true;

  await storeTasksEmployer.deleteTask(
    taskData.value.id,
    typeSelectedTasks.value
  );
  tasks.value = await storeTasksEmployer.getTasks();

  updateCurrentPageData();
  closeModal();

  isLoading.value = false;
}

function editRecurringFlag() {
  if (taskData.value.repeatType !== "none") {
    taskData.value.recurringFlag = "endless";
    taskData.value.repeatUntil = storeUsers.getISODate(
      new Date(taskData.value.createdAt).setDate(
        new Date(taskData.value.createdAt).getDate() + 1
      )
    );
    switch (taskData.value.repeatType) {
      case "daily":
        taskData.value.repeatUntil = storeUsers.getISODate(
          new Date(
            new Date(taskData.value.createdAt).setDate(
              new Date(taskData.value.createdAt).getDate() + 1
            )
          )
        );
        break;
      case "weekly":
        taskData.value.repeatUntil = storeUsers.getISODate(
          new Date(
            new Date(taskData.value.createdAt).setDate(
              new Date(taskData.value.createdAt).getDate() + 7
            )
          )
        );
        break;
      case "monthly":
        const createdAt = new Date(taskData.value.createdAt);
        const nextMonth = new Date(createdAt);
        nextMonth.setMonth(createdAt.getMonth() + 1);

        if (nextMonth.getDate() !== createdAt.getDate()) {
          nextMonth.setDate(0);
        }

        taskData.value.repeatUntil = storeUsers.getISODate(nextMonth);
        break;
      case "yearly":
        taskData.value.repeatUntil = storeUsers.getISODate(
          new Date(
            new Date(taskData.value.createdAt).setFullYear(
              new Date(taskData.value.createdAt).getFullYear() + 1
            )
          )
        );
        break;
      default:
        break;
    }
  } else {
    taskData.value.repeatUntil = "";
    taskData.value.recurringFlag = "none";
  }
}

const chooseEmployers = ref("Одному");

const items = [
  {
    label: "Повтор задачи",
    icon: "mdi:repeat-variant",
    defaultOpen: false,
    slot: "repeat",
  },
];

function clearIds() {
  delete taskData.value.userId;
  taskData.value.usersId = [];
  choosePVZ.value = [];
}

function handleChangeMonth(newMonth: number, newYear: number) {
  selectedMonth.value = newMonth;
  selectedYear.value = newYear;
  updateCurrentPageData();
}

const choosePVZ = ref<Array<any>>([]);

definePageMeta({
  layout: false,
  name: "Задачи сотрудников",
});
</script>

<template>
  <Head>
    <Title>Задачи сотрудников</Title>
  </Head>

  <div v-if="user.role === 'ADMIN'">
    <NuxtLayout name="table-admin-no-pad">
      <div v-if="!isLoading" class="w-screen p-5 max-sm:p-3">
        <UButton
          v-if="user.role !== 'pvzEmployer'"
          class="font-semibold"
          @click="openModal"
          >Создать задачу</UButton
        >

        <DateNavigator
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          @changeMonth="handleChangeMonth"
        />

        <!-- Прогресс выполнения -->
        <UProgress
          class="mt-2"
          :value="temp"
          :max="filteredRows.length"
          :color="color"
        >
          <template #indicator="{ percent }">
            <div class="text-right" :style="{ width: `${percent}%` }">
              <span v-if="temp === 0" class="text-red-500"
                >0/{{ filteredRows.length }}</span
              >
              <span
                v-else-if="temp < filteredRows.length"
                class="text-amber-500"
              >
                {{ temp }}/{{ filteredRows.length }}
              </span>
              <span
                v-else-if="temp === filteredRows.length"
                class="text-green-500"
              >
                {{ temp }}/{{ filteredRows.length }}
              </span>
            </div>
          </template>
        </UProgress>

        <!-- Список задач -->
        <TaskEmployerList
          class="mt-5"
          :tasks="filteredRows"
          :user="user"
          @toggleCompletion="toggleTaskCompletion"
          @editTask="openModal"
          @deleteTask="openModalDelete"
        />

        <div v-if="!filteredRows.length">
          <h1 class="text-center my-5 text-2xl font-semibold">
            Задач на этот месяц не найдено.
          </h1>
        </div>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-model="isOpenModal"
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
                  Задача
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
              <div
                v-if="!taskData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Поставить задачу</h1>
                <select
                  v-model="chooseEmployers"
                  @change="clearIds"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
                >
                  <option value="Всем">Всем</option>
                  <option value="ПВЗ">ПВЗ</option>
                  <option value="Нескольким">Нескольким</option>
                  <option value="Одному">Одному</option>
                </select>
              </div>

              <div
                v-if="chooseEmployers === 'Нескольким' && !taskData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор доступных сотрудников</h1>
                <USelectMenu
                  v-if="users"
                  v-model="taskData.usersId"
                  searchable
                  searchable-placeholder="Поиск по имени..."
                  value-attribute="id"
                  option-attribute="name"
                  :options="
                    users.filter(
                      (userData) =>
                        userData.role === 'pvzEmployer' &&
                        user.PVZ.includes(userData.pvz)
                    )
                  "
                  multiple
                  placeholder="Выберите сотрудников"
                  class="w-full"
                />
              </div>

              <div
                v-if="chooseEmployers === 'Одному' && !taskData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор доступных сотрудников</h1>
                <USelectMenu
                  v-if="users"
                  v-model="taskData.userId"
                  searchable
                  searchable-placeholder="Поиск по имени..."
                  value-attribute="id"
                  option-attribute="name"
                  :options="
                    users.filter(
                      (userData) =>
                        userData.role === 'pvzEmployer' &&
                        user.PVZ.includes(userData.pvz)
                    )
                  "
                  placeholder="Выберите сотрудника"
                  class="w-full"
                />
              </div>

              <div
                v-if="chooseEmployers === 'ПВЗ' && !taskData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор ПВЗ</h1>
                <USelectMenu
                  v-if="pvz"
                  v-model="choosePVZ"
                  searchable
                  searchable-placeholder="Поиск по названию..."
                  value-attribute="name"
                  option-attribute="name"
                  multiple
                  :options="
                    pvz.filter((pvzData) => user.PVZ.includes(pvzData.name))
                  "
                  placeholder="Выберите ПВЗ"
                  class="w-full"
                />
              </div>

              <div class="flex items-start flex-col gap-3 mb-3">
                <h1>Название задачи</h1>
                <UInput v-model="taskData.title" class="w-full"></UInput>
              </div>

              <div class="flex items-start flex-col gap-3 mb-3">
                <div class="flex items-center gap-3">
                  <h1>Описание задачи</h1>
                  <UBadge
                    size="sm"
                    label="Необязательно"
                    color="yellow"
                    variant="subtle"
                  />
                </div>

                <UTextarea
                  v-model="taskData.description"
                  class="w-full"
                ></UTextarea>
              </div>

              <div class="flex items-start flex-col gap-3 mb-3">
                <h1>Дата задачи</h1>
                <input
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="taskData.createdAt"
                />
              </div>

              <UAccordion
                color="primary"
                variant="soft"
                size="sm"
                :items="items"
              >
                <template #repeat>
                  <div class="px-3 bg-gray-50 rounded-md py-3">
                    <div class="flex items-start flex-col gap-3 mb-3">
                      <h1>Повторение задачи</h1>
                      <select
                        @change="editRecurringFlag"
                        v-model="taskData.repeatType"
                        class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
                      >
                        <option value="none">Не повторяется</option>
                        <option value="daily">Каждый день</option>
                        <option value="weekly">Каждую неделю</option>
                        <option value="monthly">Каждый месяц</option>
                        <option value="yearly">Каждый год</option>
                      </select>
                    </div>

                    <div v-if="taskData.repeatType !== 'none'">
                      <div class="flex items-start flex-col gap-3 mb-3">
                        <h1>Повторить до</h1>
                        <input
                          type="date"
                          class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                          v-model="taskData.repeatUntil"
                        />
                      </div>

                      <div class="flex items-start flex-col gap-3 mb-3">
                        <h1>Заканчивается</h1>
                        <select
                          v-model="taskData.recurringFlag"
                          class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
                        >
                          <option value="endless">Никогда</option>
                          <option value="firstExecution">
                            После 1 выполнения
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </template>
              </UAccordion>
            </div>

            <div class="flex items-center justify-end gap-3 mt-3">
              <UButton
                v-if="!taskData.id"
                color="green"
                icon="material-symbols:add-task"
                @click="createTask"
                class="font-semibold duration-200"
                >Создать</UButton
              >
              <UButton
                v-if="taskData.id"
                color="green"
                icon="material-symbols:add-task"
                @click="openModalEdit"
                class="font-semibold duration-200"
                >Сохранить</UButton
              >
              <UButton
                @click="closeModal"
                class="font-semibold duration-200"
                color="red"
                icon="akar-icons:cross"
                >Отменить</UButton
              >
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-model="isOpenModalEdit"
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
                  Изменить задачу
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpenModalEdit = false"
                />
              </div>
            </template>
            <div class="flex flex-col gap-5">
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault01"
                  v-model="typeSelectedTasks"
                  :value="1"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault01"
                >
                  Только эту задачу
                </label>
              </div>
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault02"
                  v-model="typeSelectedTasks"
                  :value="2"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault02"
                >
                  Эту и последующие задачи
                </label>
              </div>
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault02"
                  v-model="typeSelectedTasks"
                  :value="3"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault02"
                >
                  Все задачи
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-3">
              <UButton
                v-if="taskData.id"
                color="green"
                icon="material-symbols:add-task"
                @click="updateTask"
                class="font-semibold duration-200"
                >Сохранить</UButton
              >
              <UButton
                @click="closeModalEdit"
                class="font-semibold duration-200"
                color="red"
                icon="akar-icons:cross"
                >Отменить</UButton
              >
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-model="isOpenModalDelete"
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
                  Удалить задачу
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpenModalDelete = false"
                />
              </div>
            </template>
            <div class="flex flex-col gap-5">
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault01"
                  v-model="typeSelectedTasks"
                  :value="1"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault01"
                >
                  Только эту задачу
                </label>
              </div>
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault02"
                  v-model="typeSelectedTasks"
                  :value="2"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault02"
                >
                  Эту и последующие задачи
                </label>
              </div>
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault02"
                  v-model="typeSelectedTasks"
                  :value="3"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault02"
                >
                  Все задачи
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-3">
              <UButton
                color="green"
                icon="material-symbols:delete-rounded"
                @click="deleteTask"
                class="font-semibold duration-200"
                >Удалить</UButton
              >
              <UButton
                @click="closeModalDelete"
                class="font-semibold duration-200"
                color="red"
                icon="akar-icons:cross"
                >Отменить</UButton
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
  <div v-else>
    <NuxtLayout name="table-user-no-pad">
      <div v-if="!isLoading" class="w-screen p-5 max-sm:p-3">
        <UButton
          v-if="user.role !== 'pvzEmployer'"
          class="font-semibold"
          @click="openModal"
          >Создать задачу</UButton
        >

        <DateNavigator
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          @changeMonth="handleChangeMonth"
        />

        <!-- Прогресс выполнения -->
        <UProgress
          class="mt-2"
          :value="temp"
          :max="filteredRows.length"
          :color="color"
        >
          <template #indicator="{ percent }">
            <div class="text-right" :style="{ width: `${percent}%` }">
              <span v-if="temp === 0" class="text-red-500"
                >0/{{ filteredRows.length }}</span
              >
              <span
                v-else-if="temp < filteredRows.length"
                class="text-amber-500"
              >
                {{ temp }}/{{ filteredRows.length }}
              </span>
              <span
                v-else-if="temp === filteredRows.length"
                class="text-green-500"
              >
                {{ temp }}/{{ filteredRows.length }}
              </span>
            </div>
          </template>
        </UProgress>

        <!-- Список задач -->
        <TaskEmployerList
          class="mt-5"
          :tasks="filteredRows"
          :user="user"
          @toggleCompletion="toggleTaskCompletion"
          @editTask="openModal"
          @deleteTask="openModalDelete"
        />

        <div v-if="!filteredRows.length">
          <h1 class="text-center my-5 text-2xl font-semibold">
            Задач на этот месяц не найдено.
          </h1>
        </div>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-model="isOpenModal"
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
                  Задача
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
              <div
                v-if="!taskData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Поставить задачу</h1>
                <select
                  v-model="chooseEmployers"
                  @change="clearIds"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
                >
                  <option value="Всем">Всем</option>
                  <option value="ПВЗ">ПВЗ</option>
                  <option value="Нескольким">Нескольким</option>
                  <option value="Одному">Одному</option>
                </select>
              </div>

              <div
                v-if="chooseEmployers === 'Нескольким' && !taskData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор доступных сотрудников</h1>
                <USelectMenu
                  v-if="users"
                  v-model="taskData.usersId"
                  searchable
                  searchable-placeholder="Поиск по имени..."
                  value-attribute="id"
                  option-attribute="name"
                  :options="
                    users.filter(
                      (userData) =>
                        userData.role === 'pvzEmployer' &&
                        user.PVZ.includes(userData.pvz)
                    )
                  "
                  multiple
                  placeholder="Выберите сотрудников"
                  class="w-full"
                />
              </div>

              <div
                v-if="chooseEmployers === 'Одному' && !taskData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор доступных сотрудников</h1>
                <USelectMenu
                  v-if="users"
                  v-model="taskData.userId"
                  searchable
                  searchable-placeholder="Поиск по имени..."
                  value-attribute="id"
                  option-attribute="name"
                  :options="
                    users.filter(
                      (userData) =>
                        userData.role === 'pvzEmployer' &&
                        user.PVZ.includes(userData.pvz)
                    )
                  "
                  placeholder="Выберите сотрудника"
                  class="w-full"
                />
              </div>

              <div
                v-if="chooseEmployers === 'ПВЗ' && !taskData.id"
                class="flex items-start flex-col gap-3 mb-3"
              >
                <h1>Выбор ПВЗ</h1>
                <USelectMenu
                  v-if="pvz"
                  v-model="choosePVZ"
                  searchable
                  searchable-placeholder="Поиск по названию..."
                  value-attribute="name"
                  option-attribute="name"
                  multiple
                  :options="
                    pvz.filter((pvzData) => user.PVZ.includes(pvzData.name))
                  "
                  placeholder="Выберите ПВЗ"
                  class="w-full"
                />
              </div>

              <div class="flex items-start flex-col gap-3 mb-3">
                <h1>Название задачи</h1>
                <UInput v-model="taskData.title" class="w-full"></UInput>
              </div>

              <div class="flex items-start flex-col gap-3 mb-3">
                <div class="flex items-center gap-3">
                  <h1>Описание задачи</h1>
                  <UBadge
                    size="sm"
                    label="Необязательно"
                    color="yellow"
                    variant="subtle"
                  />
                </div>

                <UTextarea
                  v-model="taskData.description"
                  class="w-full"
                ></UTextarea>
              </div>

              <div class="flex items-start flex-col gap-3 mb-3">
                <h1>Дата задачи</h1>
                <input
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="taskData.createdAt"
                />
              </div>

              <UAccordion
                color="primary"
                variant="soft"
                size="sm"
                :items="items"
              >
                <template #repeat>
                  <div class="px-3 bg-gray-50 rounded-md py-3">
                    <div class="flex items-start flex-col gap-3 mb-3">
                      <h1>Повторение задачи</h1>
                      <select
                        @change="editRecurringFlag"
                        v-model="taskData.repeatType"
                        class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
                      >
                        <option value="none">Не повторяется</option>
                        <option value="daily">Каждый день</option>
                        <option value="weekly">Каждую неделю</option>
                        <option value="monthly">Каждый месяц</option>
                        <option value="yearly">Каждый год</option>
                      </select>
                    </div>

                    <div v-if="taskData.repeatType !== 'none'">
                      <div class="flex items-start flex-col gap-3 mb-3">
                        <h1>Повторить до</h1>
                        <input
                          type="date"
                          class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                          v-model="taskData.repeatUntil"
                        />
                      </div>

                      <div class="flex items-start flex-col gap-3 mb-3">
                        <h1>Заканчивается</h1>
                        <select
                          v-model="taskData.recurringFlag"
                          class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-select rounded-md text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
                        >
                          <option value="endless">Никогда</option>
                          <option value="firstExecution">
                            После 1 выполнения
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </template>
              </UAccordion>
            </div>

            <div class="flex items-center justify-end gap-3 mt-3">
              <UButton
                v-if="!taskData.id"
                color="green"
                icon="material-symbols:add-task"
                @click="createTask"
                class="font-semibold duration-200"
                >Создать</UButton
              >
              <UButton
                v-if="taskData.id"
                color="green"
                icon="material-symbols:add-task"
                @click="openModalEdit"
                class="font-semibold duration-200"
                >Сохранить</UButton
              >
              <UButton
                @click="closeModal"
                class="font-semibold duration-200"
                color="red"
                icon="akar-icons:cross"
                >Отменить</UButton
              >
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-model="isOpenModalEdit"
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
                  Изменить задачу
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpenModalEdit = false"
                />
              </div>
            </template>
            <div class="flex flex-col gap-5">
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault01"
                  v-model="typeSelectedTasks"
                  :value="1"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault01"
                >
                  Только эту задачу
                </label>
              </div>
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault02"
                  v-model="typeSelectedTasks"
                  :value="2"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault02"
                >
                  Эту и последующие задачи
                </label>
              </div>
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault02"
                  v-model="typeSelectedTasks"
                  :value="3"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault02"
                >
                  Все задачи
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-3">
              <UButton
                v-if="taskData.id"
                color="green"
                icon="material-symbols:add-task"
                @click="updateTask"
                class="font-semibold duration-200"
                >Сохранить</UButton
              >
              <UButton
                @click="closeModalEdit"
                class="font-semibold duration-200"
                color="red"
                icon="akar-icons:cross"
                >Отменить</UButton
              >
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-model="isOpenModalDelete"
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
                  Удалить задачу
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpenModalDelete = false"
                />
              </div>
            </template>
            <div class="flex flex-col gap-5">
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault01"
                  v-model="typeSelectedTasks"
                  :value="1"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault01"
                >
                  Только эту задачу
                </label>
              </div>
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault02"
                  v-model="typeSelectedTasks"
                  :value="2"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault02"
                >
                  Эту и последующие задачи
                </label>
              </div>
              <div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
                <input
                  class="relative float-left -ms-[1.5rem] me-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] rtl:float-right dark:border-neutral-400 dark:checked:border-primary"
                  type="radio"
                  name="flexRadioDefault"
                  id="radioDefault02"
                  v-model="typeSelectedTasks"
                  :value="3"
                />
                <label
                  class="mt-px inline-block ps-[0.15rem] hover:cursor-pointer"
                  for="radioDefault02"
                >
                  Все задачи
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-3">
              <UButton
                color="green"
                icon="material-symbols:delete-rounded"
                @click="deleteTask"
                class="font-semibold duration-200"
                >Удалить</UButton
              >
              <UButton
                @click="closeModalDelete"
                class="font-semibold duration-200"
                color="red"
                icon="akar-icons:cross"
                >Отменить</UButton
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

<style>
@keyframes strike {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
.strike {
  position: relative;
}
.strike::after {
  content: " ";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: black;
  animation-name: strike;
  animation-duration: 0.5s;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}
</style>
