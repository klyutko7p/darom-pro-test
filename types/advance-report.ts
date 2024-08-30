interface IAdvanceReport {
    id: number;
    PVZ: string;
    date: Date | number | string | null;
    issuedUser: string;
    expenditure: string;
    typeOfExpenditure: string;
    notation: string;
    company: string;
    supportingDocuments: string;
    type: string;
    createdUser: string;
    received: Date | number | string | null;
    created_at: Date | number;
}