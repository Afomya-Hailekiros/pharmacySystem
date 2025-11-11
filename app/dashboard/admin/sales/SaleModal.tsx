"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useState, useMemo, useEffect } from "react";
import { Sale, MedicineOption } from "./types";

interface SaleModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  sale: Sale | null;
  setSale: React.Dispatch<React.SetStateAction<Sale | null>>;
  medicines: MedicineOption[];
  fetchSales: () => void;
  jwt: string | null;
}

export default function SaleModal({
  show,
  setShow,
  sale,
  setSale,
  medicines,
  fetchSales,
  jwt,
}: SaleModalProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [previousQuantity, setPreviousQuantity] = useState<number>(sale?.quantity || 0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    if (sale) setPreviousQuantity(sale.quantity || 0);
  }, [sale]);

  // 🔹 Auto-calculate totals
  useEffect(() => {
    const discountValue = sale?.discount || 0;
    const qty = sale?.quantity || 0;
    const calcPrice = Math.max(sellingPrice - discountValue, 0);
    setCalculatedPrice(calcPrice);
    setTotalPrice(calcPrice * qty);
  }, [sellingPrice, sale?.discount, sale?.quantity]);

  const filteredMedicines = useMemo(() => {
    const lower = filter.toLowerCase();
    return medicines.filter(
      (m) =>
        m.brandName.toLowerCase().includes(lower) ||
        m.genericInfo?.name?.toLowerCase().includes(lower)
    );
  }, [filter, medicines]);

  if (!sale) return null;

  const handleChange = (name: keyof Sale, value: any) => {
    setSale((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleMedicineSelect = async (med: MedicineOption) => {
    handleChange("medicineInfo", med);
    handleChange("medicine", med._id);
    setFilter(med.brandName);

    try {
      const res = await axios.get(
        `https://pharmacy-management-9ls6.onrender.com/api/v1/medicines/${med._id}`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      const medData = res.data.data;
      const selling = medData?.retailPrice || medData?.sellingPrice || 0;
      setSellingPrice(selling);
    } catch {
      toast({
        title: "❌ Failed to fetch selling price",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt || !sale.medicineInfo._id) return;

    try {
      const medicineRes = await axios.get(
        `https://pharmacy-management-9ls6.onrender.com/api/v1/medicines/${sale.medicineInfo._id}`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      const latestMedicine = medicineRes.data.data;
      const currentTotalQty = latestMedicine ? latestMedicine.quantity ?? 0 : 0;

      let newTotalQty = currentTotalQty;
      if (sale._id) {
        newTotalQty = currentTotalQty - (sale.quantity - previousQuantity);
      } else {
        newTotalQty = currentTotalQty - sale.quantity;
      }

      await axios.patch(
        `https://pharmacy-management-9ls6.onrender.com/api/v1/medicines/${sale.medicineInfo._id}`,
        { quantity: newTotalQty },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      const payload = {
        medicine: sale.medicineInfo._id,
        quantity: sale.quantity,
        discount: sale.discount || 0,
        status: sale.status,
        soldBy: sale.soldByInfo._id,
        saleDate: sale.saleDate,
        paymentMethod: sale.paymentMethod || "cash",
        sellingPrice,
      };

      if (sale._id) {
        await axios.patch(
          `https://pharmacy-management-9ls6.onrender.com/api/v1/sales/${sale._id}`,
          payload,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        toast({ title: "✅ Sale updated successfully!" });
      } else {
        await axios.post(
          `https://pharmacy-management-9ls6.onrender.com/api/v1/sales`,
          payload,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        toast({ title: "✅ Sale added successfully!" });
      }

      setShow(false);
      fetchSales();
    } catch (err: any) {
      toast({
        title: "❌ Failed to save sale",
        description: err?.response?.data?.message || "",
        variant: "destructive",
      });
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 border rounded-2xl shadow-xl w-full max-w-3xl p-6 sm:p-8 mt-20"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-black dark:text-white text-center">
              {sale._id ? "Edit Sale" : "Add New Sale"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Medicine Search */}
              <div className="col-span-1 md:col-span-2">
                <label className="block mb-1 font-medium text-black dark:text-white">Medicine</label>
                <Input
                  placeholder="Search medicine..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring rounded-md mb-2"
                />
                <div className="max-h-48 overflow-auto border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((m) => (
                      <div
                        key={m._id}
                        onClick={() => handleMedicineSelect(m)}
                        className="p-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 dark:text-white"
                      >
                        {m.brandName} {m.genericInfo?.name && `- ${m.genericInfo.name}`}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 dark:text-gray-400">No medicines found</div>
                  )}
                </div>
              </div>

              <InputField
                label="Quantity"
                type="number"
                value={sale.quantity}
                onChange={(v) => handleChange("quantity", Number(v))}
              />

              <InputField
                label="Discount"
                type="number"
                value={sale.discount || 0}
                onChange={(v) => handleChange("discount", Number(v))}
              />

              <InputField label="Selling Price" type="number" value={sellingPrice} onChange={() => {}} />
              <InputField label="Price After Discount" type="number" value={calculatedPrice} onChange={() => {}} />
              <InputField label="Total" type="number" value={totalPrice} onChange={() => {}} />

              <SelectField
                label="Status"
                options={[
                  { _id: "pending", name: "Pending" },
                  { _id: "completed", name: "Completed" },
                  { _id: "cancelled", name: "Cancelled" },
                ]}
                value={sale.status}
                onChange={(v) => handleChange("status", v as Sale["status"])}
              />

              {/* Payment Method */}
              <SelectField
                label="Payment Method"
                options={[
                  { _id: "cash", name: "Cash" },
                  { _id: "credit", name: "Credit" },
                  { _id: "mobile", name: "Transfer" },
                ]}
                value={sale.paymentMethod || "cash"}
                onChange={(v) => handleChange("paymentMethod", v)}
              />

              <InputField
                label="Sold By"
                value={sale.soldByInfo.userName}
                onChange={(v) =>
                  handleChange("soldByInfo", { ...sale.soldByInfo, userName: v })
                }
              />

              <InputField
                label="Date"
                type="date"
                value={sale.saleDate.split("T")[0]}
                onChange={(v) => handleChange("saleDate", v)}
              />

              <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setShow(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {sale._id ? "Update" : "Save Sale"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ✅ Reusable Input Components
const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}> = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block mb-1 font-medium text-black dark:text-white">{label}</label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring rounded-md"
      readOnly={["Selling Price", "Price After Discount", "Total"].includes(label)}
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  options: { _id: string; name: string }[];
  value?: string;
  onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium text-black dark:text-white">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring rounded-md w-full p-2"
    >
      {options.map((opt) => (
        <option key={opt._id} value={opt._id}>
          {opt.name}
        </option>
      ))}
    </select>
  </div>
);
