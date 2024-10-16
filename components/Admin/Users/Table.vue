<script setup lang="ts">
import type { PropType } from "vue";

const storeUsers = useUsersStore();

const emit = defineEmits(["openModal", "deleteUser"]);

function openModal(user: User) {
  emit("openModal", user);
}

function deleteUser(username: string) {
  emit("deleteUser", username);
}

const props = defineProps({
  fields: { type: Array as PropType<String[]>, required: true },
  users: { type: Array as PropType<User[]> },
});

const columns = [
  {
    key: "username",
    label: "Имя пользователя",
  },
  {
    key: "role",
    label: "Роль",
  },
  {
    key: "PVZ",
    label: "Доступ к ПВЗ",
  },
  {
    key: "visibleSC",
    label: "СЦ",
  },
  {
    key: "visiblePVZ",
    label: "ПВЗ",
  },
  {
    key: "cell1",
    label: "Ячейка (Наш выкуп)",
  },
  {
    key: "cell2",
    label: "Ячейка (Выкуп клиента)",
  },
  {
    key: "additionally1",
    label: "дополнительно (наш выкуп)",
  },
  {
    key: "additionally2",
    label: "дополнительно (выкуп клиента)",
  },
  {
    key: "additionally3",
    label: "дополнительно (доставка)",
  },
  {
    key: "deliveredSC1",
    label: "доставлено на СЦ (наш выкуп)",
  },
  {
    key: "deliveredSC2",
    label: "доставлено на СЦ (выкуп клиента)",
  },
  {
    key: "deliveredPVZ1",
    label: "доставлено на ПВЗ (наш выкуп)",
  },
  {
    key: "deliveredPVZ2",
    label: "доставлено на ПВЗ (выкуп клиента)",
  },
  {
    key: "deliveredKGT1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "dispatchPVZ1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "dispatchPVZ2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "dispatchPVZ3",
    label: "Доступ к ПВЗ",
  },
  {
    key: "sorted",
    label: "Доступ к ПВЗ",
  },
  {
    key: "paid",
    label: "Доступ к ПВЗ",
  },
  {
    key: "name3",
    label: "Доступ к ПВЗ",
  },
  {
    key: "fromName1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "fromName2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "fromName3",
    label: "Доступ к ПВЗ",
  },
  {
    key: "issued1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "issued2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "orderAccount",
    label: "Доступ к ПВЗ",
  },
  {
    key: "orderPVZ1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "orderPVZ2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "orderPVZ3",
    label: "Доступ к ПВЗ",
  },
  {
    key: "percentClient1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "percentClient2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "percentClient3",
    label: "Доступ к ПВЗ",
  },
  {
    key: "priceProgram",
    label: "Доступ к ПВЗ",
  },
  {
    key: "purchaseOfGoods",
    label: "Доступ к ПВЗ",
  },
  {
    key: "priceSite",
    label: "Доступ к ПВЗ",
  },
  {
    key: "prepayment1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "prepayment2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "productLink1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "productLink2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "productName1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "productName2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "dataOurRansom",
    label: "Доступ к ПВЗ",
  },
  {
    key: "dataClientRansom",
    label: "Доступ к ПВЗ",
  },
  {
    key: "dataDelivery",
    label: "Доступ к ПВЗ",
  },
  {
    key: "amountFromClient1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "amountFromClient2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "amountFromClient3",
    label: "Доступ к ПВЗ",
  },
  {
    key: "clientLink1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "clientLink2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "clientLink3",
    label: "Доступ к ПВЗ",
  },
  {
    key: "profit1",
    label: "Доступ к ПВЗ",
  },
  {
    key: "profit2",
    label: "Доступ к ПВЗ",
  },
  {
    key: "profit3",
    label: "Доступ к ПВЗ",
  },
];

columns.forEach((col, index) => {
  if (props.fields[index]) {
    col.label = props.fields[index];
  }
});

columns.unshift({ key: "actions", label: "Действия" });

const items = (userData) => [
  [
    {
      label: "Изменить",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => openModal(userData),
    },
  ],
  [
    {
      label: "Удалить",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteUser(userData.username),
    },
  ],
];

const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};
</script>

<template>
  <UTable
    class="w-full text-center bg-white border-[1px] rounded-md"
    :ui="{ td: { base: 'max-h-[0]', size: 'text-[14px]' }, th: {base: 'text-center uppercase', padding: 'px-3', size: 'text-[10px]'}, default: { checkbox: { color: 'gray' as any } } }"
    :rows="users"
    :columns="columns"
  >
    <template #actions-data="{ row }">
      <UDropdown :open="dropdownStates[row.id]" :items="items(row)">
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

    <template #expand="{ row }">
      <div class="p-4 text-left">
        <pre>
Дата создания: {{ storeUsers.getNormalizedDate(row.created_at) }}</pre
        >
      </div>
    </template>

    <template #PVZ-data="{ row }">
      <span>{{ row.PVZ.join(", ") }}</span>
    </template>
  </UTable>
</template>
