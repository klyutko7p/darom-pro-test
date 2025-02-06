import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import CryptoJS from "crypto-js";
import { useRuntimeConfig } from "#imports";

const toast = useToast();

export const useUsersFourssanStore = defineStore("users-fourssan", () => {
  const router = useRouter();

  // let userData = {} as User;

  // function getUser() {
  //   return userData;
  // }

  // async function signIn(name: string, password: string) {
  //   try {
  //     let { data }: any = await useFetch("/api/public/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         name,
  //         password,
  //       }),
  //     });

  //     if (data && data.value && !data.value.error) {
  //       userData = data.value.user;
  //       router.push("/user/main");
  //     } else {
  //       return data?.value?.error || "Unknown error";
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       console.error("Ошибка во время входа в систему:", error.message);
  //       return error.message;
  //     }
  //   }
  // }

  // async function fetchUser() {
  //   try {
  //     let { data }: any = await useFetch("/api/public/auth/me");

  //     if (data.value) {
  //       userData = data.value;
  //     } else {
  //       userData = {} as User;
  //     }
  //   } catch (error) {
  //     userData = {} as User;
  //   }
  // }

  // async function signOut() {
  //   userData = {} as User;
  //   useFetch("/api/public/logout", { method: "POST" });
  //   router.push("/user/login");
  // }

  async function getUsers() {
    try {
      const config = useRuntimeConfig();
      const encryptionKey = config.public.encryptionKeyFourssan as string;

      let { data }: any = await useFetch("/api/users-fourssan/get-users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const bytes = CryptoJS.AES.decrypt(data.value, encryptionKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      return decryptedData;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getUsers,
  };
});
