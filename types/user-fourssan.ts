interface UserFourssan {
    id: number;
    name: string;
    password: string;
    status?: string; // Опционально, по умолчанию "official"
    pvz: string;
    pvzAccess: string[];
    companyAccess: string[];
    role: string; // По умолчанию "pvzEmployer"
    createdAt: Date;
    Task?: Task[];
    error: string; // Опционально, связь с задачами
  }
  