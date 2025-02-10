<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { createClient } from "@supabase/supabase-js";
import Cookies from "js-cookie";

import { useToast } from "vue-toastification";

const isLoading = ref(false);

const storeUsers = useUsersStore();
const storeChats = useChatsStore();
const user = ref({} as User);
const router = useRouter();

// Определяем интерфейсы для сообщений и темы чата
interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  createdAt: string;
  threadId: number;
}

interface ChatThread {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  name?: string;
}

// Локальные реактивные переменные
const messages = ref<ChatMessage[]>([]);
const thread = ref<ChatThread | null>(null);
const newMessage = ref("");

const route = useRoute();
const threadId = route.params.threadId as string;

const supabaseUrl = "https://larlbqgiulcvtankbkot.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcmxicWdpdWxjdnRhbmtia290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MDUwMDcsImV4cCI6MjAzMjk4MTAwN30.mg-Z1vzsO6RWfZCoND7yIGpSu_E9e5N7qZasGzqGurQ";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Объявляем переменные для каналов realtime
let messagesChannel: any = null;
let threadChannel: any = null;

function playSound() {
  const audio = new Audio("/mixkit-message-pop-alert-2354.mp3");
  audio.play();
}

const storeRansom = useRansomStore();
const toast = useToast();
const token = Cookies.get("token");
onMounted(async () => {
  user.value = await storeUsers.getUser();

  if (!token) {
    return router.push("/auth/login");
  }

  isLoading.value = true;

  // Загружаем информацию о теме (чат-сессии)
  const { data: threadData, error: threadError } = await supabase
    .from<ChatThread>("ChatThread")
    .select("*")
    .eq("id", threadId)
    .single();
  if (threadError) {
    console.error("Ошибка загрузки темы чата:", threadError);
  } else {
    thread.value = threadData;
  }

  // Загружаем существующие сообщения по теме
  const { data: messagesData, error: messagesError } = await supabase
    .from<ChatMessage>("ChatMessage")
    .select("*")
    .eq("threadId", threadId)
    .order("createdAt", { ascending: true });
  if (messagesError) {
    console.error("Ошибка загрузки сообщений:", messagesError);
  } else if (messagesData) {
    messages.value = messagesData;
  }

  // Создаем канал для подписки на новые сообщения в таблице ChatMessage
  messagesChannel = supabase
    .channel("message")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ChatMessage",
        filter: `threadId=eq.${threadId}`,
      },
      (payload) => {
        if (payload.new.sender === "client") {
          playSound();
          toast.success("Появилось новое сообщение от клиента");
          newMessages.value += 1;
        }
        messages.value.push(payload.new);
        scrollToBottom();
      }
    )
    .subscribe();

  // Создаем канал для подписки на обновления темы чата (например, изменение статуса)
  threadChannel = supabase
    .channel("thread")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "ChatThread",
        filter: `id=eq.${threadId}`,
      },
      (payload) => {
        thread.value = payload.new;
      }
    )
    .subscribe();

  scrollToBottom();
  isLoading.value = false;
});

onBeforeUnmount(() => {
  // Отписываемся от каналов при размонтировании компонента
  if (messagesChannel) {
    supabase.removeChannel(messagesChannel);
  }
  if (threadChannel) {
    supabase.removeChannel(threadChannel);
  }
});

// Функция для отправки нового сообщения через API
const send = async () => {
  if (newMessage.value.trim()) {
    try {
      isLoadingMessage.value = true;
      await $fetch(`/api/chat/message/${threadId}`, {
        method: "POST",
        body: {
          sender: "admin", // или другой идентификатор отправителя
          content: newMessage.value,
        },
      });
      newMessage.value = "";
      scrollToBottom();
      newMessages.value = 0;
      isLoadingMessage.value = false;
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
    }
  }
};

const close = async () => {
  try {
    isLoading.value = true;
    await $fetch(`/api/chat/message/${threadId}/close`, {
      method: "POST",
    });
    isLoading.value = false;
  } catch (error) {
    console.error("Ошибка при изменении статуса чата:", error);
  }
};

definePageMeta({
  layout: false,
});

const chatContainer = ref<HTMLElement | null>(null);
const scrollToBottom = () => {
  if (chatContainer.value) {
    setTimeout(() => {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }, 100);
  }
};

const isLoadingMessage = ref(false);
const newMessages = ref(0);
</script>

<template>
  <Head>
    <Title v-if="!newMessages">Тикет - {{ thread?.id }}</Title>
    <Title v-if="newMessages"
      >!!! Новые сообщения - {{ `(${newMessages})` }}</Title
    >
  </Head>

  <div v-if="user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading">
        <div class="rounded-md">
          <div class="py-5">
            <div class="flex items-center justify-end mb-3">
              <UButton class="font-semibold" @click="router.push('/tickets')"
                >Перейти ко всем тикетам</UButton
              >
            </div>
            <div
              v-if="thread?.status === 'OPEN'"
              class="flex items-center justify-center"
            >
              <div
                class="bg-white border rounded-md shadow py-5 w-[500px] max-sm:w-full px-5"
              >
                <h2 class="text-center text-2xl font-semibold my-5">
                  Тема: {{ thread?.subject }}
                </h2>
                <h2
                  v-if="thread?.name"
                  class="text-center text-2xl font-semibold my-5"
                >
                  Клиент: {{ thread?.name }}
                </h2>
                <ul
                  ref="chatContainer"
                  class="flex px-5 flex-col gap-5 min-w-[450px] max-sm:min-w-0 h-[550px] max-sm:max-h-[350px] overflow-y-auto"
                >
                  <li
                    v-for="msg in messages"
                    class="flex items-center gap-5"
                    :class="{
                      'flex justify-end text-right': msg.sender === 'client',
                    }"
                    :key="msg.id"
                  >
                    <div>
                      <div
                        class="flex items-center gap-3"
                        :class="{ 'justify-end': msg.sender === 'client' }"
                      >
                        <img
                          v-if="msg.sender === 'admin'"
                          src="https://www.meinberg.de/images/icons/svg/blue/user_headset.svg"
                          alt="client"
                          class="w-8 h-8 rounded-full object-cover border"
                        />
                        <h1>
                          <strong>{{
                            msg.sender === "client"
                              ? "Клиент"
                              : "Служба поддержки"
                          }}</strong>
                        </h1>

                        <img
                          v-if="msg.sender === 'client'"
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                          alt="client"
                          class="w-8 h-8 rounded-full object-cover"
                        />
                      </div>

                      <h1
                        class="bg-blue-500 max-w-[400px] break-words text-sm rounded-xl px-5 py-3 mt-2 text-white font-semibold"
                      >
                        {{ msg.content }}
                      </h1>
                      <div
                        :class="{ 'justify-end': msg.sender === 'client' }"
                        class="flex items-center mt-1 gap-3"
                      >
                        <h1 class="italic text-muted-color text-sm">
                          {{
                            new Date(
                              new Date(msg.createdAt).getTime() +
                                3 * 60 * 60 * 1000
                            ).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          }}
                        </h1>

                        <div class="text-blue-500">
                          <Icon name="garden:check-double-fill-12" size="16" />
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                <div class="mt-10">
                  <form
                    class="flex items-center justify-between w-full gap-5"
                    @submit.prevent="send"
                  >
                    <UTextarea
                      class="w-full"
                      color="blue"
                      :rows="2"
                      size="lg"
                      v-model="newMessage"
                      :disabled="isLoadingMessage"
                      placeholder="Введите сообщение"
                    />
                    <button
                      :disabled="isLoadingMessage"
                      class="w-8 h-8 rounded-full hover:bg-white hover:text-blue-500 duration-200 object-cover pt-1 disabled:cursor-not-allowed bg-blue-500 text-white hover:border shadow"
                      type="submit"
                    >
                      <Icon
                        v-if="!isLoadingMessage"
                        name="material-symbols:send"
                        size="18"
                      />
                      <Icon
                        v-if="isLoadingMessage"
                        class="animate-pulse"
                        name="material-symbols:send"
                        size="18"
                      />
                    </button>
                  </form>
                </div>
                <div class="flex items-center justify-center mt-5">
                  <UButton
                    @click="close"
                    icon="material-symbols:chat-error-rounded"
                    color="red"
                    class="font-semibold"
                    >Закрыть чат</UButton
                  >
                </div>
              </div>
            </div>
            <div class="flex items-center justify-center" v-else>
              <div
                class="bg-white border rounded-md shadow py-5 max-w-[500px] max-sm:w-full px-5"
              >
                <h2 class="text-center text-2xl font-semibold my-5">
                  Тема: {{ thread?.subject }}
                </h2>
                <ul
                  class="flex px-5 flex-col gap-5 min-w-[450px] max-sm:min-w-0 h-[550px] max-sm:max-h-[350px] overflow-y-auto"
                >
                  <div class="flex items-center justify-center mt-5 text-2xl">
                    <h1 class="text-red-500 font-bold">Чат закрыт!</h1>
                  </div>
                  <li
                    v-for="msg in messages"
                    class="flex items-center gap-5"
                    :class="{
                      'flex justify-end text-right': msg.sender === 'client',
                    }"
                    :key="msg.id"
                  >
                    <div>
                      <div
                        class="flex items-center gap-3"
                        :class="{ ' justify-end': msg.sender === 'client' }"
                      >
                        <img
                          v-if="msg.sender === 'admin'"
                          src="https://www.meinberg.de/images/icons/svg/blue/user_headset.svg"
                          alt="client"
                          class="w-8 h-8 rounded-full object-cover border"
                        />
                        <h1>
                          <strong>{{
                            msg.sender === "client"
                              ? "Клиент"
                              : "Служба поддержки"
                          }}</strong>
                        </h1>

                        <img
                          v-if="msg.sender === 'client'"
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                          alt="client"
                          class="w-8 h-8 rounded-full object-cover"
                        />
                      </div>

                      <div>
                        <h1
                          class="bg-blue-500 max-w-[400px] break-words text-sm rounded-xl px-5 py-3 mt-2 w-full text-white font-semibold"
                        >
                          {{ msg.content }}
                        </h1>
                      </div>
                      <div
                        :class="{ 'justify-end': msg.sender === 'client' }"
                        class="flex items-center mt-1 gap-3"
                      >
                        <h1 class="italic text-muted-color text-sm">
                          {{
                            new Date(
                              new Date(msg.createdAt).getTime() +
                                3 * 60 * 60 * 1000
                            ).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          }}
                        </h1>
                        <div class="text-blue-500">
                          <Icon name="garden:check-double-fill-12" size="16" />
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-if="user.role !== 'ADMIN'">
    <NuxtLayout name="user">
      <div v-if="!isLoading">
        <div class="rounded-md">
          <div class="py-5">
            <div class="flex items-center justify-end mb-3">
              <UButton class="font-semibold" @click="router.push('/tickets')"
                >Перейти ко всем тикетам</UButton
              >
            </div>
            <div
              v-if="thread?.status === 'OPEN'"
              class="flex items-center justify-center"
            >
              <div
                class="bg-white border rounded-md shadow py-5 max-w-[500px] max-sm:w-full px-5"
              >
                <h2
                  class="text-center text-2xl font-semibold mb-5 border-b pb-3"
                >
                  Тема: {{ thread?.subject }}
                </h2>
                <h2
                  v-if="thread?.name"
                  class="text-center text-2xl font-semibold my-5"
                >
                  Клиент: {{ thread?.name }}
                </h2>
                <ul
                  ref="chatContainer"
                  class="flex px-5 flex-col gap-5 min-w-[450px] max-sm:min-w-0 h-[550px] max-sm:max-h-[350px] overflow-y-auto"
                >
                  <li
                    v-for="msg in messages"
                    class="flex items-center gap-5"
                    :class="{
                      'flex justify-end text-right': msg.sender === 'client',
                    }"
                    :key="msg.id"
                  >
                    <div>
                      <div
                        class="flex items-center gap-3"
                        :class="{ 'justify-end': msg.sender === 'client' }"
                      >
                        <img
                          v-if="msg.sender === 'admin'"
                          src="https://www.meinberg.de/images/icons/svg/blue/user_headset.svg"
                          alt="client"
                          class="w-8 h-8 rounded-full object-cover border"
                        />
                        <h1>
                          <strong>{{
                            msg.sender === "client"
                              ? "Клиент"
                              : "Служба поддержки"
                          }}</strong>
                        </h1>

                        <img
                          v-if="msg.sender === 'client'"
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                          alt="client"
                          class="w-8 h-8 rounded-full object-cover"
                        />
                      </div>

                      <h1
                        class="bg-blue-500 max-w-[400px] break-words text-sm rounded-xl px-5 py-3 mt-2 text-white font-semibold"
                      >
                        {{ msg.content }}
                      </h1>
                      <div
                        :class="{ 'justify-end': msg.sender === 'client' }"
                        class="flex items-center mt-1 gap-3"
                      >
                        <h1 class="italic text-muted-color text-sm">
                          {{
                            new Date(
                              new Date(msg.createdAt).getTime() +
                                3 * 60 * 60 * 1000
                            ).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          }}
                        </h1>
                        <div class="text-blue-500">
                          <Icon name="garden:check-double-fill-12" size="16" />
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                <div class="mt-10">
                  <form
                    class="flex items-center justify-between w-full gap-5"
                    @submit.prevent="send"
                  >
                    <UTextarea
                      class="w-full"
                      color="blue"
                      :rows="2"
                      size="lg"
                      v-model="newMessage"
                      :disabled="isLoadingMessage"
                      placeholder="Введите сообщение"
                    />
                    <button
                      :disabled="isLoadingMessage"
                      class="w-8 h-8 rounded-full hover:bg-white hover:text-blue-500 duration-200 object-cover pt-1 disabled:cursor-not-allowed bg-blue-500 text-white hover:border shadow"
                      type="submit"
                    >
                      <Icon
                        v-if="!isLoadingMessage"
                        name="material-symbols:send"
                        size="18"
                      />
                      <Icon
                        v-if="isLoadingMessage"
                        class="animate-pulse"
                        name="material-symbols:send"
                        size="18"
                      />
                    </button>
                  </form>
                </div>
                <div class="flex items-center justify-center mt-5">
                  <UButton
                    @click="close"
                    icon="material-symbols:chat-error-rounded"
                    color="red"
                    class="font-semibold"
                    >Закрыть чат</UButton
                  >
                </div>
              </div>
            </div>
            <div class="flex items-center justify-center" v-else>
              <div
                class="bg-white border rounded-md shadow py-5 max-w-[500px] max-sm:w-full px-5"
              >
                <h2 class="text-center text-2xl font-semibold my-5">
                  Тема: {{ thread?.subject }}
                </h2>
                <h2
                  v-if="thread?.name"
                  class="text-center text-2xl font-semibold my-5"
                >
                  Клиент: {{ thread?.name }}
                </h2>
                <ul
                  class="flex px-5 flex-col gap-5 min-w-[450px] max-sm:min-w-0 h-[550px] max-sm:max-h-[350px] overflow-y-auto"
                >
                  <div class="flex items-center justify-center mt-5 text-2xl">
                    <h1 class="text-red-500 font-bold">Чат закрыт!</h1>
                  </div>
                  <li
                    v-for="msg in messages"
                    class="flex items-center gap-5"
                    :class="{
                      'flex justify-end text-right': msg.sender === 'client',
                    }"
                    :key="msg.id"
                  >
                    <div>
                      <div
                        class="flex items-center gap-3"
                        :class="{ ' justify-end': msg.sender === 'client' }"
                      >
                        <img
                          v-if="msg.sender === 'admin'"
                          src="https://www.meinberg.de/images/icons/svg/blue/user_headset.svg"
                          alt="client"
                          class="w-8 h-8 rounded-full object-cover border"
                        />
                        <h1>
                          <strong>{{
                            msg.sender === "client"
                              ? "Клиент"
                              : "Служба поддержки"
                          }}</strong>
                        </h1>

                        <img
                          v-if="msg.sender === 'client'"
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                          alt="client"
                          class="w-8 h-8 rounded-full object-cover"
                        />
                      </div>

                      <div>
                        <h1
                          class="bg-blue-500 max-w-[400px] break-words text-sm rounded-xl px-5 py-3 mt-2 w-full text-white font-semibold"
                        >
                          {{ msg.content }}
                        </h1>
                      </div>
                      <div
                        :class="{ 'justify-end': msg.sender === 'client' }"
                        class="flex items-center mt-1 gap-3"
                      >
                        <h1 class="italic text-muted-color text-sm">
                          {{
                            new Date(
                              new Date(msg.createdAt).getTime() +
                                3 * 60 * 60 * 1000
                            ).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          }}
                        </h1>
                        <div class="text-blue-500">
                          <Icon name="garden:check-double-fill-12" size="16" />
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>
</template>
