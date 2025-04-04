import { PrismaClient } from "@prisma/client";
import { raw } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

interface IRequestBody {
  idArray: number[];
  flag: string;
  flagRansom: string;
  username: string;
  sumOfReject: number;
}

function getAdditionally(status: string) {
  if (status === "additionally") {
    return "Оплачено онлайн";
  } else if (status === "additionally1-1") {
    return "Отказ клиент онлайн";
  } else if (status === "additionally1-2") {
    return "Отказ клиент наличные";
  } else if (status === "additionally2") {
    return "Отказ брак";
  } else if (status === "additionally3") {
    return "Оплата наличными";
  } else if (status === "additionally4") {
    return "Отказ подмена";
  }
}

function getPaid(status: string) {
  if (status === "paid1") {
    return "Оплачено онлайн";
  } else if (status === "paid2") {
    return "Оплачено наличными";
  }
}

function getAmountFromClient(status: string, sumOfRejectValue: any) {
  if (status === "additionally") {
    // return "Онлайн";
    return;
  } else if (status === "additionally1-1") {
    return sumOfRejectValue.value;
  } else if (status === "additionally1-2") {
    return sumOfRejectValue.value;
  } else if (status === "additionally2") {
    return 0;
  } else if (status === "additionally3") {
    return;
  } else if (status === "additionally4") {
    return 0;
  }
}

function getProfit(status: string, sumOfRejectValue: any) {
  if (status === "additionally") {
    return;
  } else if (status === "additionally1-1") {
    return sumOfRejectValue.value;
  } else if (status === "additionally1-2") {
    return sumOfRejectValue.value;
  } else if (status === "additionally2") {
    return 0;
  } else if (status === "additionally3") {
    return;
  } else if (status === "additionally4") {
    return 0;
  }
}

export default defineEventHandler(async (event) => {
  try {
    const { idArray, flag, flagRansom, username, sumOfReject } =
      await readBody<IRequestBody>(event);

    const currentAmountFromClient1Array = await prisma.ourRansom.findMany({
      where: {
        id: {
          in: idArray,
        },
      },
      select: {
        id: true,
        amountFromClient1: true,
      },
    });

    let updateField;

    switch (flag) {
      case "SC":
        updateField = "deliveredSC";
        break;
      case "PVZ":
        updateField = "deliveredPVZ";
        break;
      case "issued":
        updateField = "issued";
        break;
      case "sorted":
        updateField = "sorted";
        break;
      case "paid":
        updateField = "paid";
      case "paid1":
        updateField = "paid";
      case "paid2":
        updateField = "paid";
        break;
      case "additionally":
        updateField = "additionally";
        break;
      case "additionally1-1":
        updateField = "additionally";
        break;
      case "additionally1-2":
        updateField = "additionally";
        break;
      case "additionally2":
        updateField = "additionally";
        break;
      case "additionally3":
        updateField = "additionally";
        break;
      case "additionally4":
        updateField = "additionally";
        break;
      case "shipped":
        updateField = "shipped";
        break;
      case "verified":
        updateField = "verified";
        break;
      default:
        throw new Error(`Unsupported flag: ${flag}`);
    }

    if (
      flagRansom === "OurRansom" &&
      updateField !== "additionally" &&
      updateField !== "verified" &&
      updateField !== "shipped"
    ) {
      const updateRow = await prisma.ourRansom.updateMany({
        where: {
          id: {
            in: idArray,
          },
        },
        data: {
          [updateField]: new Date(),
          updatedUser: username,
        },
      });
    } else if (flagRansom === "OurRansom" && updateField === "additionally") {
      for (const element of currentAmountFromClient1Array) {
        const updateRow = await prisma.ourRansom.updateMany({
          where: {
            id: {
              equals: element.id,
            },
          },
          data: {
            additionally: getAdditionally(flag),
            issued: new Date(),
            // amountFromClient1: {
            //   set: getAmountFromClient(flag, sumOfReject) !== "Онлайн"
            //     ? getAmountFromClient(flag, sumOfReject)
            //     : element.amountFromClient1 * 1.02,
            // },
            amountFromClient1: getAmountFromClient(flag, sumOfReject),
            profit1: getProfit(flag, sumOfReject),
            updatedUser: username,
          },
        });
      }
    } else if (flagRansom === "OurRansom" && updateField === "shipped") {
      const updateRow = await prisma.ourRansom.updateMany({
        where: {
          id: {
            in: idArray,
          },
        },
        data: {
          shipped: new Date(),
          shippedUser: username,
        },
      });
    } else if (flagRansom === "OurRansom" && updateField === "verified") {
      const updateRow = await prisma.ourRansom.updateMany({
        where: {
          id: {
            in: idArray,
          },
        },
        data: {
          verified: new Date(),
          verifiedUser: username,
        },
      });
    } else if (
      flagRansom === "ClientRansom" &&
      updateField !== "additionally"
    ) {
      const updateRow = await prisma.clientRansom.updateMany({
        where: {
          id: {
            in: idArray,
          },
        },
        data: {
          [updateField]: new Date(),
          updatedUser: username,
        },
      });
    } else if (
      flagRansom === "ClientRansom" &&
      updateField === "additionally"
    ) {
      const updateRow = await prisma.clientRansom.updateMany({
        where: {
          id: {
            in: idArray,
          },
        },
        data: {
          additionally: getAdditionally(flag),
          issued: new Date(),
          amountFromClient2: getAmountFromClient(flag, sumOfReject),
          profit2: getProfit(flag, sumOfReject),
          updatedUser: username,
        },
      });
    } else if (flagRansom === "Delivery" && updateField === "paid") {
      const updateRow = await prisma.delivery.updateMany({
        where: {
          id: {
            in: idArray,
          },
        },
        data: {
          paid: new Date(),
          additionally: getPaid(flag),
          updatedUser: username,
        },
      });
    } else if (flagRansom === "Delivery" && updateField !== "paid") {
      const updateRow = await prisma.delivery.updateMany({
        where: {
          id: {
            in: idArray,
          },
        },
        data: {
          [updateField]: new Date(),
          updatedUser: username,
        },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
