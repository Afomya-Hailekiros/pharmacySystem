"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Pill,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Medicine {
  _id: string;
  brandName: string;
  categoryInfo?: { name: string };
  genericInfo?: { name: string };
  dosageInfo?: { name: string };
  uomInfo?: { name: string };
  batchNo?: string;
  expiryDate?: string;
  quantity?: number;
  totalPrice?: number;
}

export default function MedicinesPage() {
  const { toast } = useToast();
  const [jwt, setJwt] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  const MEDICINE_URL =
    "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";

  // ✅ Load JWT from cookies
  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      for (const cookie of cookies) {
        const [key, ...rest] = cookie.split("=");
        if (key === name) return decodeURIComponent(rest.join("="));
      }
      return undefined;
    };
    setJwt(getCookie("jwt") || null);
  }, []);

  // ✅ Fetch Medicines
  const fetchMedicines = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(MEDICINE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setMedicines(res.data.data || []);
      setFiltered(res.data.data || []);
      console.log("✅ Medicines fetched:", res.data.data);
    } catch (err) {
      console.error("❌ Error fetching medicines:", err);
      toast({
        title: "⚠️ Error Fetching Medicines",
        description:
          "Failed to fetch medicines. Please check your connection or token.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (jwt) fetchMedicines();
  }, [jwt]);

  // ✅ Filter Logic
  const handleFilter = (type: string) => {
    setFilterType(type);
    const now = new Date();
    if (type === "low") {
      setFiltered(medicines.filter((m) => (m.quantity ?? 0) < 50));
    } else if (type === "expired") {
      setFiltered(medicines.filter((m) => new Date(m.expiryDate || "") < now));
    } else if (type === "soon") {
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);
      setFiltered(
        medicines.filter(
          (m) =>
            new Date(m.expiryDate || "") > now &&
            new Date(m.expiryDate || "") <= nextMonth
        )
      );
    } else {
      setFiltered(medicines);
    }
  };
const router = useRouter();

  // ✅ Add Medicine Toast + Animation
  const handleAddMedicine = () => {
  toast({
    title: "🧾 Add New Medicine",
    description: "Opening medicine form...",
  });

  setTimeout(() => {
    router.push("/dashboard/admin/medicines/Form");
  }, 800); // small delay for the toast animation
};

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen rounded-xl">
      <Toaster />

      {/* Header */}
      <motion.div
        className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <Pill className="h-7 w-7 text-blue-600" /> Medicines Dashboard
        </h1>
        <Button
          onClick={handleAddMedicine}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Medicine
        </Button>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        className="flex flex-wrap gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={() => handleFilter("low")}
          className={`transition ${
            filterType === "low"
              ? "bg-yellow-500 text-white"
              : "bg-white border text-yellow-600 hover:bg-yellow-100"
          }`}
        >
          <AlertTriangle className="mr-2 h-4 w-4" /> Low Stock
        </Button>
        <Button
          onClick={() => handleFilter("expired")}
          className={`transition ${
            filterType === "expired"
              ? "bg-red-500 text-white"
              : "bg-white border text-red-600 hover:bg-red-100"
          }`}
        >
          <XCircle className="mr-2 h-4 w-4" /> Expired
        </Button>
        <Button
          onClick={() => handleFilter("soon")}
          className={`transition ${
            filterType === "soon"
              ? "bg-orange-500 text-white"
              : "bg-white border text-orange-600 hover:bg-orange-100"
          }`}
        >
          <Clock className="mr-2 h-4 w-4" /> To Be Expired
        </Button>
        <Button
          onClick={() => handleFilter("all")}
          className={`transition ${
            filterType === "all"
              ? "bg-blue-500 text-white"
              : "bg-white border text-blue-600 hover:bg-blue-100"
          }`}
        >
          <Package className="mr-2 h-4 w-4" /> All
        </Button>
      </motion.div>

      {/* Medicine List */}
      <motion.div
        className="bg-white rounded-xl shadow-md p-6 border border-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-700">
              {filterType === "low"
                ? "⚠️ Low Stock Medicines"
                : filterType === "expired"
                ? "❌ Expired Medicines"
                : filterType === "soon"
                ? "⏳ To Be Expired Medicines"
                : "💊 All Medicines"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No medicines found for this category.
              </p>
            ) : (
              <motion.div
                layout
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filtered.map((med, i) => (
                  <motion.div
                    key={med._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 border rounded-lg bg-gradient-to-br from-white to-blue-50 shadow hover:shadow-lg transition-all duration-200"
                  >
                    <h2 className="font-semibold text-blue-900 text-lg">
                      {med.brandName}
                    </h2>
                    <p className="text-sm text-blue-800">
                      {med.genericInfo?.name && `Generic: ${med.genericInfo.name}`}
                      {med.categoryInfo?.name && ` | ${med.categoryInfo.name}`}
                      {med.dosageInfo?.name && ` | ${med.dosageInfo.name}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Batch: {med.batchNo || "-"} | Qty:{" "}
                      <span
                        className={`font-bold ${
                          (med.quantity ?? 0) < 50
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {med.quantity}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Exp:{" "}
                      {med.expiryDate
                        ? new Date(med.expiryDate).toLocaleDateString()
                        : "-"}
                    </p>
                    {med.totalPrice && (
                      <p className="text-sm text-green-600 font-semibold">
                        💰 ${med.totalPrice}
                      </p>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
