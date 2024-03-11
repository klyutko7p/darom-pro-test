interface IBalance {
    id: number;
    pvz: string;
    sum: string;      
    issued:  Date | number | string | null;    
    received:  Date | number | string | null;
    createdUser: string;
    receivedUser: string;
    receivedUser2: string;
    notation: string;
    recipient: string;
}