interface IPayroll {
    id: number;
    PVZ: string;
    company: string;
    fullname: string;
    phone: string;
    bank: string;
    paymentPerShift: number;
    hours: number;
    advance: number;
    deductions: number;
    additionalPayment: number;
    notation: string | null;
    date: Date | number | string | null;
}