import crypto from "crypto-js";
import Cookies from "js-cookie";
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
const toast = useToast();

const key = "T%t2m&v@9fN!PcK";

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

  async function signIn(
    phoneNumber: string,
    password: string,
    isForeignDevice: boolean = false
  ) {
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

        const cookieExpires = isForeignDevice ? 1 / 24 : 7;
        Cookies.set("token", token, { expires: cookieExpires });
        Cookies.set("user", JSON.stringify(userData), {
          expires: cookieExpires,
        });

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

  function encryptPhoneNumber(phoneNumber: string) {
    let encryptedPhoneNumber = crypto.AES.encrypt(phoneNumber, key).toString();
    return encryptedPhoneNumber.replace(/\+/g, "-");
  }

  function decryptPhoneNumber(encryptedPhoneNumber: string) {
    let sanitizedEncryptedPhoneNumber = encryptedPhoneNumber.replace(/-/g, "+");
    const bytes = crypto.AES.decrypt(sanitizedEncryptedPhoneNumber, key);
    return bytes.toString(crypto.enc.Utf8);
  }

  function createReferralLink(phoneNumber: string) {
    let stringEncryptPhoneNumber = encryptPhoneNumber(phoneNumber);
    let splitPhoneNumber =
      +phoneNumber[4] +
      4 +
      (+phoneNumber[3] + 3).toString() +
      (+phoneNumber[9] + 9).toString() +
      (+phoneNumber[7] + 7).toString() +
      (+phoneNumber[10] + 10).toString();
    let hashedPhoneNumber = crypto.SHA256(splitPhoneNumber);

    let referralLink = `https://soft-praline-633324.netlify.app/auth/register?ref=${hashedPhoneNumber}&q=${splitPhoneNumber}&phone=${stringEncryptPhoneNumber}`;

    return referralLink;
  }

  function compareReferralLinkNumber(phoneNumber: string, refValue: string) {
    let hashedPhoneNumber = crypto.SHA256(phoneNumber);
    if (hashedPhoneNumber.toString() === refValue) {
      return true;
    } else {
      return false;
    }
  }

  async function createReferralClient(
    referrerPhone: string,
    referredPhone: string
  ) {
    try {
      let { data }: any = await useFetch(
        "/api/clients/create-referral-client",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ referrerPhone, referredPhone }),
        }
      );
      if (data.value === undefined) {
        return;
      } else {
        toast.error("Произошла ошибка при привязке аккаунтов!");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Ошибка во время привязки:", error.message);
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

  async function getClientById(id: number) {
    try {
      let { data }: any = await useFetch("/api/clients/get-client-by-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getClientsByReferrer(phoneNumber: string) {
    try {
      let { data }: any = await useFetch(
        "/api/clients/get-clients-by-referrer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber }),
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function fetchSiteWB(link: string) {
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

  async function fetchSiteOZ(link: string) {
    try {
      let { data }: any = await useFetch("/api/clients/fetch-site-oz", {
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

  async function fetchSiteYM(link: string) {
    try {
      let { data }: any = await useFetch("/api/clients/fetch-site-ym", {
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

  async function fetchSitePrice(link: string) {
    try {
      let { data }: any = await useFetch("/api/clients/fetch-site-price", {
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

  async function updateBalanceStatus(phoneNumber: string) {
    try {
      let { data } = await useFetch("/api/clients/update-status-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateBalance(phoneNumber: string, balance: number) {
    try {
      let { data } = await useFetch("/api/clients/edit-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, balance }),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function sendMessage(phoneNumber: string) {
    try {
      let { data } = await useFetch("/api/clients/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });
      return data;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function updateBalanceSum(id: number, balance: number) {
    try {
      let { data } = await useFetch("/api/clients/update-sum-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, balance }),
      });
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
      } else if (data.value === "Введённый прошлый пароль не совпадает!") {
        console.log(data);
        toast.error("Введённый прошлый пароль не совпадает!");
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
    fetchSiteWB,
    fetchSiteOZ,
    fetchSitePrice,
    fetchSiteYM,
    createReferralLink,
    compareReferralLinkNumber,
    createReferralClient,
    decryptPhoneNumber,
    encryptPhoneNumber,
    getClientsByReferrer,
    updateBalanceStatus,
    updateBalanceSum,
    getClientById,
    updateBalance,
    sendMessage
  };
});
