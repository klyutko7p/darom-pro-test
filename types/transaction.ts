interface Transaction {
  id: number;
  fromBankId: number;
  fromBank: Bank;
  toBankId: number;
  toBank: Bank;
  sum: number;
  created_at: Date | number;
  createdUser: string;
  type: string;
  idRow?: number;
}
