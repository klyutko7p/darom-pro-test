interface MonthlyPayment {
  id: number;
  PVZ: string;
  date?: Date | string;
  expenditure: string;
  typeOfExpenditure?: string;
  notation?: string;
  company?: string;
  type?: string;
  createdUser?: string;
  created_at: Date | string;
  deleted?: Date | string;
}
