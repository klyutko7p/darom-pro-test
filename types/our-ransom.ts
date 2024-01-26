interface IOurRansom {
    id: number;
    old_id: number;
    clientLink1: string;
    cell: string;
    name: string;
    fromName: string;
    productLink: string;
    productName: string;
    notation: string;
    prepayment: number;
    priceSite: number;
    percentClient: number;
    deliveredKGT: number;
    amountFromClient1: number;
    dispatchPVZ: string;
    orderPVZ: string;
    orderAccount: string;
    deliveredSC: Date | number | string | null;
    deliveredPVZ: Date | number | string | null;
    issued: Date | number | string | null;
    additionally: string;
    profit1: number;
    deleted: Date | string | null;
    created_at: Date | string;
    updated_at: Date | string;
    createdUser: string;
    updatedUser: string;
}