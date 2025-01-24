interface Task {
  id: number;
  description: string;
  responsible: string;
  deadline: Date | number;
  notation: string;
  done?: Date | number;
  supportingDocuments?: string[];
  checked?: Date | number;
  refinement?: Date | number;
  createdUser: string;
  checkedUser: string;
  created_at: Date | number;
  deleted?: Date | number;
  img?: string;
}
