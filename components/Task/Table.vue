<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();
import { useToast } from "vue-toastification";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fomoljxhkywsdgnchewy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW9sanhoa3l3c2RnbmNoZXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1ODMwMTksImV4cCI6MjAzOTE1OTAxOX0.ItZhBr3_OBP0nii6RX-jy9Q7hu2qvNQ2UBVZNJyZDFs"
);

const toast = useToast();

const emit = defineEmits([
  "deleteRow",
  "openModal",
  "updateStatus",
  "updateRowForImg",
]);

function updateRowForImg(row: Task) {
  emit("updateRowForImg", { row });
}

function updateStatus(row: Task, flag: string, username: string) {
  emit("updateStatus", { row, flag, username });
}

const storeTasks = useTasksStore();

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<Task[]> },
});

onMounted(() => {
  updateCurrentPageData();

  if (props.user.role !== "ADMIN") {
    columns.splice(0, 1);
    columns.splice(2, 1);
  }
});

let returnRows = ref<Array<Task>>();

function updateCurrentPageData() {
  returnRows.value = props.rows;

  if (showDeletedRows.value) {
    returnRows.value = props.rows;
  } else {
    returnRows.value = props.rows?.filter((row) => !row.deleted);
  }
}

const totalRows = computed(() => Math.ceil(props.rows?.length || 0));
watch([props.rows, totalRows, props.user], updateCurrentPageData);

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function openModal(row: Task) {
  emit("openModal", row);
}

let columns = [
  {
    key: "actions",
  },
  {
    key: "created_at",
    label: "Дата создания",
  },
  {
    key: "description",
    label: "Задача",
  },
  {
    key: "responsible",
    label: "Ответственный",
  },
  {
    key: "deadline",
    label: "Выполнить до",
  },
  {
    key: "notation",
    label: "Комментарий",
  },
  {
    key: "done-check",
    label: "Выполнено",
  },
  {
    key: "supportingDocuments",
    label: "Фотоотчет",
  },
  {
    key: "checked-check",
    label: "Проверено",
  },
  {
    key: "done",
    label: "Дата выполнения",
  },
  {
    key: "refinement",
    label: "Дата доработки",
  },
  {
    key: "checked",
    label: "Дата принятия",
  },
  {
    key: "createdUser",
    label: "Кем создано",
  },
  {
    key: "checkedUser",
    label: "Кем принято",
  },
];

const items = (row: Task) => [
  [
    {
      label: "Изменить",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => openModal(row),
    },
  ],
  [
    {
      label: "Удалить",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteRow(row.id),
    },
  ],
];

const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};

let arrayWithModifiedRows = ref<Array<Task>>([]);
async function getRowByIdFromInput(row: Task) {
  arrayWithModifiedRows.value.push(row);
  arrayWithModifiedRows.value = [...new Set(arrayWithModifiedRows.value)];
  await storeTasks.updateTasks(arrayWithModifiedRows.value);
}

const rowData = ref({} as Task);
function attachPhoto(row: Task) {
  rowData.value = row;
  isShowAttachPhoto.value = true;
}

const isShowAttachPhoto = ref(false);

function uploadQRFile(e: Event) {
  handleFileUpload(e);
}

let fileQRPhoto = ref({} as any);

function clearQRPhoto() {
  rowData.value.img = "";
  fileQRPhoto.value = {};
}

function handleFileUpload(e: any) {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);

  let fileName = e[0].name;
  if (fileName.includes(".mp4") || fileName.includes(".mov")) {
    toast.error("Вставьте скриншот, а не файл видео-формата!");
  } else {
    rowData.value.img = `${randomDigits}-${fileName}`;
    fileQRPhoto.value = e[0];
  }
}

async function handleFile(bucketName: string, file: any) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(`img-${rowData.value.img}`, file);
}

async function sendImgs() {
  const filePromises = [handleFile("tasks", fileQRPhoto.value)];
  await Promise.all(filePromises);
  rowData.value.supportingDocuments?.push(rowData.value.img);
  updateRowForImg(rowData.value);
}

const showDeletedRows = ref(false);

const toggleShowDeletedRows = () => {
  showDeletedRows.value = !showDeletedRows.value;
  updateCurrentPageData();
};
</script>

<template>
  <div>
    <div v-if="user.role === 'ADMIN'" class="flex items-center gap-5 mt-5">
      <div
        v-if="!showDeletedRows"
        v-auto-animate
        @click="toggleShowDeletedRows"
        class="flex items-center gap-2 w-[220px] bg-green-100 text-green-500 px-2 py-1 font-bold cursor-pointer duration-200 hover:opacity-50 rounded-xl"
      >
        <Icon name="fluent:eye-show-16-filled" size="24" />
        <h1>Показать удаленное</h1>
      </div>
      <div
        v-if="showDeletedRows"
        v-auto-animate
        @click="toggleShowDeletedRows"
        class="flex items-center gap-2 w-[220px] bg-red-100 text-red-500 px-2 py-1 font-bold cursor-pointer duration-200 hover:opacity-50 rounded-xl"
      >
        <Icon name="fluent:eye-hide-20-filled" size="24" />
        <h1>Скрыть удаленное</h1>
      </div>
    </div>
  </div>
  <UTable
    class="w-full mx-auto text-center bg-white border-[1px] rounded-md mt-5 max-h-[390px]"
    :ui="{
  td: {
    base: 'border-r-[1px] border-b-[1px] text-center whitespace-normal',
    padding: 'px-3 py-2',
  },
  th: {
    base: 'text-center uppercase sticky top-0 z-[20] bg-white',
    padding: 'px-1',
    size: 'text-xs'
  },
  default:
  {
    checkbox:
      { color: 'gray' as any }
  },
    }"
    :rows="returnRows"
    :columns="columns"
    sort-asc-icon="i-heroicons-arrow-up"
    sort-desc-icon="i-heroicons-arrow-down"
  >
    <template #created_at-data="{ row }">
      <p>
        {{ storeUsers.getNormalizedDate(row.created_at) }}
      </p>
    </template>

    <template #deadline-data="{ row }">
      <p>
        {{ storeUsers.getNormalizedDateWithoutTime(row.deadline) }}
      </p>
    </template>

    <template #responsible-data="{ row }">
      <p>
        {{ row.responsible }}
      </p>
    </template>

    <template #notation-data="{ row }">
      <input
        :disabled="
          user.username !== row.createdUser && user.username !== row.responsible
        "
        autoresize
        @blur="getRowByIdFromInput(row)"
        v-model="row.notation"
        class="min-w-[170px] w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
      />
      <span class="hidden">{{ row.notation }} </span>
    </template>

    <template #done-check-data="{ row }">
      <Icon
        @click="updateStatus(row, 'done', user.username)"
        v-if="!row.done && user.username === row.responsible"
        class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle"
        size="32"
      />
      <UBadge
        v-if="!row.done && user.username !== row.responsible"
        size="xs"
        label="Не выполнено"
        color="red"
        variant="subtle"
      />
      <UBadge
        v-if="row.done"
        size="xs"
        label="Выполнено"
        color="emerald"
        variant="subtle"
      />
    </template>

    <template #supportingDocuments-data="{ row }">
      <div
        v-if="row.supportingDocuments.length > 0"
        class="mb-1"
        v-for="(link, index) in row.supportingDocuments"
      >
        <a
          target="_blank"
          class="text-secondary-color underline hover:opacity-60 duration-200 font-bold"
          :href="`https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/tasks/img-${link}`"
        >
          Фото {{ index + 1 }}
        </a>
      </div>
      <div v-else></div>
      <Icon
        v-if="user.username === row.responsible"
        @click="attachPhoto(row)"
        class="cursor-pointer hover:opacity-50 bg-secondary-color duration-200"
        name="material-symbols:add-photo-alternate-outline-rounded"
        size="32"
      />
    </template>

    <template #checked-check-data="{ row }">
      <div
        v-if="
          (user.username === 'Директор' ||
            user.username === 'Власенкова' ||
            user.username === 'Горцуева') &&
          row.done &&
          !row.checked
        "
        class="flex items-center flex-col gap-1"
      >
        <UButton
          @click="updateStatus(row, 'check', user.username)"
          color="green"
          icon="mdi:checkbox-multiple-marked-circle"
        >
        </UButton>
        <UButton
          @click="updateStatus(row, 'refinement', user.username)"
          color="red"
          icon="jam:wrench-f"
        >
        </UButton>
      </div>

      <UBadge
        v-if="row.done && row.checked"
        size="xs"
        label="Проверено"
        color="emerald"
        variant="subtle"
      />

      <UBadge
        v-if="
          user.username !== 'Директор' &&
          user.username !== 'Власенкова' &&
          user.username !== 'Горцуева' &&
          row.done &&
          !row.checked
        "
        size="xs"
        label="На проверке"
        color="orange"
        variant="subtle"
      />
    </template>

    <template #done-data="{ row }">
      <p>
        {{ storeUsers.getNormalizedDate(row.done) }}
      </p>
    </template>

    <template #refinement-data="{ row }">
      <p>
        {{ storeUsers.getNormalizedDate(row.refinement) }}
      </p>
    </template>

    <template #checked-data="{ row }">
      <p>
        {{ storeUsers.getNormalizedDate(row.checked) }}
      </p>
    </template>

    <template #actions-data="{ row }">
      <UDropdown
        v-if="
          user.username === 'Директор' ||
          user.username === 'Власенкова' ||
          user.username === 'Горцуева'
        "
        :open="dropdownStates[row.id]"
        :items="items(row)"
      >
        <UButton
          variant="ghost"
          color="gray"
          class="text-sm duration-200"
          @touchstart.stop="toggleDropdown(row.id)"
        >
          ...
        </UButton>
      </UDropdown>
    </template>
  </UTable>

  <UModal
    :ui="{
      container: 'flex items-center justify-center text-center',
    }"
    v-auto-animate
    v-model="isShowAttachPhoto"
    prevent-close
  >
    <UCard
      v-auto-animate
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
            Прикрепить фото
          </h3>
          <Icon
            @click="isShowAttachPhoto = !isShowAttachPhoto"
            name="i-heroicons-x-mark-20-solid"
            size="24"
            class="cursor-pointer hover:text-secondary-color duration-200"
          />
        </div>
      </template>
      <div class="text-center">
        <div v-if="!rowData.img">
          <UInput
            @change="uploadQRFile"
            class="w-full mt-3"
            type="file"
            color="gray"
            variant="outline"
            size="sm"
            icon="i-heroicons-folder"
            accept="image/*"
          />
        </div>
        <div
          v-else
          class="flex items-center justify-between gap-3 relative w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 file:font-medium file:text-gray-500 dark:file:text-gray-400 file:bg-transparent file:border-0 file:p-0 file:outline-none text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 mt-3"
        >
          <div class="flex items-center gap-3">
            <Icon
              name="icon-park-solid:folder-success"
              size="24"
              class="text-green-500"
            />
            <h1>Файл загружен</h1>
          </div>
          <div class="flex justify-end">
            <UButton
              v-if="rowData.img"
              @click="clearQRPhoto"
              class="font-bold"
              size="xs"
              color="red"
            >
              <template #trailing>
                <UIcon name="bitcoin-icons:cross-filled" class="w-4 h-4" />
              </template>
            </UButton>
          </div>
        </div>
        <UButton
          :disabled="!rowData.img"
          class="mt-5 font-semibold uppercase"
          @click="sendImgs"
          >Отправить фото</UButton
        >
      </div>
    </UCard>
  </UModal>
</template>
