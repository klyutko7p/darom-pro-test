interface Client {
    id: number;
    fio: string | null;
    phoneNumber: string;
    password: string;
    oldPassword: string | null;
    accessPassword: string | null;
    role: string;
    created_at: Date | string;
}