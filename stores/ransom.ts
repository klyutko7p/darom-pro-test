import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import crypto from "crypto-js";
import * as msgpack from "@msgpack/msgpack";
const toast = useToast();

function generateLink(phoneNumber: string, flag: string) {
  const formattedPhoneNumber = phoneNumber.replace("+", "").replace(" ", "");

  const hash = crypto.SHA256(formattedPhoneNumber).toString();

  let link = "";

  if (flag === "OurRansom") {
    link = `1-${hash}`;
  } else if (flag === "ClientRansom") {
    link = `2-${hash}`;
  } else if (flag === "Delivery") {
    link = `3-${hash}`;
  }
  return link;
}

export const useRansomStore = defineStore("ransom", () => {
  let cachedSumOfRejection: any = null;

  async function getSumOfRejection() {
    if (cachedSumOfRejection) {
      return cachedSumOfRejection;
    } else {
      try {
        const { data }: any = await useFetch("/api/sum-of-rejection/get-sum", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        cachedSumOfRejection = data.value;
        return cachedSumOfRejection;
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An error occurred while fetching the sum of rejection.");
        }
        throw error;
      }
    }
  }

  async function updateSumOfRejection(sumOfRejection: any) {
    try {
      let data = await useFetch("/api/sum-of-rejection/edit-sum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sumOfRejection: sumOfRejection }),
      });
      cachedSumOfRejection = null;
      toast.success("Сумма успешно обновлена!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function createCopyRow(id: number, flag: string) {
    try {
      let data = await useFetch("/api/ransom/create-copy-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, flag: flag }),
      });

      if (data.data.value === undefined) {
        toast.success("Запись успешно скопирована!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function createRansomRow(row: any, username: string, flag: string) {
    try {
      if (flag === "OurRansom") {
        if (row.percentClient === undefined) row.percentClient = 10;
        if (row.priceSite === undefined) row.priceSite = 0;
        if (row.deliveredKGT === undefined) row.deliveredKGT = 0;
        if (row.productName === undefined) row.productName = "";
        if (row.prepayment === undefined) row.prepayment = 0;
        if (row.quantity === undefined) row.quantity = 1;

        row.createdUser = username;
        row.updatedUser = username;

        if (row.fromName) {
          row.clientLink1 = generateLink(row.fromName, "OurRansom");
        } else {
          row.clientLink1 = "";
        }

        if (row.priceSite > row.prepayment) {
          row.amountFromClient1 = Math.ceil(
            +row.priceSite +
              (+row.priceSite * +row.percentClient) / 100 -
              +row.prepayment
          );
          row.profit1 =
            +row.amountFromClient1 - +row.priceSite + +row.deliveredKGT;
        } else if (
          roundToNearestTen(
            row.priceSite + (row.priceSite * row.percentClient) / 100
          ) -
            row.prepayment !==
          0
        ) {
          row.amountFromClient1 = Math.ceil(
            row.priceSite +
              (row.priceSite * row.percentClient) / 100 -
              row.prepayment
          );
          if (row.percentClient == 0) {
            row.profit1 = row.deliveredKGT;
          } else {
            row.profit1 = row.prepayment - row.priceSite;
          }
        } else if (
          roundToNearestTen(
            row.priceSite + (row.priceSite * row.percentClient) / 100
          ) -
            row.prepayment ===
          0
        ) {
          row.amountFromClient1 = 0;
          if (row.percentClient == 0) {
            row.profit1 = row.deliveredKGT;
          } else {
            row.profit1 = row.prepayment - row.priceSite;
          }
        }
      } else if (flag === "ClientRansom") {
        if (row.percentClient === undefined) row.percentClient = 10;
        if (row.priceProgram === undefined) row.priceProgram = 0;
        if (row.deliveredKGT === undefined) row.deliveredKGT = 0;
        if (row.productName === undefined) row.productName = "";
        if (row.prepayment === undefined) row.prepayment = 0;

        row.createdUser = username;
        row.updatedUser = username;

        if (row.fromName) {
          row.clientLink2 = generateLink(row.fromName, "ClientRansom");
        } else {
          row.clientLink2 = "";
        }

        row.amountFromClient2 =
          (row.priceProgram * row.percentClient) / 100 - row.prepayment;
        row.profit2 = row.amountFromClient2 + row.prepayment;
      } else if (flag === "Delivery") {
        if (row.percentClient === undefined) row.percentClient = 2;
        if (row.percentClient2 === undefined) row.percentClient2 = 2;
        if (row.purchaseOfGoods === undefined) row.purchaseOfGoods = 0;
        if (row.purchaseOfGoods2 === undefined) row.purchaseOfGoods2 = 0;
        if (row.nameOfAction === undefined) row.nameOfAction = "";

        row.createdUser = username;
        row.updatedUser = username;

        if (row.fromName) {
          row.clientLink3 = generateLink(row.fromName, "Delivery");
        } else {
          row.clientLink3 = "";
        }

        row.amountFromClient3 = Math.ceil(
          (row.purchaseOfGoods * row.percentClient) / 100
        );
        row.profit3 = row.amountFromClient3;
      }

      if (row.fromName.includes("+7")) {
        let data = await useFetch("/api/ransom/create-row", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ row: row, flag: flag }),
        });
        if (data.data.value === undefined) {
          toast.success("Запись успешно создана!");
        } else {
          console.log(data.data.value);
          toast.error("Произошла ошибка при создании записи");
        }
      } else {
        toast.error("Некорректный формат записи номера телефона (+7)");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRows(flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsOurRansom() {
    try {
      let response = await fetch("/api/ransom/get-rows-or", {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForUpdateCells(flag: string) {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-for-update-cells",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ flag: flag }),
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsWithPVZ(flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-with-pvz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsWithPVZOurRansom() {
    try {
      let response = await fetch("/api/ransom/get-rows-with-pvz-or", {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsByFromName(
    fromName: string | string[],
    cell: string | string[],
    flag: string
  ) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-by-fromname", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromName: fromName, cell: cell, flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsByFromNameWithoutCell(
    fromName: string | string[],
    flag: string
  ) {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-by-fromname-without-cell",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fromName, flag }),
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsByPVZ(PVZ: string | string[], flag: string) {
    try {
      // let { data }: any = await useFetch("/api/ransom/get-rows-by-pvz", {
      //   method: "POST",
      //   body: JSON.stringify({ PVZ: PVZ, flag: flag }),
      // });
      // return JSON.parse(data.value);

      let response = await fetch("/api/ransom/get-rows-by-pvz", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: JSON.stringify({ PVZ: PVZ, flag: flag }),
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForModal(flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-for-modal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForModalOurRansom() {
    try {
      let response = await fetch("/api/ransom/get-rows-for-modal-or", {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForModalClientRansom() {
    try {
      let response = await fetch("/api/ransom/get-rows-for-modal-cl", {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceOurRansom() {
    try {
      let response = await fetch("/api/ransom/get-rows-for-balance-or", {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  function mapBackToOriginalFields(row: IOurRansom) {
    const originalRow = {};

    if (row.dp !== undefined) originalRow.dispatchPVZ = row.dp;
    if (row.pp !== undefined) originalRow.prepayment = row.pp;
    if (row.ad !== undefined) originalRow.additionally = row.ad;
    if (row.dk !== undefined) originalRow.deliveredKGT = row.dk;
    if (row.ac !== undefined) originalRow.amountFromClient1 = row.ac;
    if (row.is !== undefined) originalRow.issued = row.is;
    if (row.ps !== undefined) originalRow.priceSite = row.ps;
    if (row.del !== undefined) originalRow.deleted = row.del;
    if (row.ca !== undefined) originalRow.created_at = row.ca;

    return originalRow;
  }

  async function getRansomRowsForBalanceClientRansom() {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-for-balance-cl",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceDelivery() {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-for-balance-dl",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsWithDeleted(flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-with-deleted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsWithDeletedForCells(flag: string) {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-with-deleted-for-cells",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ flag: flag }),
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsWithDeletedForCellsOurRansom() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-with-deleted-for-cells-or",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsFirstHundred(flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-first-hundred", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsByLink(link: string, flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-by-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: link, flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsById(id: number, flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-by-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  function roundToNearestTen(num: number): number {
    const lastDigit = num % 10;
    if (lastDigit >= 5) {
      return Math.ceil(num / 10) * 10;
    } else {
      return Math.floor(num / 10) * 10;
    }
  }

  async function updateRansomRow(row: any, username: string, flag: string) {
    try {
      if (flag === "OurRansom") {
        if (row.percentClient === undefined) row.percentClient = 10;
        if (row.priceSite === undefined || row.priceSite === 0)
          row.priceSite = 0;
        if (
          row.deliveredKGT === undefined ||
          row.deliveredKGT === 0 ||
          row.deliveredKGT === ""
        )
          row.deliveredKGT = 0;
        if (row.productName === undefined || row.productName === "")
          row.productName = "";
        if (row.prepayment === undefined) row.prepayment = 0;

        row.updatedUser = username;
        row.updated_at = new Date().toISOString();

        if (row.fromName) {
          row.clientLink1 = generateLink(row.fromName, "OurRansom");
        } else {
          row.clientLink1 = "";
        }

        if (
          row.additionally === "Отказ клиент наличные" ||
          row.additionally === "Отказ клиент онлайн" ||
          row.additionally === "Отказ клиент"
        ) {
          row.amountFromClient1 = cachedSumOfRejection.value;
          row.profit1 = cachedSumOfRejection.value;
        } else if (row.additionally === "Отказ брак") {
          row.amountFromClient1 = 0;
          row.profit1 = 0;
        } else {
          if (row.priceSite > row.prepayment) {
            row.amountFromClient1 = Math.ceil(
              row.priceSite +
                (row.priceSite * row.percentClient) / 100 -
                row.prepayment
            );
            if (row.percentClient == 0) {
              row.profit1 = row.deliveredKGT;
            } else {
              row.profit1 =
                row.amountFromClient1 - row.priceSite + row.deliveredKGT;
            }
          } else if (
            roundToNearestTen(
              row.priceSite + (row.priceSite * row.percentClient) / 100
            ) -
              row.prepayment !==
            0
          ) {
            console.log(roundToNearestTen(
              row.priceSite + (row.priceSite * row.percentClient) / 100
            ) -
              row.prepayment);
            row.amountFromClient1 = Math.ceil(
              row.priceSite +
                (row.priceSite * row.percentClient) / 100 -
                row.prepayment
            );
            if (row.percentClient == 0) {
              row.profit1 = row.deliveredKGT;
            } else {
              row.profit1 = row.prepayment - row.priceSite;
            }
          } else if (
            roundToNearestTen(
              row.priceSite + (row.priceSite * row.percentClient) / 100
            ) -
              row.prepayment ===
            0
          ) {
            console.log(roundToNearestTen(
              row.priceSite + (row.priceSite * row.percentClient) / 100
            ) -
              row.prepayment);
            row.amountFromClient1 = 0;
            if (row.percentClient == 0) {
              row.profit1 = row.deliveredKGT;
            } else {
              row.profit1 = row.prepayment - row.priceSite;
            }
          }
        }
      } else if (flag === "ClientRansom") {
        if (row.percentClient === undefined) row.percentClient = 10;
        if (row.priceProgram === undefined || row.priceProgram === 0)
          row.priceProgram = 0;
        if (
          row.deliveredKGT === undefined ||
          row.deliveredKGT === 0 ||
          row.deliveredKGT === ""
        )
          row.deliveredKGT = 0;
        if (row.productName === undefined || row.productName === "")
          row.productName = "";
        if (row.prepayment === undefined) row.prepayment = 0;

        row.updatedUser = username;
        row.updated_at = new Date().toISOString();

        if (row.fromName) {
          row.clientLink2 = generateLink(row.fromName, "ClientRansom");
        } else {
          row.clientLink2 = "";
        }

        row.amountFromClient2 =
          Math.ceil(
            Math.ceil(
              (row.priceProgram * row.percentClient) / 100 - row.prepayment
            ) / 10
          ) * 10;
        row.profit2 = row.amountFromClient2 + row.prepayment;
      } else if (flag === "Delivery") {
        if (row.percentClient === undefined) row.percentClient = 2;
        if (row.purchaseOfGoods === undefined) row.purchaseOfGoods = 0;
        if (row.nameOfAction === undefined) row.nameOfAction = "";

        row.createdUser = username;
        row.updatedUser = username;

        if (row.fromName) {
          row.clientLink3 = generateLink(row.fromName, "Delivery");
        } else {
          row.clientLink3 = "";
        }

        row.amountFromClient3 = Math.ceil(
          (row.purchaseOfGoods * row.percentClient) / 100
        );
        row.profit3 = row.amountFromClient3;
      }

      // if (row.fromName.includes('+7')) {
      //     let data = await useFetch('/api/ransom/edit-row', {
      //         method: 'POST',
      //         headers: {
      //             'Content-Type': 'application/json',
      //         },
      //         body: JSON.stringify({ row: row, flag: flag }),
      //     })
      //     toast.success("Запись успешно обновлена!")
      // } else {
      //     toast.error("Неправильный формат записи телефона!")
      // }

      let data = await useFetch("/api/ransom/edit-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row: row, flag: flag }),
      });

      if (data.data.value === undefined) {
        toast.success("Запись успешно обновлена!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка при обновлении записи!");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      }
    }
  }

  async function updateDeliveryStatus(
    row: IOurRansom | IClientRansom | IDelivery,
    flag: string,
    flagRansom: string,
    username: string
  ) {
    try {
      let data = await useFetch("/api/ransom/update-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          row: row,
          flag: flag,
          flagRansom: flagRansom,
          username: username,
        }),
      });
      if (data.data.value === undefined) {
        toast.success("Доставка успешно обновлена!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      }
    }
  }

  async function updateDeliveryRowsStatus(
    idArray: number[],
    flag: string,
    flagRansom: string,
    username: string
  ) {
    try {
      let data = await useFetch("/api/ransom/update-rows-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idArray: idArray,
          flag: flag,
          flagRansom: flagRansom,
          username: username,
          sumOfReject: cachedSumOfRejection,
        }),
      });
      if (data.data.value === undefined) {
        toast.success("Доставка у записей успешно обновлена!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteRansomRow(id: number, flag: string) {
    try {
      let data = await useFetch("/api/ransom/delete-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, flag: flag }),
      });
      if (data.data.value === undefined) {
        toast.success("Запись успешно удалена!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteIssuedRows(flag: string) {
    try {
      let data = await useFetch("/api/ransom/delete-issued-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flag: flag }),
      });
      if (data.data.value === undefined) {
        toast.success("Записи успешно удалены!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function deleteRansomSelectedRows(idArray: number[], flag: string) {
    try {
      let data = await useFetch("/api/ransom/delete-selected-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idArray: idArray, flag: flag }),
      });
      if (data.data.value === undefined) {
        toast.success("Записи успешно удалены!");
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRow(id: number, flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getOldRansomRow(old_id: number, flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-old-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ old_id: old_id, flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsRefunds(flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flag: flag }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForAdvanceReport(flag: string) {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-for-advance-report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ flag: flag }),
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForAdvanceReportOurRansom() {
    try {
      let response = await fetch("/api/ransom/get-rows-for-advance-report-or", {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  const getUniqueNonEmptyValues = (
    rows: IOurRansom[] | IClientRansom[] | IDelivery[],
    fieldName: keyof IOurRansom | IClientRansom | IDelivery
  ): string[] => {
    const uniqueNonEmptyValues = new Set<string>();
    rows.forEach((row) => {
      const value = row[fieldName];
      if (value !== "" && value !== null && value !== undefined) {
        uniqueNonEmptyValues.add(value);
      }
    });
    return Array.from(uniqueNonEmptyValues);
  };

  return {
    createRansomRow,
    getRansomRows,
    updateRansomRow,
    deleteRansomRow,
    updateDeliveryStatus,
    getUniqueNonEmptyValues,
    getRansomRow,
    deleteRansomSelectedRows,
    getRansomRowsByLink,
    updateDeliveryRowsStatus,
    createCopyRow,
    deleteIssuedRows,
    getOldRansomRow,
    getRansomRowsByPVZ,
    getRansomRowsByFromName,
    getSumOfRejection,
    updateSumOfRejection,
    getRansomRowsById,
    getRansomRowsWithPVZ,
    getRansomRowsForModal,
    getRansomRowsWithDeleted,
    getRansomRowsFirstHundred,
    getRansomRowsWithDeletedForCells,
    getRansomRowsRefunds,
    getRansomRowsForAdvanceReport,
    getRansomRowsForUpdateCells,
    getRansomRowsByFromNameWithoutCell,
    getRansomRowsForBalanceOurRansom,
    getRansomRowsForBalanceClientRansom,
    getRansomRowsForBalanceDelivery,
    getRansomRowsForModalOurRansom,
    getRansomRowsForModalClientRansom,
    getRansomRowsWithDeletedForCellsOurRansom,
    getRansomRowsWithPVZOurRansom,
    getRansomRowsOurRansom,
    getRansomRowsForAdvanceReportOurRansom,
  };
});
