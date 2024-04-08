interface Task {
    id: number;
    description: string;
    notation: string;
    done: Date | number | string | null;
    checked: Date | number | string | null;
}