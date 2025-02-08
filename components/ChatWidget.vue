<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { createClient } from "@supabase/supabase-js";

interface ChatMessage {
  id?: number;
  tempId?: string;
  sender: string;
  content: string;
  createdAt?: string;
  threadId?: number;
}

interface ChatThread {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  messages: ChatMessage[];
}

// Флаг открытия окна чата
const isOpen = ref(false);
// Если тема ещё не создана, то thread === null
const thread = ref<ChatThread | null>(null);
// Массив сообщений для отображения переписки
const messages = ref<ChatMessage[]>([]);
// Ввод пользователя
const inputMessage = ref("");
// Ссылка на контейнер сообщений для автоскролла
const chatContainer = ref<HTMLElement | null>(null);

// Инициализация клиента Supabase
const supabaseUrl = "https://fomoljxhkywsdgnchewy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW9sanhoa3l3c2RnbmNoZXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1ODMwMTksImV4cCI6MjAzOTE1OTAxOX0.ItZhBr3_OBP0nii6RX-jy9Q7hu2qvNQ2UBVZNJyZDFs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Если тема ещё не создана, локально показываем приветственное сообщение от админа
if (!thread.value) {
  messages.value.push({
    tempId: "welcome",
    sender: "admin",
    content:
      "Здравствуйте! Это автоматическое сообщение. Пока специалист подключается к чату, пожалуйста, изложите суть Вашего вопроса и ожидайте, Вам обязательно ответят (при большом количестве обращений в техническую поддержку время ожидания может быть увеличено).",
  });
}

let messagesChannel: any = null;
let threadChannel: any = null;

const storeChats = useChatsStore();
// При монтировании компонента проверяем, есть ли сохранённый threadId в localStorage

async function openChat() {
  const savedThreadId = localStorage.getItem("chatThreadId");
  if (savedThreadId) {
    // Загружаем данные темы чата с сервера (предполагается, что реализован соответствующий endpoint)
    let existingThread = await storeChats.getThreadById(Number(savedThreadId));
    if (existingThread) {
      thread.value = existingThread;
      messages.value = existingThread.messages;
      subscribeToThread(existingThread.id);
      subscribeToThreadStatus(existingThread.id);
    }
  }
}
// Переключение окна чата
const toggleOpen = async () => {
  isOpen.value = !isOpen.value;
  // При открытии можно сделать автоскролл вниз
  if (isOpen.value && chatContainer.value) {
    setTimeout(
      () => chatContainer.value?.scrollTo(0, chatContainer.value.scrollHeight),
      100
    );
  }
};

// Функция автоскролла вниз
const scrollToBottom = () => {
  if (chatContainer.value) {
    setTimeout(() => {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }, 100);
  }
};

const storeClients = useClientsStore();
const user = ref({} as Client);

function playSound() {
  const audio = new Audio("/mixkit-message-pop-alert-2354.mp3");
  audio.play();
}

onMounted(async () => {
  user.value = await storeClients.getClient();

  if (user.value === null) {
    user.value = {} as Client;
    user.value.fio = "";
  }
});
// Подписка на realtime-обновления для сообщений созданной темы
const subscribeToThread = (threadId: number) => {
  messagesChannel = supabase
    .channel(`message`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ChatMessage",
        filter: `threadId=eq.${threadId}`,
      },
      (payload: any) => {
        messages.value.push(payload.new);
        scrollToBottom();
        playSound();
      }
    )
    .subscribe();
};

const subscribeToThreadStatus = (threadId: number) => {
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
};

// Отправка сообщения
const isLoadingMessage = ref(false);
const send = async () => {
  if (!inputMessage.value.trim()) return;

  // Если тема ещё не создана, вызываем эндпоинт создания темы
  if (!thread.value) {
    try {
      isLoadingMessage.value = true;
      const newThread: ChatThread = await $fetch("/api/chat/thread", {
        method: "POST",
        body: {
          sender: "client",
          content: inputMessage.value,
          name: user.value.fio,
        },
      });
      thread.value = newThread;
      messages.value = newThread.messages;

      // Сохраняем идентификатор темы в localStorage
      localStorage.setItem("chatThreadId", newThread.id.toString());

      // Подписываемся на обновления сообщений для данной темы
      subscribeToThread(newThread.id);
      subscribeToThreadStatus(newThread.id);
      isLoadingMessage.value = false;
    } catch (error) {
      console.error("Ошибка создания темы чата:", error);
    }
  } else {
    // Если тема уже создана, отправляем новое сообщение
    try {
      isLoadingMessage.value = true;
      await $fetch(`/api/chat/message/${thread.value.id}`, {
        method: "POST",
        body: {
          sender: "client",
          content: inputMessage.value,
        },
      });
      isLoadingMessage.value = false;
      // Можно добавить оптимистичное обновление, если нужно
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  }
  inputMessage.value = "";
  scrollToBottom();
};

onBeforeUnmount(() => {
  if (messagesChannel) {
    supabase.removeChannel(messagesChannel);
  }
  if (threadChannel) {
    supabase.removeChannel(threadChannel);
  }
});

// Следим за изменениями в сообщениях для автоскролла
watch(messages, () => {
  scrollToBottom();
});

// Функция для начала нового чата – очищаем localStorage и сбрасываем локальное состояние
function goToNewChat() {
  messages.value = [];
  thread.value = null;

  if (messagesChannel) {
    supabase.removeChannel(messagesChannel);
  }
  if (threadChannel) {
    supabase.removeChannel(threadChannel);
  }

  // Удаляем сохранённый threadId
  localStorage.removeItem("chatThreadId");

  messages.value.push({
    tempId: "welcome",
    sender: "admin",
    content:
      "Здравствуйте! Это автоматическое сообщение. Пока специалист подключается к чату, пожалуйста, изложите суть Вашего вопроса и ожидайте, Вам обязательно ответят (при большом количестве обращений в техническую поддержку время ожидания может быть увеличено).",
  });
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Если окно не открыто, показываем кнопку-иконку -->
    <div
      v-if="!isOpen"
      @click="toggleOpen(), openChat()"
      class="flex items-center gap-2 bg-secondary-color text-white p-4 rounded-full shadow-lg animate-pulse cursor-pointer font-bold"
    >
      <h1>Чат</h1>
    </div>
    <!-- Если окно открыто, отображаем окно переписки -->
    <div v-else class="bg-white rounded-lg shadow-lg w-80">
      <div
        class="flex justify-between items-center bg-secondary-color text-white py-3 px-5 rounded-t-lg"
      >
        <span>Чат с поддержкой</span>
        <button @click="toggleOpen" class="text-white text-xl">&times;</button>
      </div>
      <div class="p-2 h-80 overflow-y-auto" ref="chatContainer">
        <div v-for="msg in messages" :key="msg.id || msg.tempId" class="mb-2">
          <div
            class="flex items-center gap-2"
            :class="
              msg.sender === 'admin' ? 'text-secondary-color' : 'text-green-600'
            "
          >
            <img
              v-if="msg.sender === 'admin'"
              src="https://www.meinberg.de/images/icons/svg/blue/user_headset.svg"
              alt="client"
              class="w-8 h-8 rounded-full object-cover border"
            />
            <img
              v-if="msg.sender === 'client'"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
              alt="client"
              class="w-8 h-8 rounded-full object-cover"
            />
            <strong
              >{{
                msg.sender === "admin" ? "Поддержка DAROM.PRO" : "Вы"
              }}:</strong
            >
          </div>
          <div class="text-sm text-black mt-1">{{ msg.content }}</div>
        </div>
        <div
          class="text-black flex items-center justify-center flex-col text-center gap-3 my-5"
          v-if="thread && thread.status === 'CLOSED'"
        >
          <h1>
            <span class="text-red-500 font-bold">Чат закрыт.</span> Чтобы начать
            новый чат нажмите «Начать новый чат»
          </h1>
          <UButton @click="goToNewChat">Начать новый чат</UButton>
        </div>
      </div>
      <div
        v-if="thread === null || (thread && thread.status === 'OPEN')"
        class="p-2 border-t"
      >
        <form @submit.prevent="send">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Ваше сообщение..."
            class="w-full border rounded p-1 focus:outline-none"
          />
          <button
            :disabled="isLoadingMessage"
            type="submit"
            class="bg-secondary-color text-white mt-2 w-full py-1 rounded-xl hover:bg-orange-700 disabled:bg-gray-300 duration-200 disabled:py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
