<script setup lang="ts">

let props = defineProps({
  sum: { type: Object as any }
})

const emit = defineEmits(['createUser', 'updateSum'])

let username = ref("");
let password = ref("");
let role = ref("USER");
let sumValue = ref(props.sum)


function createUser() {
  let userData = {
    username: username.value.trim(),
    password: password.value.trim(),
    role: role.value
  }
  emit('createUser', userData)
}

function updateSum() {
  emit('updateSum', sumValue)
}

</script>


<template>
  <div class="flex items-center justify-between mt-10 mb-10 max-lg:flex-col">
    <div>
      <h1 class="text-xl mb-2">Добавить нового пользователя
        <Icon class="text-yellow-400" name="material-symbols:person-add-outline-rounded" size="24" />
      </h1>
      <div class="flex items-center gap-3 max-md:block">
        <div class="flex flex-col gap-3 max-md:mb-5">
          <label for="username"> Имя пользователя </label>
          <input
            class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
            v-model="username" name="username" type="text" />
        </div>
        <div class="flex flex-col gap-3 max-md:mb-5">
          <label for="password">Пароль</label>
          <input
            class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
            v-model="password" name="password" type="password" />
        </div>
        <div class="flex flex-col gap-3 max-md:mb-3">
          <label for="role">Роль</label>
          <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base" v-model="role" name="role">
            <option disabled>Выберите роль</option>
            <option value="ADMIN">ADMIN</option>
            <option selected value="USER">USER</option>
            <option selected value="SORTIROVKA">SORTIROVKA</option>
            <option selected value="PVZ">PVZ</option>
            <option selected value="ADMINISTRATOR">ADMINISTRATOR</option>
          </select>
        </div>
      </div>
      <UIMainButton class="mt-3" @click="createUser">Добавить</UIMainButton>
    </div>
    <div class="max-lg:mt-10">
      <h1 class="text-xl mb-2">Изменить сумму за отказ клиента 
        <Icon class="text-yellow-400" name="material-symbols:attach-money-rounded" size="24" />
      </h1>
      <div class="flex items-center gap-3 max-md:block">
        <div class="flex flex-col gap-3 max-md:mb-5">
          <label for="sum">Сумма</label>
          <input
            class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
            v-model="sumValue.value" name="sum" type="text" />
        </div>
      </div>
      <UIMainButton class="mt-3" @click="updateSum">Изменить</UIMainButton>
    </div>
  </div>
  
</template>

