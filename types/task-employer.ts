interface TaskEmployer {
  id: number; // Автоинкремент
  title: string;
  description?: string; // Опционально
  doneDate?: Date; // Опционально, дата выполнения
  userId: number; // Внешний ключ для связи с пользователем
  user: UserFourssan; // Связь с пользователем
  createdAt: Date | string; // Дата создания, по умолчанию now()
  repeatType?: string; // Опционально, тип повторения: "none", "daily", "weekly", "monthly", "yearly"
  repeatUntil?: Date | string; // Опционально, дата, до которой повторять
  isCompleted: boolean; // По умолчанию false
  isRecurring: boolean; // По умолчанию false
  referralId?: number;
  recurringFlag?: string;
  usersId: number[];
}
