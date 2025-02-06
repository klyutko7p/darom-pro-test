<!-- File: components/TaskList.vue -->
<template>
  <div
    class="bg-gray-50 rounded-md px-5 py-3"
    v-if="groupedTasks && Object.keys(groupedTasks).length"
  >
    <div
      v-for="(tasks, date) in groupedTasks"
      :key="date"
      class="flex flex-col gap-3"
    >
      <h2 class="text-lg font-bold mt-4">{{ date }}</h2>
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white border-[1px] duration-200 rounded flex p-4 max-sm:p-4 items-center"
        :class="{
          'border-green-600': task.isCompleted,
          'border-red-600 text-red-600':
            !task.isCompleted && new Date() > new Date(task.createdAt),
        }"
      >
        <TaskEmployerItem
          :task="task"
          :user="user"
          @toggleCompletion="onToggleCompletion"
          @editTask="onEditTask"
          @deleteTask="onDeleteTask"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  tasks: TaskEmployer[];
  user: User;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "toggleCompletion", taskId: number, isCompleted: boolean): void;
  (e: "editTask", task: TaskEmployer): void;
  (e: "deleteTask", task: TaskEmployer): void;
}>();

const groupedTasks = computed(() => {
  return props.tasks.reduce(
    (acc: Record<string, TaskEmployer[]>, task: TaskEmployer) => {
      const dateKey = new Date(task.createdAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    },
    {}
  );
});

function onToggleCompletion(taskId: number, isCompleted: boolean) {
  emit("toggleCompletion", taskId, isCompleted);
}
function onEditTask(task: TaskEmployer) {
  emit("editTask", task);
}
function onDeleteTask(task: TaskEmployer) {
  emit("deleteTask", task);
}
</script>
