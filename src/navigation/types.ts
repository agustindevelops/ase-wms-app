export type MainStackParamList = {
  MainMenu: undefined;
  WarehouseLevel: {
    warehouseId: string;
    warehouseName: string;
    level: number;
    parentLocationUnitId?: string;
    parentName?: string;
    /** Names above the current unit: warehouse, then each drilled parent. */
    ancestorNames: string[];
  };
  WarehouseForm: {
    warehouseId: string;
    initialName?: string;
  };
  LocationUnitForm: {
    warehouseId: string;
    warehouseName: string;
    level: number;
    parentLocationUnitId?: string;
    locationUnitId?: string;
    initialName?: string;
    initialLabel?: string;
  };
  PrintLocationLabel: {
    warehouseId: string;
    locationUnitId: string;
    locationName: string;
  };
  PrintPoC: undefined;
  ImgUploadPoC: undefined;
};
