"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Pill,
  Package,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Medicine {
  _id: string;
  brandName: string;
  categoryInfo?: { name: string };
  genericInfo?: { name: string };
  dosageInfo?: { dosageInfo: any; name: string };
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
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const MEDICINE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";

  // Load JWT from cookies
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

  // Fetch Medicines
  const fetchMedicines = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(MEDICINE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setMedicines(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch (err) {
      console.error("❌ Error fetching medicines:", err);
      toast({
        title: "⚠️ Error Fetching Medicines",
        description: "Failed to fetch medicines. Please check your token.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (jwt) fetchMedicines();
  }, [jwt]);

  // Delete Medicine with Toast Confirmation
  // Delete Medicine
const handleDelete = async (id: string) => {
  if (!confirm("⚠️ Are you sure you want to delete this medicine? This action cannot be undone.")) return;

  const getCookie = (name: string) => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) return decodeURIComponent(value);
    }
    return undefined;
  };

  try {
    const token = getCookie("jwt");
    await axios.delete(`https://pharmacy-management-9ls6.onrender.com/api/v1/medicines/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    toast({
      title: "✅ Deleted",
      description: "Medicine deleted successfully.",
      variant: "success",
    });

    setFiltered((prev) => prev.filter((m) => m._id !== id));
  } catch (err: any) {
    if (err.response?.status === 401) {
      toast({
        title: "⚠️ Unauthorized",
        description: "Please log in again.",
        variant: "destructive",
      });
      router.push("/login");
    } else {
      toast({
        title: "⚠️ Error",
        description: "Failed to delete medicine.",
        variant: "destructive",
      });
    }
  }
};



  // Edit Medicine toast
  const handleEdit = (id: string) => {
    toast({
      title: "✏️ Edit Medicine",
      description: "Redirecting to edit form...",
    });
    setTimeout(() => router.push(`/dashboard/admin/medicines/Form?id=${id}`), 800);
  };

  // Filter Logic
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

  const handleAddMedicine = () => {
    toast({ title: "🧾 Add New Medicine", description: "Opening form..." });
    setTimeout(() => router.push("/dashboard/admin/medicines/Form"), 800);
  };

  // Search Logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      handleFilter(filterType);
      return;
    }
    const lower = searchTerm.toLowerCase();
    setFiltered(
      medicines.filter(
        (m) =>
          m.brandName?.toLowerCase().includes(lower) ||
          m.genericInfo?.name?.toLowerCase().includes(lower) ||
          m.categoryInfo?.name?.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, filterType]);

  // Card Color Logic
  const getCardColor = (expiryDate?: string) => {
    if (!expiryDate) return "from-white to-blue-50";
    const now = new Date();
    const exp = new Date(expiryDate);
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    if (exp < now) return "from-red-100 to-red-200 border-red-400";
    if (exp >= now && exp <= nextMonth)
      return "from-yellow-100 to-yellow-200 border-yellow-400";
    return "from-white to-blue-50 border-blue-100";
  };

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster />

      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <Pill className="h-7 w-7 text-blue-600" /> Medicines Dashboard
        </h1>
        <Button
          onClick={handleAddMedicine}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" /> Add Medicine
        </Button>
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search by brand, category, or generic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-blue-200 focus:ring-blue-400 text-zinc-950"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ key: "low", label: "Low Stock", icon: <AlertTriangle /> },
            { key: "expired", label: "Expired", icon: <XCircle /> },
            { key: "soon", label: "To Be Expired", icon: <Clock /> },
            { key: "all", label: "All", icon: <Package /> }
          ].map(({ key, label, icon }) => (
            <Button
              key={key}
              onClick={() => handleFilter(key)}
              className={`transition flex items-center gap-2 ${
                filterType === key
                  ? "bg-blue-500 text-white"
                  : "bg-white border text-blue-600 hover:bg-blue-100"
              }`}
            >
              {icon} <span>{label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Medicine Cards */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full py-6">
            No medicines found.
          </p>
        ) : (
          filtered.map((med, i) => (
            <motion.div
              key={med._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 border rounded-xl bg-gradient-to-br ${getCardColor(
                med.expiryDate
              )} shadow hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-semibold text-blue-900 text-lg">
                    {med.brandName}
                  </h2>
                  <p className="text-sm text-blue-800 mt-1">
                    {med.genericInfo?.name && `Generic: ${med.genericInfo.name}`}
                    {med.categoryInfo?.name && ` | ${med.categoryInfo.name}`}
                    {med.dosageInfo?.name && ` | ${med.dosageInfo.dosageInfo}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(med._id)}
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(med._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Batch: {med.batchNo || "-"} | Qty:{" "}
                <span
                  className={`font-bold ${
                    (med.quantity ?? 0) < 50 ? "text-red-600" : "text-green-600"
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
                <p className="text-sm text-green-600 font-semibold mt-1">
                  💰 ${med.totalPrice}
                </p>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
