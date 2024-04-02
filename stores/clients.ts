import Cookies from "js-cookie";
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

export const useClientsStore = defineStore("clients", () => {
  const router = useRouter();

  let userData = {} as Client;

  function getClient() {
    try {
      const user = Cookies.get("user");
      return JSON.parse(user);
    } catch (error) {
      return null;
    }
  }

  async function register(client: Client) {
    try {
      let { data }: any = await useFetch("/api/clients/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ client }),
      });
      if (data.value === undefined) {
        toast.success("Вы успешно создали аккаунт!");
        router.push("/auth/client/login");
      } else {
        toast.error(
          "Произошла ошибка при создании аккаунта! Номер уже зарегистрирован!"
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Ошибка во время регистрации:", error.message);
        return error.message;
      }
    }
  }

  async function signIn(phoneNumber: string, password: string) {
    try {
      let { data }: any = await useFetch("/api/clients/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      if (data && data.value && !data.value.error) {
        const { user, token } = data.value.data;

        userData = user;

        Cookies.set("token", token, { expires: 7 });
        Cookies.set("user", JSON.stringify(userData), { expires: 7 });

        if (userData.role === "CLIENT") {
          router.push("/client/main");
        }
      } else {
        return data?.value?.error || "Unknown error";
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Ошибка во время входа в систему:", error.message);
        return error.message;
      }
    }
  }

  async function clearCookies(phoneNumber: string, password: string) {
    const cookies = Object.keys(Cookies.get());
    cookies.forEach((cookie) => Cookies.remove(cookie));
    await localStorage.clear();
    userData = {} as Client;
    setTimeout(async () => {
      await signIn(phoneNumber, password);
    }, 2000);
  }

  async function signOut() {
    const cookies = Object.keys(Cookies.get());
    cookies.forEach((cookie) => Cookies.remove(cookie));
    localStorage.clear();
    userData = {} as Client;
    router.push("/auth/client/login");
  }

  async function getClients() {
    try {
      let { data }: any = await useFetch("/api/clients/get-clients", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function fetchSite(link: string) {
    try {
      let { data }: any = await useFetch("/api/clients/fetch-site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateClient(client: Client, flag: string) {
    try {
      let { data } = await useFetch("/api/clients/edit-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ client: client, flag: flag }),
      });

      if (data.value === "Пароли совпадают") {
        console.log(data.value);
        toast.success("Вы успешно обновили аккаунт!");
      } else if (data.value === "Пароли не совпадают") {
        console.log(data);
        toast.error("Пароли не совпадают!");
      } else {
        toast.error("Произошла ошибка при изменении аккаунта!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    updateClient,
    getClients,
    signOut,
    signIn,
    register,
    getClient,
    clearCookies,
    fetchSite,
  };
});
