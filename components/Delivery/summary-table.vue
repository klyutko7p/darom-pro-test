<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IDelivery[]> },
});

onMounted(() => {
  updateCurrentPageData();
});
let selectedUser = ref("Все");
const totalRows = computed(() => Math.ceil(props.rows?.length));
let returnRows = ref<Array<IDelivery>>();

function updateCurrentPageData() {
  getWeekdays();

  if (selectedUser.value !== "Все") {
    returnRows.value = props.rows
      ?.filter((row) => {
        if (row.paid !== null) {
          const paidDate = new Date(row.paid);
          const paidMonth = paidDate.getMonth();
          return row.name === selectedUser.value && paidMonth === month.value - 1;
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(a.paid);
        const dateB = new Date(b.paid);
        return dateA - dateB;
      });
  } else {
    returnRows.value = props.rows
      ?.filter((row) => {
        if (row.paid !== null) {
          const paidDate = new Date(row.paid);
          const paidMonth = paidDate.getMonth();
          return paidMonth === month.value - 1;
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(a.paid);
        const dateB = new Date(b.paid);
        return dateA - dateB;
      });
  }
}

function getFilterByDay(row: IDelivery, day: number): boolean {
  const paidDate = new Date(row.paid);
  const rowDate = new Date(
    paidDate.getFullYear(),
    paidDate.getMonth(),
    paidDate.getDate()
  );
  const targetDate = new Date(paidDate.getFullYear(), paidDate.getMonth(), day);

  return rowDate.getTime() === targetDate.getTime();
}

function getDeliveryAmount(rows: IDelivery[]) {
  return rows
    .filter((row) => row.nameOfAction === "Доставка")
    .reduce((acc, currentValue) => acc + currentValue.purchaseOfGoods, 0);
}

function getSortirovkaAmount(rows: IDelivery[]) {
  return rows
    .filter((row) => row.nameOfAction === "Сортировка")
    .reduce((acc, currentValue) => acc + currentValue.purchaseOfGoods, 0);
}

interface DayInfo {
  date: number;
  dayOfWeek: string;
}

const arrayOfDays: Ref<DayInfo[]> = ref([]);

function getWeekdays() {
  const days: DayInfo[] = [];
  for (let day = 1; day <= 31; day++) {
    const currentDate = new Date(2024, +month.value - 1, day);
    if (currentDate.getMonth() === +month.value - 1) {
      days.push({
        date: day,
        dayOfWeek: getDayOfWeek(currentDate.getDay()),
      });
    } else {
      break;
    }
  }
  arrayOfDays.value = days;

  const daysMap = {};

  arrayOfDays.value.forEach((day) => {
    const { dayOfWeek } = day;
    if (!daysMap[dayOfWeek]) {
      daysMap[dayOfWeek] = [];
    }
    daysMap[dayOfWeek].push(day);
  });

  let nullAdded = false;
  Object.keys(daysMap).forEach((dayOfWeek) => {
    const dayArray = daysMap[dayOfWeek];
    const missingCount = 5 - dayArray.length;
    if (missingCount > 0) {
      for (let i = 0; i < missingCount; i++) {
        if (+month.value === 3) {
          dayArray.unshift({ date: null, dayOfWeek });
        } else if (+month.value === 1) {
          dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 2) {
          if (dayOfWeek === "понедельник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "вторник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "среда") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "пятница") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "суббота") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "воскресенье") dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 4) {
          if (dayOfWeek === "среда") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "четверг") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "пятница") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "суббота") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "воскресенье") dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 5) {
          if (dayOfWeek === "понедельник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "вторник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "среда") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "четверг") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "пятница") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "суббота") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "воскресенье") dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 6) {
          if (dayOfWeek === "понедельник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "вторник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "среда") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "четверг") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "пятница") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "суббота") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "воскресенье") dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 7) {
          if (dayOfWeek === "четверг") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "пятница") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "суббота") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "воскресенье") dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 8) {
          if (dayOfWeek === "понедельник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "вторник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "среда") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "воскресенье") dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 9) {
        } else if (+month.value === 10) {
          if (dayOfWeek === "понедельник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "пятница") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "суббота") dayArray.push({ date: null, dayOfWeek });
          if (dayOfWeek === "воскресенье") dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 11) {
          if (dayOfWeek === "понедельник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "вторник") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "среда") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "четверг") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "пятница") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "суббота") dayArray.unshift({ date: null, dayOfWeek });
          if (dayOfWeek === "воскресенье") dayArray.push({ date: null, dayOfWeek });
        } else if (+month.value === 12) {
        }
      }
    }

    if (+month.value === 12) {
      if (dayOfWeek === "понедельник") dayArray.unshift({ date: null, dayOfWeek });
      if (dayOfWeek === "вторник") dayArray.unshift({ date: null, dayOfWeek });
    }

    if (+month.value === 9) {
      if (dayOfWeek === "понедельник") dayArray.unshift({ date: null, dayOfWeek });
    }
  });

  const resultArray = Object.values(daysMap).flatMap((dayArray) => dayArray);
  arrayOfDays.value = resultArray;
}

function getDayOfWeek(dayOfWeek: number): string {
  const weekdays = [
    "воскресенье",
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
  ];
  return weekdays[dayOfWeek];
}

const weekdays = [
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
  "воскресенье",
];

let showFilters = ref(false);
let months = ref([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2]);
let monthNames: any = ref({
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
  1: "Январь",
  2: "Февраль",
});
let month = ref(new Date().getMonth() + 1);

function filterRows(monthData: number) {
  month.value = monthData;
}

watch(
  [props.rows, totalRows, props.user, returnRows.value, selectedUser.value, month.value],
  updateCurrentPageData
);
</script>
<template>
  <select
    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 mt-10 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400 mb-3"
    v-model="selectedUser"
    @change="updateCurrentPageData"
  >
    <option value="Все">Все клиенты</option>
    <option value="Рыбкин Артем">Рыбкин Артем</option>
    <option value="Жалин Владислав">Жалин Владислав</option>
    <option value="Стиба Анна">Стиба Анна</option>
    <option value="Череватенко Валерий">Череватенко Валерий</option>
    <option value="Харабадот Михаил">Харабадот Михаил</option>
    <option value="Барбул Виктор">Барбул Виктор</option>
    <option value="Гагач Сергей">Гагач Сергей</option>
    <option value="Лукьянченко Александр">Лукьянченко Александр</option>
    <option value="Рожко Константин">Рожко Константин</option>
  </select>

  <div class="mt-10 flex items-center gap-5">
    <span
      class="border-2 py-1 px-5 border-secondary-color hover:cursor-pointer hover:bg-secondary-color hover:text-white duration-200 rounded-full"
      @click="showFilters = !showFilters"
      >2024</span
    >
    <div
      v-if="showFilters"
      class="flex items-center w-full justify-between max-sm:items-start"
    >
      <select
        class="py-1 px-2 border-2 rounded-lg text-base border-secondary-color bg-secondary-color text-white font-bold"
        v-model="month"
        @change="filterRows(month), getWeekdays(), updateCurrentPageData()"
      >
        <option v-for="(monthName, monthNumber) in monthNames" :value="monthNumber">
          {{ monthName }}
        </option>
      </select>
    </div>
  </div>

  <div class="relative max-h-[700px] max-w-[1200px] mx-auto mt-5 mb-10">
    <table id="theTable"
      class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
      >
        <tr>
          <th scope="col" class="border-2" v-for="(day, index) in weekdays" :key="index">
            {{ day }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="returnRows" class="border-2">
          <th v-for="item in weekdays" scope="row" class="border-2 min-w-[100px]">
            <h1
              class="text-left border-t-2 min-h-[70px]"
              v-for="day in arrayOfDays.filter((row) => row.dayOfWeek === item)"
            >
              <span class="text-xl text-black">{{ day.date }} </span>
              <br />
              <div v-if="day.date !== null">
                <span
                  v-if="
                    getDeliveryAmount(
                      returnRows.filter((row) => getFilterByDay(row, day.date))
                    ) > 0
                  "
                  >D =
                  {{
                    getDeliveryAmount(
                      returnRows.filter((row) => getFilterByDay(row, day.date))
                    )
                  }}</span
                >
                <br />
                <span
                  v-if="
                    getSortirovkaAmount(
                      returnRows.filter((row) => getFilterByDay(row, day.date))
                    ) > 0
                  "
                  >S =
                  {{
                    getSortirovkaAmount(
                      returnRows.filter((row) => getFilterByDay(row, day.date))
                    )
                  }}</span
                >
              </div>
            </h1>
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
