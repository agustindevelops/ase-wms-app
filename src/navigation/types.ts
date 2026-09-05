export type CatalogStackParamList = {
  CatalogMenu: { warehouseId: string };
  CatalogPhoto: {
    warehouseId: string;
    itemId?: string;
  };
  CatalogItemList: {
    warehouseId: string;
    mode: 'add' | 'move' | 'remove' | 'label' | 'edit';
  };
  CatalogScanItem: {
    warehouseId: string;
    mode: 'move' | 'remove' | 'edit';
  };
  CatalogDetails: {
    warehouseId: string;
    photoFileIds: string[];
    itemId?: string;
  };
  CatalogPrintQr: {
    warehouseId: string;
    itemId: string;
    itemName: string;
    qrCodeId?: string | null;
    offerLocation?: boolean;
  };
  CatalogPlaceItem: {
    warehouseId: string;
    itemId: string;
    itemName: string;
    printed: boolean;
  };
  CatalogGlue: {
    warehouseId: string;
    itemId: string;
    itemName: string;
  };
  CatalogScanLocation: {
    warehouseId: string;
    itemId: string;
    itemName: string;
    doneTarget?: 'hub' | 'main';
  };
};

export type WarehouseStackParamList = {
  WarehouseLevel: {
    warehouseId: string;
    warehouseName: string;
    level: number;
    parentLocationUnitId?: string;
    parentName?: string;
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
  LinkLocationQr: {
    warehouseId: string;
    locationUnitId: string;
    locationName: string;
  };
};

export type OrderStackParamList = {
  OrderList: {
    mode: 'pickup' | 'return';
  };
  OrderDetail: {
    orderId: string;
    mode: 'pickup' | 'return';
  };
  OrderScanItem: {
    orderId: string;
    mode: 'pickup' | 'return';
  };
  OrderQty: {
    orderId: string;
    mode: 'pickup' | 'return';
    itemId: string;
    itemName: string;
    remaining: number;
    locationLabel?: string | null;
  };
  OrderScanLocation: {
    orderId: string;
    itemId: string;
    itemName: string;
    qty: number;
    locationLabel?: string | null;
  };
  OrderIssue: {
    orderId: string;
    itemId: string;
    itemName: string;
    remaining: number;
    mode: 'pickup' | 'return';
  };
};

export type MainTabParamList = {
  Dashboard: undefined;
  CatalogTab: undefined;
  WarehouseTab: undefined;
  PickupTab: undefined;
  ReturnTab: undefined;
};

export type RootMainParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  ActivityList: { day?: string };
  ReportIssueFind: { warehouseId: string };
  ReportIssueScan: { warehouseId: string };
  ReportIssueForm: {
    warehouseId: string;
    itemId: string;
    itemName: string;
  };
};

/** @deprecated Prefer nested stack param lists; kept for gradual migration. */
export type MainStackParamList = CatalogStackParamList &
  WarehouseStackParamList &
  OrderStackParamList &
  RootMainParamList & {
    MainMenu: undefined;
  };
