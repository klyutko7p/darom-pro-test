<template>
  <div class="flex items-center justify-between pt-10">
    <h1 class="text-3xl max-sm:text-xl font-semibold">
      {{ monthNames[currentMonth] }}, {{ currentYear }} г.
    </h1>
    <div class="flex items-center gap-1">
      <div
        @click="prevMonth"
        class="bg-secondary-color cursor-pointer duration-200 hover:opacity-50 text-white pt-1 rounded-full px-1"
      >
        <Icon name="material-symbols:chevron-left" size="24" />
      </div>
      <div
        @click="nextMonth"
        class="bg-secondary-color cursor-pointer duration-200 hover:opacity-50 text-white pt-1 rounded-full px-1"
      >
        <Icon name="material-symbols:chevron-right" size="24" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

interface Props {
  selectedMonth: number;
  selectedYear: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "changeMonth", month: number, year: number): void;
}>();

const monthNames: Record<number, string> = {
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
};

const currentMonth = ref(props.selectedMonth);
const currentYear = ref(props.selectedYear);

function nextMonth() {
  currentMonth.value++;
  if (currentMonth.value > 12) {
    currentMonth.value = 1;
    currentYear.value++;
  }
  emit("changeMonth", currentMonth.value, currentYear.value);
}

function prevMonth() {
  currentMonth.value--;
  if (currentMonth.value < 1) {
    currentMonth.value = 12;
    currentYear.value--;
  }
  emit("changeMonth", currentMonth.value, currentYear.value);
}

watch(
  () => props.selectedMonth,
  (newVal) => {
    currentMonth.value = newVal;
  }
);
watch(
  () => props.selectedYear,
  (newVal) => {
    currentYear.value = newVal;
  }
);
</script>
