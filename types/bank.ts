interface Bank {
  id: number;
  name: string;
  img?: string;
  main: boolean;
  money: number;
  outgoing: Transaction[];
  incoming: Transaction[];
}
