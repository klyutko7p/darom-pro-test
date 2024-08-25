interface IEquipmentRow {
  id: number;
  pvzId: number;
  pvz: PVZ;
  nameOfEquipment: string;
  state: string;
  updatedUserId: number;
  updatedUser: User;
  created_at: Date | string;
  updated_at: Date | string;
  deleted?: Date | string;
}

interface IDecommissionedEquipmentRow {
  id: number;
  reason: string;
  decommissionDate: Date | string;
  decommissionedUserId: number;
  decommissionedUser: User;
  equipmentRowId: number;
  equipmentRow: IEquipmentRow;
  deleted?: Date | string;
}
