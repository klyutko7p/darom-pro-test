interface AutoType {
  id: number;
  name: string;
}

interface AutoRow {
  id: number;
  autoTypeId: number;
  autoType: AutoType;
  state: string;
  nameOfEquipment: string;
  updatedUserId: number;
  updatedUser: User;
  created_at: Date | string;
  updated_at: Date | string;
  deleted?: Date | string;
}

interface DecommissionedAutoRow {
  id: number;
  reason: string;
  decommissionDate: Date | string;
  decommissionedUserId: number;
  decommissionedUser: User;
  autoRowId: number;
  autoRow: AutoRow;
  deleted?: Date | string;
}
