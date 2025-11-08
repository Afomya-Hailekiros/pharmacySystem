// types.ts (or in your SalesPage.tsx if you prefer)
export interface MedicineOption {
  _id: string;
  brandName: string;
  batchNo?: string;
  quantity: number;
  unitPrice: number;      // purchase price
  retailPrice: number;    // selling price
  stockAlertQuantity?: number;
  genericInfo?: { _id: string; name: string };
  uomInfo?: { _id: string; name: string };
  dosageInfo?: { _id: string; name: string };
  categoryInfo?: { _id: string; name: string };
}

export interface Sale {
  sellingPrice: number;
  _id?: string;
  medicineInfo: MedicineOption;
  medicine: string; // medicine _id
  quantity: number;
  discount?: number;
  totalRevenuePrice?: number; // backend calculated
  profit?: number;            // backend calculated
  status: "pending" | "completed" | "cancelled";
  soldByInfo: {
    _id: string;
    userName: string;
    email?: string;
    role?: string;
  };
  soldBy: string; // user _id
  saleDate: string;
}
