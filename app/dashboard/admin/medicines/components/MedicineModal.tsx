"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputField } from "./InputField";
import { SelectField } from "./SelectField";
import { Medicine, Option, DosageOption } from "../types";

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine;
  categories: Option[];
  generics: Option[];
  dosages: DosageOption[];
  uoms: Option[];
  onChange: (field: keyof Medicine, value: any) => void;
  onSave: () => void;
}

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  medicine,
  categories,
  generics,
  dosages,
  uoms,
  onChange,
  onSave,
}) => {
  const handleNumberChange = (field: keyof Medicine, value: string) => {
    const num = Number(value);
    onChange(field, isNaN(num) || num < 0 ? 0 : num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-3xl w-full
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-gray-100
          max-h-[90vh] overflow-auto
          md:max-h-auto md:overflow-visible
          rounded-lg
        "
      >
        {/* Header */}
        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 md:static">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Add / Edit Medicine
          </DialogTitle>
        </DialogHeader>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <InputField
            label="Brand Name"
            value={medicine.brandName ?? ""}
            onChange={(v) => onChange("brandName", v)}
          />
          <InputField
            label="Batch No"
            value={medicine.batchNo ?? ""}
            onChange={(v) => onChange("batchNo", v)}
          />
          <InputField
            label="Quantity"
            type="number"
            value={medicine.quantity ?? ""}
            onChange={(v) => handleNumberChange("quantity", v)}
          />
          <InputField
            label="Purchase Price"
            type="number"
            value={medicine.unitPrice ?? ""}
            onChange={(v) => handleNumberChange("unitPrice", v)}
          />
          <InputField
            label="Selling Price"
            type="number"
            value={medicine.retailPrice ?? ""}
            onChange={(v) => handleNumberChange("retailPrice", v)}
          />
          <InputField
            label="Stock Alert"
            type="number"
            value={medicine.stockAlert ?? ""}
            onChange={(v) => handleNumberChange("stockAlert", v)}
          />
          <InputField
            label="Pack Size"
            value={medicine.packSize ?? ""}
            onChange={(v) => onChange("packSize", v)}
          />
          <InputField
            label="Item Strength"
            value={medicine.itemStrength ?? ""}
            onChange={(v) => onChange("itemStrength", v)}
          />
          <InputField
            label="Origin"
            value={medicine.origin ?? ""}
            onChange={(v) => onChange("origin", v)}
          />
          <InputField
            label="Expiry Date"
            type="date"
            value={medicine.expiryDate ?? ""}
            onChange={(v) => onChange("expiryDate", v)}
          />

          {/* Category */}
          <SelectField
            label="Category"
            options={categories}
            value={medicine.categoryInfo?._id ?? ""}
            onChange={(id) =>
              onChange(
                "categoryInfo",
                categories.find((c) => c._id === id) || { _id: "", name: "" }
              )
            }
          />

          {/* Generic */}
          <SelectField
            label="Generic"
            options={generics}
            value={medicine.genericInfo?._id ?? ""}
            onChange={(id) =>
              onChange(
                "genericInfo",
                generics.find((g) => g._id === id) || { _id: "", name: "" }
              )
            }
          />

          {/* Dosage */}
          <SelectField
            label="Dosage"
            options={dosages.map((d) => ({ _id: d._id, name: d.name }))}
            value={medicine.dosageInfo?._id ?? ""}
            onChange={(id) =>
              onChange(
                "dosageInfo",
                dosages.find((d) => d._id === id) || { _id: "", name: "" }
              )
            }
          />

          {/* UOM */}
          <SelectField
            label="UOM"
            options={uoms}
            value={medicine.uomInfo?._id ?? ""}
            onChange={(id) =>
              onChange(
                "uomInfo",
                uoms.find((u) => u._id === id) || { _id: "", name: "" }
              )
            }
          />
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-gray-900 z-10 pt-4 md:static md:pt-0">
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
