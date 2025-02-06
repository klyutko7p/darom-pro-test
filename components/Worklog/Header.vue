<!-- File: components/WorklogHeader.vue -->
<script lang="ts" setup>
interface Props {
  user: any;
  selectedMonth: number;
  selectedYear: number;
  monthNames: Record<number, string>;
}
const props = defineProps<Props>();
</script>

<template>
  <div class="flex items-center justify-between px-5 mt-10">
    <!-- Кнопки для admin -->
    <div class="flex items-center gap-3">
      <UButton
        v-if="user.role === 'ADMIN'"
        @click="$emit('createRecord')"
        icon="mdi:table-column-plus-after"
        class="font-semibold"
      >
        Создать запись
      </UButton>
      <UButton
        v-if="user.role === 'ADMIN'"
        @click="$emit('createWorklogMonth')"
        icon="material-symbols:table-view-outline"
        class="font-semibold"
      >
        Создать табель
      </UButton>
    </div>

    <div>
      <UTooltip
        text="Скачать EXCEL"
        :shortcuts="['xlsx']"
        :popper="{ placement: 'right' }"
      >
        <div
          class="bg-secondary-color cursor-pointer border-[1px] border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
          @click="$emit('exportExcel')"
        >
          <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
        </div>
      </UTooltip>
    </div>
  </div>
  <div class="flex items-center justify-between px-5 pt-10">
    <h1 class="text-2xl max-sm:text-xl font-semibold">
      {{ monthNames[selectedMonth] }}, {{ selectedYear }} г.
    </h1>
    <div class="flex items-center gap-1">
      <div
        @click="$emit('prevMonth')"
        class="bg-secondary-color cursor-pointer duration-200 hover:opacity-50 text-white pt-1 rounded-full px-1"
      >
        <Icon name="material-symbols:chevron-left" size="24" />
      </div>
      <div
        @click="$emit('nextMonth')"
        class="bg-secondary-color cursor-pointer duration-200 hover:opacity-50 text-white pt-1 rounded-full px-1"
      >
        <Icon name="material-symbols:chevron-right" size="24" />
      </div>
    </div>
  </div>
</template>