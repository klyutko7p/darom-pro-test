<script setup lang="ts">
import type { PropType } from "vue";

const storeUsers = useUsersStore();

const emit = defineEmits(['openModal', 'deleteUser'])

function openModal(user: User) {
  emit('openModal', user)
}

function deleteUser(username: string) {
  emit('deleteUser', username)
}

defineProps({
  fields: { type: Array as PropType<String[]>, required: true },
  users: { type: Array as PropType<User[]> }
})
</script>

<template>
  <div class="relative overflow-x-auto overflow-y-auto mt-5 mb-5">
    <table id="theTable" class="w-full border-gray-50 text-sm text-left rtl:text-right text-gray-500">
      <thead class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center">
        <tr>
          <th scope="col" class="px-2 border-2" v-for="field in fields">{{ field }}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="bg-white text-center h-[50px] border-2" v-for="userData in users">
          <td class="">
            <Icon @click="openModal(userData)" class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              name="material-symbols:person-edit-outline" size="24" />
          </td>
          <td class="border-2">
            <Icon @click="deleteUser(userData.username)"
              class="text-red-600 cursor-pointer hover:text-red-300 duration-200"
              name="material-symbols:person-remove-outline" size="24" v-if="userData.role !== 'ADMIN'" />
          </td>
          <th scope="row" class=" font-medium border-2 text-gray-900 whitespace-nowrap">
            {{ userData.username }}
          </th>
          <td class="">{{ userData.role }}</td>
          <td class="whitespace-nowrap px-2 border-2">{{ userData.PVZ.join(', ') }}</td>
          <td class="px-2 border-2">
            {{ storeUsers.getNormalizedDate(userData.created_at) }}
          </td>
          <td class="px-2 border-2">
            {{ userData.visibleSC }}
          </td>
          <td class="px-2 border-2">
            {{ userData.visiblePVZ }}
          </td>
          <td class="px-2 border-2">
            {{ userData.cell1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.cell2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.additionally1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.additionally2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.additionally3 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.deliveredSC1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.deliveredSC2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.deliveredPVZ1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.deliveredPVZ2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.deliveredKGT1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.deliveredKGT2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.dispatchPVZ1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.dispatchPVZ2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.dispatchPVZ3 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.sorted }}
          </td>
          <td class="px-2 border-2">
            {{ userData.paid }}
          </td>
          <td class="px-2 border-2">
            {{ userData.name3 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.fromName1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.fromName2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.fromName3 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.issued1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.issued2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.orderAccount }}
          </td>
          <td class="px-2 border-2">
            {{ userData.orderPVZ1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.orderPVZ2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.orderPVZ3 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.percentClient1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.percentClient2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.percentClient3 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.notation1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.notation2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.priceProgram }}
          </td>
          <td class="px-2 border-2">
            {{ userData.purchaseOfGoods }}
          </td>
          <td class="px-2 border-2">
            {{ userData.priceSite }}
          </td>
          <td class="px-2 border-2">
            {{ userData.prepayment1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.prepayment2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.productLink1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.productLink2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.productName1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.productName2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.dataOurRansom }}
          </td>
          <td class="px-2 border-2">
            {{ userData.dataClientRansom }}
          </td>
          <td class="px-2 border-2">
            {{ userData.dataDelivery }}
          </td>
          <td class="px-2 border-2">
            {{ userData.amountFromClient1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.amountFromClient2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.amountFromClient3 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.clientLink1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.clientLink2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.clientLink3 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.profit1 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.profit2 }}
          </td>
          <td class="px-2 border-2">
            {{ userData.profit3 }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<style scoped>
.hidden-row {
  display: none !important;
}

tr:nth-child(even) {
  background-color: #f2f2f2; /* Цвет для четных строк */
}

</style>