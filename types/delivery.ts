interface IDelivery {
    id: number;
    clientLink3: string;
    name: string;
    fromName: string;
    nameOfAction: string;
    purchaseOfGoods: number;
    percentClient: number;
    amountFromClient3: number;
    dispatchPVZ: string;
    orderPVZ: string;
    sorted: Date | string;
    paid: Date | string;
    profit3: string;
    additionally: string;
    deleted: Date | string | null;
    created_at: Date | string;
    updated_at: Date | string;
    createdUser: string;
    updatedUser: string;
}