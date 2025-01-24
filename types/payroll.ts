interface IPayroll {
  id: number;
  PVZ: string;
  company: string;
  fullname: string;
  job: string;
  phone: string;
  bank: string;
  paymentPerShift: number;
  hours: number;
  advance: number;
  advanceFourssan: number;
  deductions: number;
  additionalPayment: number;
  salaryFourssan: number;
  notation?: string;
  date: Date | number | string | null;
}
