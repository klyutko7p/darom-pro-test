<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://larlbqgiulcvtankbkot.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcmxicWdpdWxjdnRhbmtia290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MDUwMDcsImV4cCI6MjAzMjk4MTAwN30.mg-Z1vzsO6RWfZCoND7yIGpSu_E9e5N7qZasGzqGurQ";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const toast = useToast();
const isLoading = ref(false);

const storeUsers = useUsersStore();
const storeChats = useChatsStore();
const user = ref({} as User);
const router = useRouter();

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
  deleted?: string;
  name?: string;
  messages: ChatMessage[];
}
const token = Cookies.get("token");

const threads = ref<Array<ChatThread>>([]);
onMounted(async () => {
  user.value = await storeUsers.getUser();

  if (!token) {
    return router.push("/auth/login");
  }

  subscribeToThread();
  isLoading.value = true;
  threads.value = await storeChats.getMessages();
  isLoading.value = false;
});

definePageMeta({
  layout: false,
  name: "Чат поддержки",
});

const isShowActiveTickets = ref(true);
const isShowNonActiveTickets = ref(false);
const isShowDeletedTickets = ref(false);

const storeRansom = useRansomStore();

function playSound() {
  const audio = new Audio("/mixkit-message-pop-alert-2354.mp3");
  audio.play();
}

let messagesChannel: any = null;
const subscribeToThread = async () => {
  messagesChannel = supabase
    .channel("message")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ChatMessage",
      },
      async (payload: any) => {
        playSound();
        storeRansom.announce("Появилось новое сообщение от клиента");
        toast.success("Появилось новое сообщение от клиента. Обновляем...");

        isLoading.value = true;
        try {
          threads.value = await storeChats.getMessages();
          newMessages.value += 1;
        } catch (error) {
          console.error("Ошибка при получении сообщений:", error);
        }
        isLoading.value = false;
      }
    )
    .subscribe();
};

onBeforeUnmount(() => {
  if (messagesChannel) {
    supabase.removeChannel(messagesChannel);
  }
});

async function deleteThread(id: number) {
  let answer = confirm("Вы точно хотите удалить этот чат?");
  if (answer) {
    isLoading.value = true;
    await storeChats.deleteThread(id);
    threads.value = await storeChats.getMessages();
    newMessages.value = 0;
    isLoading.value = false;
  }
}

async function closeChat(id: number) {
  let answer = confirm("Вы точно хотите закрыть этот чат?");
  if (answer) {
    isLoading.value = true;
    await $fetch(`/api/chat/message/${id}/close`, {
      method: "POST",
    });
    threads.value = await storeChats.getMessages();
    newMessages.value = 0;
    isLoading.value = false;
  }
}

function getName(thread: ChatThread) {
  if (
    thread.messages[thread.messages.length - 1].sender === "client" &&
    !thread.name
  ) {
    return "Клиент";
  } else if (
    thread.messages[thread.messages.length - 1].sender === "client" &&
    thread.name
  ) {
    return `Клиент ЛК, ${thread.name}`;
  } else {
    return "Служба поддержки";
  }
}

const newMessages = ref(0);
</script>

<template>
  <Head>
    <Title v-if="!newMessages">Чат поддержки</Title>
    <Title v-if="newMessages"
      >!!! Новые сообщения - {{ `(${newMessages})` }}</Title
    >
  </Head>

  <div v-if="user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading">
        <div class="py-10 rounded-md">
          <div class="mb-5 flex items-center gap-5">
            <div
              @click="isShowActiveTickets = !isShowActiveTickets"
              :class="{ 'bg-secondary-color text-white': isShowActiveTickets }"
              class="flex items-center gap-3 border border-secondary-color rounded-lg px-5 py-2 text-secondary-color font-bold hover:opacity-50 duration-200 cursor-pointer"
            >
              <Icon name="ic:baseline-question-answer" size="24" />
              <h1 class="text-xl">
                Активные чаты,
                {{
                  threads.filter(
                    (thread) => thread.status === "OPEN" && !thread.deleted
                  ).length
                }}
                шт
              </h1>
            </div>
          </div>
          <div
            v-if="
              threads.filter(
                (thread) => thread.status === 'OPEN' && !thread.deleted
              ).length && isShowActiveTickets
            "
            class="flex flex-col max-h-[600px] overflow-y-scroll bg-gray-50 px-5 py-3 gap-10"
          >
            <div
              class="flex items-center justify-between max-sm:flex-col max-sm:items-end gap-5"
              v-for="thread in threads.filter(
                (thread) => thread.status === 'OPEN' && !thread.deleted
              )"
            >
              <NuxtLink
                :to="`/tickets/${thread.id}`"
                class="flex items-center gap-5 hover:bg-secondary-color cursor-pointer duration-200 hover:text-white border bg-white shadow-inner rounded px-5 py-1 w-full"
              >
                <div class="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                    alt="client"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span
                    class="absolute h-3 w-3 rounded-full bg-red-500 top-0 right-0"
                  />
                </div>
                <div class="flex flex-col">
                  <h1 class="font-bold text-base">
                    {{ thread.subject }},
                    {{
                      storeUsers.getNormalizedDateWithoutTime(thread.createdAt)
                    }}
                  </h1>
                  <h1 class="font-semibold">
                    {{ getName(thread) }}
                  </h1>
                  <h1 class="mt-1">
                    Сообщение:
                    <span class="italic"
                      >«{{
                        thread.messages[thread.messages.length - 1].content
                      }}»
                    </span>
                    в
                    {{
                      storeUsers.getNormalizeTime(
                        thread.messages[thread.messages.length - 1].createdAt
                      )
                    }}
                  </h1>
                </div>
              </NuxtLink>

              <div class="flex items-center gap-3">
                <div
                  @click="closeChat(thread.id)"
                  class="hover:opacity-60 cursor-pointer duration-200 bg-red-500 text-white pt-2 pb-1 px-2 rounded-full object-cover"
                >
                  <Icon name="material-symbols:chat-error" size="18" />
                </div>
                <div
                  @click="deleteThread(thread.id)"
                  class="hover:opacity-60 cursor-pointer duration-200 bg-red-500 text-white pt-2 pb-1 px-2 rounded-full object-cover"
                >
                  <Icon name="material-symbols:delete-rounded" size="18" />
                </div>
              </div>
            </div>
          </div>

          <div class="mb-5 flex items-center gap-5 mt-10">
            <div
              @click="isShowNonActiveTickets = !isShowNonActiveTickets"
              :class="{
                'bg-secondary-color text-white': isShowNonActiveTickets,
              }"
              class="flex items-center gap-3 border border-secondary-color rounded-lg px-5 py-2 text-secondary-color font-bold hover:opacity-50 duration-200 cursor-pointer"
            >
              <Icon name="material-symbols:chat-error-rounded" size="24" />
              <h1 class="text-xl">
                Неактивные чаты,
                {{
                  threads.filter(
                    (thread) => thread.status === "CLOSED" && !thread.deleted
                  ).length
                }}
                шт
              </h1>
            </div>
          </div>
          <div
            v-if="
              threads.filter(
                (thread) => thread.status === 'CLOSED' && !thread.deleted
              ).length && isShowNonActiveTickets
            "
            class="flex flex-col max-h-[600px] overflow-y-scroll bg-gray-50 px-5 py-3 gap-10"
          >
            <div
              class="flex items-center justify-between max-sm:flex-col max-sm:items-end gap-5"
              v-for="thread in threads.filter(
                (thread) => thread.status === 'CLOSED' && !thread.deleted
              )"
            >
              <NuxtLink
                :to="`/tickets/${thread.id}`"
                class="flex items-center gap-5 hover:bg-secondary-color cursor-pointer duration-200 hover:text-white border bg-white shadow-inner rounded px-5 py-1 w-full"
              >
                <div class="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                    alt="client"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span
                    class="absolute h-3 w-3 rounded-full bg-gray-300 top-0 right-0"
                  />
                </div>
                <div class="flex flex-col">
                  <h1 class="font-bold text-base">
                    {{ thread.subject }},
                    {{
                      storeUsers.getNormalizedDateWithoutTime(thread.createdAt)
                    }}
                  </h1>
                  <h1 class="font-semibold">
                    {{ getName(thread) }}
                  </h1>
                  <h1 class="mt-1">
                    Сообщение:
                    <span class="italic"
                      >«{{
                        thread.messages[thread.messages.length - 1].content
                      }}»
                    </span>
                    в
                    {{
                      storeUsers.getNormalizeTime(
                        thread.messages[thread.messages.length - 1].createdAt
                      )
                    }}
                  </h1>
                </div>
              </NuxtLink>

              <div class="flex items-center gap-3">
                <div
                  @click="deleteThread(thread.id)"
                  class="hover:opacity-60 cursor-pointer duration-200 bg-red-500 text-white pt-2 pb-1 px-2 rounded-full object-cover"
                >
                  <Icon name="material-symbols:delete-rounded" size="18" />
                </div>
              </div>
            </div>
          </div>

          <div class="mb-5 flex items-center gap-5 mt-10">
            <div
              @click="isShowDeletedTickets = !isShowDeletedTickets"
              :class="{
                'bg-secondary-color text-white': isShowDeletedTickets,
              }"
              class="flex items-center gap-3 border border-secondary-color rounded-lg px-5 py-2 text-secondary-color font-bold hover:opacity-50 duration-200 cursor-pointer"
            >
              <Icon name="material-symbols:delete-forever" size="24" />
              <h1 class="text-xl">
                Удаленные чаты,
                {{ threads.filter((thread) => thread.deleted).length }}
                шт
              </h1>
            </div>
          </div>
          <div
            v-if="
              threads.filter((thread) => thread.deleted).length &&
              isShowDeletedTickets
            "
            class="flex flex-col max-h-[600px] overflow-y-scroll bg-gray-50 px-5 py-3 gap-10"
          >
            <div
              class="flex items-center justify-between max-sm:flex-col max-sm:items-end gap-5"
              v-for="thread in threads.filter((thread) => thread.deleted)"
            >
              <NuxtLink
                :to="`/tickets/${thread.id}`"
                class="flex items-center gap-5 hover:bg-secondary-color cursor-pointer duration-200 hover:text-white border bg-white shadow-inner rounded px-5 py-1 w-full"
              >
                <div class="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                    alt="client"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span
                    class="absolute h-3 w-3 rounded-full bg-gray-300 top-0 right-0"
                  />
                </div>
                <div class="flex flex-col">
                  <h1 class="font-bold text-base">
                    {{ thread.subject }},
                    {{
                      storeUsers.getNormalizedDateWithoutTime(thread.createdAt)
                    }}
                  </h1>
                  <h1 class="font-semibold">
                    {{ getName(thread) }}
                  </h1>
                  <h1 class="mt-1">
                    Сообщение:
                    <span class="italic"
                      >«{{
                        thread.messages[thread.messages.length - 1].content
                      }}»
                    </span>
                    в
                    {{
                      storeUsers.getNormalizeTime(
                        thread.messages[thread.messages.length - 1].createdAt
                      )
                    }}
                  </h1>
                </div>
              </NuxtLink>
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
        <div class="py-10 rounded-md">
          <div class="mb-5 flex items-center gap-5">
            <div
              @click="isShowActiveTickets = !isShowActiveTickets"
              :class="{ 'bg-secondary-color text-white': isShowActiveTickets }"
              class="flex items-center gap-3 border border-secondary-color rounded-lg px-5 py-2 text-secondary-color font-bold hover:opacity-50 duration-200 cursor-pointer"
            >
              <Icon name="ic:baseline-question-answer" size="24" />
              <h1 class="text-xl">
                Активные чаты,
                {{
                  threads.filter(
                    (thread) => thread.status === "OPEN" && !thread.deleted
                  ).length
                }}
                шт
              </h1>
            </div>
          </div>
          <div
            v-if="
              threads.filter(
                (thread) => thread.status === 'OPEN' && !thread.deleted
              ).length && isShowActiveTickets
            "
            class="flex flex-col max-h-[600px] overflow-y-scroll bg-gray-50 px-5 py-3 gap-10"
          >
            <div
              class="flex items-center justify-between max-sm:flex-col max-sm:items-end gap-5"
              v-for="thread in threads.filter(
                (thread) => thread.status === 'OPEN' && !thread.deleted
              )"
            >
              <NuxtLink
                :to="`/tickets/${thread.id}`"
                class="flex items-center gap-5 hover:bg-secondary-color cursor-pointer duration-200 hover:text-white border bg-white shadow-inner rounded px-5 py-1 w-full"
              >
                <div class="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                    alt="client"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span
                    class="absolute h-3 w-3 rounded-full bg-red-500 top-0 right-0"
                  />
                </div>
                <div class="flex flex-col">
                  <h1 class="font-bold text-base">
                    {{ thread.subject }},
                    {{
                      storeUsers.getNormalizedDateWithoutTime(thread.createdAt)
                    }}
                  </h1>
                  <h1 class="font-semibold">
                    {{ getName(thread) }}
                  </h1>
                  <h1 class="mt-1">
                    Сообщение:
                    <span class="italic"
                      >«{{
                        thread.messages[thread.messages.length - 1].content
                      }}»
                    </span>
                    в
                    {{
                      storeUsers.getNormalizeTime(
                        thread.messages[thread.messages.length - 1].createdAt
                      )
                    }}
                  </h1>
                </div>
              </NuxtLink>

              <div class="flex items-center gap-3">
                <div
                  @click="closeChat(thread.id)"
                  class="hover:opacity-60 cursor-pointer duration-200 bg-red-500 text-white pt-2 pb-1 px-2 rounded-full object-cover"
                >
                  <Icon name="material-symbols:chat-error" size="18" />
                </div>
                <div
                  @click="deleteThread(thread.id)"
                  class="hover:opacity-60 cursor-pointer duration-200 bg-red-500 text-white pt-2 pb-1 px-2 rounded-full object-cover"
                >
                  <Icon name="material-symbols:delete-rounded" size="18" />
                </div>
              </div>
            </div>
          </div>

          <div class="mb-5 flex items-center gap-5 mt-10">
            <div
              @click="isShowNonActiveTickets = !isShowNonActiveTickets"
              :class="{
                'bg-secondary-color text-white': isShowNonActiveTickets,
              }"
              class="flex items-center gap-3 border border-secondary-color rounded-lg px-5 py-2 text-secondary-color font-bold hover:opacity-50 duration-200 cursor-pointer"
            >
              <Icon name="material-symbols:chat-error-rounded" size="24" />
              <h1 class="text-xl">
                Неактивные чаты,
                {{
                  threads.filter(
                    (thread) => thread.status === "CLOSED" && !thread.deleted
                  ).length
                }}
                шт
              </h1>
            </div>
          </div>
          <div
            v-if="
              threads.filter(
                (thread) => thread.status === 'CLOSED' && !thread.deleted
              ).length && isShowNonActiveTickets
            "
            class="flex flex-col max-h-[600px] overflow-y-scroll bg-gray-50 px-5 py-3 gap-10"
          >
            <div
              class="flex items-center justify-between max-sm:flex-col max-sm:items-end gap-5"
              v-for="thread in threads.filter(
                (thread) => thread.status === 'CLOSED' && !thread.deleted
              )"
            >
              <NuxtLink
                :to="`/tickets/${thread.id}`"
                class="flex items-center gap-5 hover:bg-secondary-color cursor-pointer duration-200 hover:text-white border bg-white shadow-inner rounded px-5 py-1 w-full"
              >
                <div class="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                    alt="client"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span
                    class="absolute h-3 w-3 rounded-full bg-gray-300 top-0 right-0"
                  />
                </div>
                <div class="flex flex-col">
                  <h1 class="font-bold text-base">
                    {{ thread.subject }},
                    {{
                      storeUsers.getNormalizedDateWithoutTime(thread.createdAt)
                    }}
                  </h1>
                  <h1 class="font-semibold">
                    {{ getName(thread) }}
                  </h1>
                  <h1 class="mt-1">
                    Сообщение:
                    <span class="italic"
                      >«{{
                        thread.messages[thread.messages.length - 1].content
                      }}»
                    </span>
                    в
                    {{
                      storeUsers.getNormalizeTime(
                        thread.messages[thread.messages.length - 1].createdAt
                      )
                    }}
                  </h1>
                </div>
              </NuxtLink>

              <div class="flex items-center gap-3">
                <div
                  @click="deleteThread(thread.id)"
                  class="hover:opacity-60 cursor-pointer duration-200 bg-red-500 text-white pt-2 pb-1 px-2 rounded-full object-cover"
                >
                  <Icon name="material-symbols:delete-rounded" size="18" />
                </div>
              </div>
            </div>
          </div>

          <div class="mb-5 flex items-center gap-5 mt-10">
            <div
              @click="isShowDeletedTickets = !isShowDeletedTickets"
              :class="{
                'bg-secondary-color text-white': isShowDeletedTickets,
              }"
              class="flex items-center gap-3 border border-secondary-color rounded-lg px-5 py-2 text-secondary-color font-bold hover:opacity-50 duration-200 cursor-pointer"
            >
              <Icon name="material-symbols:delete-forever" size="24" />
              <h1 class="text-xl">
                Удаленные чаты,
                {{ threads.filter((thread) => thread.deleted).length }}
                шт
              </h1>
            </div>
          </div>
          <div
            v-if="
              threads.filter((thread) => thread.deleted).length &&
              isShowDeletedTickets
            "
            class="flex flex-col max-h-[600px] overflow-y-scroll bg-gray-50 px-5 py-3 gap-10"
          >
            <div
              class="flex items-center justify-between max-sm:flex-col max-sm:items-end gap-5"
              v-for="thread in threads.filter((thread) => thread.deleted)"
            >
              <NuxtLink
                :to="`/tickets/${thread.id}`"
                class="flex items-center gap-5 hover:bg-secondary-color cursor-pointer duration-200 hover:text-white border bg-white shadow-inner rounded px-5 py-1 w-full"
              >
                <div class="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
                    alt="client"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span
                    class="absolute h-3 w-3 rounded-full bg-gray-300 top-0 right-0"
                  />
                </div>
                <div class="flex flex-col">
                  <h1 class="font-bold text-base">
                    {{ thread.subject }},
                    {{
                      storeUsers.getNormalizedDateWithoutTime(thread.createdAt)
                    }}
                  </h1>
                  <h1 class="font-semibold">
                    {{ getName(thread) }}
                  </h1>
                  <h1 class="mt-1">
                    Сообщение:
                    <span class="italic"
                      >«{{
                        thread.messages[thread.messages.length - 1].content
                      }}»
                    </span>
                    в
                    {{
                      storeUsers.getNormalizeTime(
                        thread.messages[thread.messages.length - 1].createdAt
                      )
                    }}
                  </h1>
                </div>
              </NuxtLink>
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
