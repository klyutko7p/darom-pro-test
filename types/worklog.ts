interface WorkLog {
  id: number;
  userId: number;
  user: UserFourssan;
  month: string;
  data: Record<string, number>;
  createdAt: Date;
  usersId: number[];
  pvz: string;
  company: string;
}
