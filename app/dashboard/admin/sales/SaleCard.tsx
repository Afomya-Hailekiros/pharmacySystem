"use client";

import { Sale } from "./types";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

interface SaleCardProps {
  sale: Sale;
  fetchSales: () => void;
  setSelectedSale: (sale: Sale) => void;
  setShowModal: (show: boolean) => void;
  jwt: string | null;
}

export default function SaleCard({
  sale,
  fetchSales,
  setSelectedSale,
  setShowModal,
  jwt,
}: SaleCardProps) {
  const { toast } = useToast();

  const handleEdit = () => {
    setSelectedSale(sale);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!jwt) return;
    if (!confirm("Are you sure you want to delete this sale?")) return;

    try {
      await axios.delete(
        `https://pharmacy-management-9ls6.onrender.com/api/v1/sales/${sale._id}`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      toast({ title: "✅ Sale deleted successfully!" });
      fetchSales();
    } catch (err: any) {
      toast({
        title: "❌ Failed to delete sale",
        description: err?.response?.data?.message || "",
        variant: "destructive",
      });
    }
  };

  // ✅ Calculated fields
  const sellingPrice = sale.sellingPrice || sale.medicineInfo.retailPrice || 0;
  const discount = sale.discount || 0;
  const priceAfterDiscount = Math.max(sellingPrice - discount, 0);
  const total = priceAfterDiscount * sale.quantity;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {sale.medicineInfo.brandName}{" "}
          {sale.medicineInfo.genericInfo?.name && `- ${sale.medicineInfo.genericInfo.name}`}
        </h3>
        <p className="text-sm text-gray-600">
          Batch: {sale.medicineInfo.batchNo || "N/A"} | Category:{" "}
          {sale.medicineInfo.categoryInfo?.name || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Quantity: {sale.quantity} | Status:{" "}
          <span
            className={`font-medium ${
              sale.status === "completed"
                ? "text-green-600"
                : sale.status === "pending"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {sale.status}
          </span>
        </p>

        {/* ✅ Payment Method added here */}
        <p className="text-sm text-gray-600">
          Payment Method:{" "}
          <span className="font-medium text-blue-600">
            {sale.paymentMethod || "Cash"}
          </span>
        </p>
      </div>

      <div className="mb-2 text-gray-800">
        <p>Selling Price: ${sellingPrice.toFixed(2)}</p>
        <p>Discount: ${discount.toFixed(2)}</p>
        <p>Price After Discount: ${priceAfterDiscount.toFixed(2)}</p>
        <p className="font-bold">Total: ${total.toFixed(2)}</p>
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="flex items-center gap-1"
        >
          <Edit className="w-4 h-4" /> Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </Button>
      </div>
    </div>
  );
}
