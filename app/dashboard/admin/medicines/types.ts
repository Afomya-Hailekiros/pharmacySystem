export interface Option {
  _id: string;
  name: string;
}

export interface DosageOption {
  name: any;
  _id: string;
  dosageInfo: string;
}

export interface Medicine {
  _id?: string;
  brandName: string;
  batchNo?: string | null;
  quantity: number;
  unitPrice: number;
  retailPrice: number;    // Selling price
  stockAlert: number;
  packSize?: string;
  itemStrength?: string;
  origin?: string;
  expiryDate?: string;
  categoryInfo?: Option | null;
  genericInfo?: Option | null;
  dosageInfo?: DosageOption | null;
  uomInfo?: Option | null;
}