<!-- File: components/TaskItem.vue -->
<script lang="ts" setup>
import { ref } from "vue";

interface Props {
  task: TaskEmployer;
  user: User;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "toggleCompletion", taskId: number, isCompleted: boolean): void;
  (e: "editTask", task: TaskEmployer): void;
  (e: "deleteTask", task: TaskEmployer): void;
}>();

const localTask = ref({ ...props.task });
const storeUsers = useUsersStore();

function toggleCompletion() {
  emit("toggleCompletion", props.task.id, localTask.value.isCompleted);
}

function editTask() {
  emit("editTask", props.task);
}

function deleteTask() {
  emit("deleteTask", props.task);
}

function getNormalizedDate(date: string) {
  return storeUsers.getNormalizedDate(date);
}
</script>


<template>
  <div class="flex items-center justify-between w-full">
    <div class="flex items-center gap-3">
      <div class="inline-flex items-center">
        <label class="flex items-center cursor-pointer relative">
          <input
            type="checkbox"
            v-model="localTask.isCompleted"
            @change="toggleCompletion"
            class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border bg-slate-200 border-slate-500 checked:bg-green-600 checked:border-green-600"
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
              />
            </svg>
          </span>
        </label>
      </div>
      <div class="inline-block">
        <h1 v-if="user.role !== 'pvzEmployer'" class="font-bold">
          {{ task.user.name }}, {{ task.user.pvz }}
        </h1>
        <span :class="{ strike: localTask.isCompleted }">{{ task.title }}</span>
        <br />
        <span
          v-if="task.description"
          class="italic text-sm"
          :class="{ strike: localTask.isCompleted }"
        >
          {{ task.description }}
        </span>
        <div class="italic mt-2" v-if="localTask.isCompleted && task.doneDate">
          {{ getNormalizedDate(task.doneDate) }}
        </div>
      </div>
    </div>

    <div v-if="user.role !== 'pvzEmployer'" class="flex items-center gap-3">
      <UButton @click="editTask" color="green" icon="mingcute:pencil-fill" />
      <UButton
        @click="deleteTask"
        color="red"
        icon="material-symbols:delete-rounded"
      />
    </div>
  </div>
</template>