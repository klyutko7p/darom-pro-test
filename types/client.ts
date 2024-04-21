interface Client {
    id: number;
    fio: string | null;
    phoneNumber: string;
    password: string;
    oldPassword: string | null;
    accessPassword: string | null;
    role: string;
    balance: number;
    created_at: Date | string;
}