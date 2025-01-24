<script setup lang="ts">
const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  boxes: { type: Array as PropType<Box[]>, required: true },
});

let returnRows = ref<Array<Box>>([]);

onMounted(async () => {
  isLoading.value = true;
  returnRows.value = props.boxes;
  isLoading.value = false;
});

let isLoading = ref(false);

let columns = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "status",
    label: "Статус",
  },
  {
    key: "idRows",
    label: "Количество товаров (шт.)",
    sortable: true,
  },
];
</script>

<template>
  <div v-if="!isLoading">
    <div class="mt-5 mb-10">
      <h1 class="text-base">
        Количество:
        <span class="text-secondary-color font-semibold"
          >{{ returnRows.length }} шт.</span
        >
      </h1>
      <UTable
        class="w-full z-[20] mx-auto text-center rounded-md mt-5"
        :ui="{ wrapper: 'relative bg-white',
  td: {
    base: 'border-[1px] text-center whitespace-normal',
    padding: 'px-3 py-1',
  },
  th: {
    base: 'text-center uppercase border-[1px] sticky top-0 z-[20] bg-white',
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
      >
        <template #id-data="{ row }">
          <h1>{{ row.id }}</h1>
        </template>

        <template #status-data="{ row }">
          <UBadge
            v-if="!row.sorted && !row.delivered"
            size="xs"
            label="На сортировщице"
            color="yellow"
            variant="subtle"
            class="w-[115px]"
          />
          <UBadge
            v-if="row.sorted && !row.delivered"
            size="xs"
            label="На курьере"
            color="yellow"
            variant="subtle"
            class="w-[115px] justify-center"
          />
          <UBadge
            v-if="row.sorted && row.delivered"
            size="xs"
            label="Доставлен"
            color="emerald"
            variant="subtle"
          />
        </template>

        <template #idRows-data="{ row }">
          <p v-if="row.type === 'KGT'">
            {{ row.idRows.length }}
          </p>
          <p v-else>-</p>
        </template>
      </UTable>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinnerModal />
      <h1 class="text-center italic">Идёт загрузка данных...</h1>
    </NuxtLayout>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}

.path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  &.circle {
    -webkit-animation: dash 1.8s ease-in-out; /* Увеличено до 1.8s */
    animation: dash 1.8s ease-in-out; /* Увеличено до 1.8s */
  }
  &.line {
    stroke-dashoffset: 1000;
    -webkit-animation: dash 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
    animation: dash 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
  }
  &.check {
    stroke-dashoffset: -100;
    -webkit-animation: dash-check 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
    animation: dash-check 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
  }
}

@-webkit-keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@-webkit-keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}

@keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}
</style>
