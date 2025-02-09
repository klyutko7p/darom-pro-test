<script setup lang="ts">
let props = defineProps({
  sum: { type: Object as any },
});

const emit = defineEmits(["createUser", "updateSum"]);

const roles = [
  { role: "PVZ", name: "ПВЗ" },
  { role: "SORTIROVKA", name: "СОРТИРОВКА" },
  { role: "ADMINISTRATOR", name: "УПРАВЛЯЮЩИЙ" },
  { role: "ADMIN", name: "ДИРЕКТОР" },
];

let username = ref("");
let password = ref("");
let role = ref(roles[0]);
let sumValue = ref(props.sum);

function createUser() {
  let userData = {
    username: username.value.trim(),
    password: password.value.trim(),
    role: role.value,
  };
  emit("createUser", userData);
}

function updateSum() {
  emit("updateSum", sumValue);
}
</script>

<template>
  <div class="flex items-center justify-between mt-10 mb-10 max-xl:flex-col">
    <div class="max-xl:w-full">
      <h1 class="text-xl mb-2">
        Добавить нового пользователя
        <Icon
          class="text-yellow-400"
          name="material-symbols:person-add-outline-rounded"
          size="24"
        />
      </h1>
      <div class="flex items-center gap-3 max-md:block">
        <div class="flex flex-col gap-1 max-md:mb-5">
          <label for="username"> Имя пользователя </label>
          <UInput
            v-model="username"
            name="username"
            placeholder="Введите имя"
            icon="material-symbols-light:add-circle-rounded"
            autocomplete="off"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="username !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark-20-solid"
                :padded="false"
                @click="username = ''"
              />
            </template>
          </UInput>
        </div>
        <div class="flex flex-col gap-1 max-md:mb-5">
          <label for="password">Пароль</label>
          <UInput
            v-model="password"
            name="password"
            placeholder="Введите пароль"
            icon="material-symbols-light:add-circle-rounded"
            autocomplete="off"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="password !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark-20-solid"
                :padded="false"
                @click="password = ''"
              />
            </template>
          </UInput>
        </div>
        <div class="flex flex-col gap-1 max-md:mb-3">
          <label for="role">Роль</label>
          <USelectMenu
            class="min-w-40 max-sm:max-w-none max-sm:w-full"
            v-model="role"
            :options="roles"
            value-attribute="role"
            option-attribute="name"
          />
        </div>
      </div>
      <UIMainButton class="mt-3" @click="createUser">Добавить</UIMainButton>
    </div>
    <div class="max-xl:mt-10 max-xl:w-full">
      <h1 class="text-xl mb-2">
        Изменить сумму за отказ клиента
        <Icon
          class="text-yellow-400"
          name="material-symbols:attach-money-rounded"
          size="24"
        />
      </h1>
      <div class="flex items-center gap-3 max-md:block">
        <div class="flex flex-col gap-3 max-md:mb-5">
          <label for="sum">Сумма</label>
          <UInput
            v-model="sumValue.value"
            name="sum"
            placeholder="Введите сумму"
            icon="material-symbols-light:add-circle-rounded"
            autocomplete="off"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="sumValue.value !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark-20-solid"
                :padded="false"
                @click="sumValue.value = ''"
              />
            </template>
          </UInput>
        </div>
      </div>
      <UIMainButton class="mt-3" @click="updateSum">Изменить</UIMainButton>
    </div>
  </div>
</template>
