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

  async function updateDpStatus() {
    try {
      let data = await useFetch("/api/ransom/update-dp-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
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
          if (row.percentClient == 0) {
            row.profit1 = +row.deliveredKGT;
          } else {
            row.profit1 =
              +row.amountFromClient1 - +row.priceSite + +row.deliveredKGT;
          }
        } else if (
          roundToNearestTen(
            +row.priceSite + (+row.priceSite * +row.percentClient) / 100
          ) -
            row.prepayment !==
          0
        ) {
          row.amountFromClient1 = Math.ceil(
            +row.priceSite +
              (+row.priceSite * +row.percentClient) / 100 -
              +row.prepayment
          );
          if (row.percentClient == 0) {
            row.profit1 = +row.deliveredKGT;
          } else {
            row.profit1 = +row.prepayment - +row.priceSite;
          }
        } else if (
          roundToNearestTen(
            row.priceSite + (+row.priceSite * +row.percentClient) / 100
          ) -
            row.prepayment ===
          0
        ) {
          row.amountFromClient1 = 0;
          if (row.percentClient == 0) {
            row.profit1 = +row.deliveredKGT;
          } else {
            row.profit1 = +row.prepayment - +row.priceSite;
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
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
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

  async function getRansomRowsByFromNameWithoutCellOurRansom(
    fromName: string | string[]
  ) {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-by-fromname-without-cell-or",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fromName }),
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsByFromNameWithoutCellClientRansom(
    fromName: string | string[]
  ) {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-by-fromname-without-cell-cl",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fromName }),
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
      let response = await fetch("/api/ransom/get-rows-by-pvz", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: JSON.stringify({ PVZ: PVZ, flag: flag }),
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsByPVZInventory(PVZ: string | string[]) {
    try {
      let { data }: any = await useFetch(
        "/api/ransom/get-rows-by-pvz-inventory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ PVZ }),
        }
      );
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getDeletedRansomRowsByPVZ(
    PVZ: string | string[],
    flag: string
  ) {
    try {
      let response = await fetch("/api/ransom/get-rows-by-pvz-deleted", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: JSON.stringify({ PVZ: PVZ, flag: flag }),
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getDeletedRansomRowsByPVZPartOne(
    PVZ: string | string[],
    flag: string
  ) {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-by-pvz-deleted-part-one",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: JSON.stringify({ PVZ: PVZ, flag: flag }),
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getDeletedRansomRowsByPVZPartTwo(
    PVZ: string | string[],
    flag: string
  ) {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-by-pvz-deleted-part-two",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: JSON.stringify({ PVZ: PVZ, flag: flag }),
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
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
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForModalOurRansomPartOne() {
    try {
      let response = await fetch("/api/ransom/get-rows-for-modal-or-part-one", {
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

  async function getRansomRowsForModalOurRansomPartTwo() {
    try {
      let response = await fetch("/api/ransom/get-rows-for-modal-or-part-two", {
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

  async function getRansomRowsForModalOurRansomPartThree() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-modal-or-part-three",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer));
      return unpacked.map(mapBackToOriginalFields);
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

  async function getRansomRowsForBalanceOurRansomPartOne() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-balance-or-part-one",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceOurRansomPartTwo() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-balance-or-part-two",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceOurRansomPartThree() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-balance-or-part-three",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceOurRansomPartFour() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-balance-or-part-four",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceOurRansomPartFive() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-balance-or-part-five",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceOurRansomPartSix() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-balance-or-part-six",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceOurRansomPartSeven() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-balance-or-part-seven",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForBalanceOurRansomPartEight() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-balance-or-part-eight",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  function mapBackToOriginalFields(row: any) {
    const originalRow = {} as IOurRansom;

    if (row.id !== undefined) originalRow.id = row.id;
    if (row.cl !== undefined) originalRow.clientLink1 = row.cl;
    if (row.pl !== undefined) originalRow.productLink = row.pl;
    if (row.pn !== undefined) originalRow.productName = row.pn;
    if (row.oa !== undefined) originalRow.orderAccount = row.oa;
    if (row.cu !== undefined) originalRow.createdUser = row.cu;
    if (row.uu !== undefined) originalRow.updatedUser = row.uu;
    if (row.fm !== undefined) originalRow.fromName = row.fm;
    if (row.nt !== undefined) originalRow.notation = row.nt;
    if (row.dpz !== undefined) originalRow.dispatchPVZ = row.dpz;
    if (row.dp !== undefined) originalRow.dp = row.dp;
    if (row.ds !== undefined) originalRow.deliveredSC = row.ds;
    if (row.dz !== undefined) originalRow.deliveredPVZ = row.dz;
    if (row.oz !== undefined) originalRow.orderPVZ = row.oz;
    if (row.pp !== undefined) originalRow.prepayment = row.pp;
    if (row.ad !== undefined) originalRow.additionally = row.ad;
    if (row.dk !== undefined) originalRow.deliveredKGT = row.dk;
    if (row.ac !== undefined) originalRow.amountFromClient1 = row.ac;
    if (row.i !== undefined) originalRow.issued = row.i;
    if (row.p !== undefined) originalRow.priceSite = row.p;
    if (row.d !== undefined) originalRow.deleted = row.d;
    if (row.c !== undefined) originalRow.created_at = row.c;
    if (row.u !== undefined) originalRow.updated_at = row.u;
    if (row.cc !== undefined) originalRow.cell = row.cc;
    if (row.pc !== undefined) originalRow.percentClient = row.pc;
    if (row.v !== undefined) originalRow.verified = row.v;
    if (row.pr !== undefined) originalRow.priceRefund = row.pr;
    if (row.pf1 !== undefined) originalRow.profit1 = row.pf1;

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
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
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

  async function getRansomRowsByIds(idRows: number[]) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-rows-by-ids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idRows }),
      });
      return data.value;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowById(id: number, flag: string) {
    try {
      let { data }: any = await useFetch("/api/ransom/get-row-by-id", {
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
        if (!row.deliveredKGT) row.deliveredKGT = 0;
        if (!row.productName) row.productName = "";
        if (!row.prepayment) row.prepayment = 0;

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
        } else if (row.additionally === "Отказ подмена") {
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
        }
      } else if (flag === "ClientRansom") {
        if (row.percentClient === undefined) row.percentClient = 10;
        if (row.priceProgram === undefined || row.priceProgram === 0)
          row.priceProgram = 0;
        if (!row.deliveredKGT) row.deliveredKGT = 0;
        if (!row.productName) row.productName = "";
        if (!row.prepayment) row.prepayment = 0;

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

        let status = "";
        if (flag === "additionally") {
          status = "Заказ выдан";
        } else if (flag === "additionally1-1") {
          status = "Отказ проведён";
        } else if (flag === "additionally1-2") {
          status = "Отказ проведён";
        } else if (flag === "additionally2") {
          status = "Отказ проведён";
        } else if (flag === "additionally3") {
          status = "Заказ выдан";
        } else if (flag === "additionally4") {
          status = "Отказ проведён";
        }

        announce(`${status}`);
      } else {
        console.log(data.data.value);
        toast.error("Произошла ошибка");
        announce(`Ошибка выдачи`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        announce(`Ошибка выдачи`);
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

  async function clearRansomRow(id: number, flag: string) {
    try {
      let data = await useFetch("/api/ransom/clear-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, flag }),
      });
      if (data.data.value === undefined) {
        toast.success("Запись успешно очищена!");
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

  async function deleteNotSortedRows() {
    try {
      let data = await useFetch("/api/ransom/delete-not-sorted-rows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (data.data.value === undefined) {
        toast.success("Необработанные записи успешно удалены!");
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

  async function getRansomRowsForAdvanceReportOurRansomNewPartOne() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-advance-report-or-new-part-one",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForAdvanceReportOurRansomNewPartTwo() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-advance-report-or-new-part-two",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForAdvanceReportOurRansomPartOne() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-advance-report-or-part-one",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForAdvanceReportOurRansomPartTwo() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-advance-report-or-part-two",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getRansomRowsForAdvanceReportOurRansomPartThree() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-advance-report-or-part-three",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  async function getAllSumDirector() {
    try {
      const { data }: any = await useFetch(
        "/api/advance-report/get-sum-director",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data.value;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  }

  async function getRansomRowsForAdvanceReportOurRansomPartFour() {
    try {
      let response = await fetch(
        "/api/ransom/get-rows-for-advance-report-or-part-four",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked.map(mapBackToOriginalFields);
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

  async function getUniqueNonEmptyValuesQuery(fieldName: string) {
    try {
      let response = await fetch("/api/ransom/get-unique-values", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: JSON.stringify({ fieldName }),
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  function announce(message: string) {
    const speech = new SpeechSynthesisUtterance(message);

    // Функция для установки нужного голоса и воспроизведения речи
    function setVoiceAndSpeak() {
      const voices = window.speechSynthesis.getVoices();
      // Ищем голос, в имени которого содержится "Microsoft Pavel"
      const selectedVoice = voices.find((voice) => {
        return voice.name.includes("Microsoft Pavel");
      });

      if (selectedVoice) {
        speech.voice = selectedVoice;
      } else {
        console.warn(
          "Голос 'Microsoft Pavel' не найден. Будет использован голос по умолчанию."
        );
      }

      speech.lang = "ru-RU";
      speech.pitch = 1;
      speech.rate = 1;

      window.speechSynthesis.speak(speech);
    }

    // Если голоса ещё не загружены, дождёмся события voiceschanged
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        setVoiceAndSpeak
      );
    } else {
      setVoiceAndSpeak();
    }
  }

  async function getRowsFilters(
    selectedCell: string[],
    selectedFromName: string[],
    selectedDispatchPVZ: string[],
    selectedOrderPVZ: string[],
    selectedOrderAccount: string[],
    selectedNotation: string[],
    selectedCreatedUser: string[],
    selectedAdditionally: string[],
    selectedPriceSite: string[],
    startDate: Date | string,
    endDate: Date | string,
    startDate2: Date | string,
    endDate2: Date | string,
    startDate3: Date | string,
    endDate3: Date | string,
    startDate4: Date | string,
    endDate4: Date | string
  ) {
    try {
      let response = await fetch("/api/ransom/get-rows-filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: JSON.stringify({
          selectedCell,
          selectedFromName,
          selectedDispatchPVZ,
          selectedOrderPVZ,
          selectedOrderAccount,
          selectedNotation,
          selectedCreatedUser,
          selectedAdditionally,
          selectedPriceSite,
          startDate,
          endDate,
          startDate2,
          endDate2,
          startDate3,
          endDate3,
          startDate4,
          endDate4,
        }),
      });

      const arrayBuffer = await response.arrayBuffer();
      const unpacked = msgpack.decode(new Uint8Array(arrayBuffer)) as any;
      return unpacked;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return {
    getRowsFilters,
    getRansomRowsForBalanceOurRansomPartOne,
    getRansomRowsForBalanceOurRansomPartTwo,
    getRansomRowsForBalanceOurRansomPartThree,
    getUniqueNonEmptyValuesQuery,
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
    getRansomRowsByPVZ,
    getRansomRowsByFromName,
    getSumOfRejection,
    updateSumOfRejection,
    getRansomRowById,
    getRansomRowsWithDeleted,
    getRansomRowsRefunds,
    getRansomRowsForUpdateCells,
    getRansomRowsByFromNameWithoutCellOurRansom,
    getRansomRowsByFromNameWithoutCellClientRansom,
    getRansomRowsForBalanceClientRansom,
    getRansomRowsForBalanceDelivery,
    getRansomRowsForModalOurRansom,
    getRansomRowsForModalClientRansom,
    getRansomRowsForModalOurRansomPartOne,
    getRansomRowsForModalOurRansomPartTwo,
    getRansomRowsForModalOurRansomPartThree,
    getRansomRowsWithDeletedForCellsOurRansom,
    getRansomRowsWithPVZOurRansom,
    getRansomRowsOurRansom,
    getRansomRowsForAdvanceReportOurRansomPartOne,
    getRansomRowsForAdvanceReportOurRansomPartTwo,
    getRansomRowsForAdvanceReportOurRansomPartThree,
    getDeletedRansomRowsByPVZ,
    clearRansomRow,
    deleteNotSortedRows,
    getRansomRowsForBalanceOurRansomPartFour,
    getRansomRowsForBalanceOurRansomPartFive,
    getRansomRowsForBalanceOurRansomPartSix,
    getRansomRowsForBalanceOurRansomPartSeven,
    getRansomRowsForBalanceOurRansomPartEight,
    getRansomRowsByPVZInventory,
    announce,
    generateLink,
    getRansomRowsByIds,
    getDeletedRansomRowsByPVZPartOne,
    getDeletedRansomRowsByPVZPartTwo,
    updateDpStatus,
    getRansomRowsForAdvanceReportOurRansomPartFour,
    getAllSumDirector,
    getRansomRowsForAdvanceReportOurRansomNewPartOne,
    getRansomRowsForAdvanceReportOurRansomNewPartTwo,
  };
});
