interface Ticket {
  id: number;
  clientId: number;
  client: Client;
  uniqueCode: string;
  created_at: Date | string;
}
